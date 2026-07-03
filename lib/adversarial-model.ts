// Browser-side inference and adversarial-attack engine for /lab/adversarial.
//
// It loads the tiny MLP trained offline (scripts/train-mnist.mjs), runs the
// forward pass, and — crucially — reproduces the backward pass all the way to
// the *input pixels*. That input gradient is what a gradient-based evasion
// attack needs: FGSM nudges every pixel by ε in the direction that most
// increases the loss (sign of the gradient); PGD iterates that with clipping.
// Everything runs locally; no model or pixel ever leaves the page.

export interface ModelWeights {
  arch: [number, number, number];
  testAccuracy: number;
  w1: { b64: string; scale: number };
  b1: { b64: string; scale: number };
  w2: { b64: string; scale: number };
  b2: { b64: string; scale: number };
  samples: Array<{ label: number; b64: string }>;
}

export interface Sample {
  label: number;
  /** 784 pixel intensities in [0,1], row-major 28×28. */
  pixels: Float32Array;
}

export interface Forward {
  /** Softmax probabilities over the ten classes. */
  probs: Float32Array;
  /** Argmax class. */
  pred: number;
  /** Confidence of the argmax class in [0,1]. */
  conf: number;
}

export interface AttackResult {
  /** Adversarial image, 784 values in [0,1]. */
  adversarial: Float32Array;
  /** Signed perturbation added (adv − original), for the heatmap. */
  perturbation: Float32Array;
  /** L∞ norm of the perturbation (== ε when the attack saturates). */
  linf: number;
  /** L2 norm of the perturbation. */
  l2: number;
  original: Forward;
  adversarialForward: Forward;
  /** True once the predicted class differs from the clean prediction. */
  flipped: boolean;
}

function decodeInt8(b64: string, scale: number): Float32Array {
  const bin = atob(b64);
  const out = new Float32Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    // Reinterpret the byte as signed int8, then dequantise.
    const byte = bin.charCodeAt(i);
    const signed = byte < 128 ? byte : byte - 256;
    out[i] = signed * scale;
  }
  return out;
}

function decodeUint8(b64: string): Float32Array {
  const bin = atob(b64);
  const out = new Float32Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) / 255;
  return out;
}

function softmax(z: Float32Array): Float32Array {
  let max = -Infinity;
  for (let i = 0; i < z.length; i++) if (z[i] > max) max = z[i];
  const out = new Float32Array(z.length);
  let sum = 0;
  for (let i = 0; i < z.length; i++) {
    out[i] = Math.exp(z[i] - max);
    sum += out[i];
  }
  for (let i = 0; i < z.length; i++) out[i] /= sum;
  return out;
}

export class AdversarialModel {
  readonly in: number;
  readonly hid: number;
  readonly out: number;
  readonly testAccuracy: number;
  readonly samples: Sample[];

  private W1: Float32Array;
  private b1: Float32Array;
  private W2: Float32Array;
  private b2: Float32Array;

  constructor(weights: ModelWeights) {
    [this.in, this.hid, this.out] = weights.arch;
    this.testAccuracy = weights.testAccuracy;
    this.W1 = decodeInt8(weights.w1.b64, weights.w1.scale);
    this.b1 = decodeInt8(weights.b1.b64, weights.b1.scale);
    this.W2 = decodeInt8(weights.w2.b64, weights.w2.scale);
    this.b2 = decodeInt8(weights.b2.b64, weights.b2.scale);
    this.samples = weights.samples.map((s) => ({ label: s.label, pixels: decodeUint8(s.b64) }));
  }

  /** Forward pass, caching hidden activations for a subsequent backward pass. */
  private run(x: Float32Array) {
    const { in: IN, hid: HID, out: OUT, W1, b1, W2, b2 } = this;
    const z1 = new Float32Array(HID);
    const a1 = new Float32Array(HID);
    for (let h = 0; h < HID; h++) {
      let s = b1[h];
      const base = h * IN;
      for (let i = 0; i < IN; i++) s += W1[base + i] * x[i];
      z1[h] = s;
      a1[h] = s > 0 ? s : 0;
    }
    const z2 = new Float32Array(OUT);
    for (let o = 0; o < OUT; o++) {
      let s = b2[o];
      const base = o * HID;
      for (let h = 0; h < HID; h++) s += W2[base + h] * a1[h];
      z2[o] = s;
    }
    const probs = softmax(z2);
    return { z1, a1, probs };
  }

  forward(x: Float32Array): Forward {
    const { probs } = this.run(x);
    let pred = 0;
    for (let o = 1; o < probs.length; o++) if (probs[o] > probs[pred]) pred = o;
    return { probs, pred, conf: probs[pred] };
  }

  /**
   * Gradient of the cross-entropy loss (against `target` label) w.r.t. every
   * input pixel. This is the same backprop the trainer used, stopped one layer
   * earlier — at the image instead of the weights.
   */
  inputGradient(x: Float32Array, target: number): Float32Array {
    const { in: IN, hid: HID, out: OUT, W1, W2 } = this;
    const { z1, a1, probs } = this.run(x);
    const dz2 = new Float32Array(OUT);
    for (let o = 0; o < OUT; o++) dz2[o] = probs[o] - (o === target ? 1 : 0);
    const dz1 = new Float32Array(HID);
    for (let h = 0; h < HID; h++) {
      let da = 0;
      for (let o = 0; o < OUT; o++) da += W2[o * HID + h] * dz2[o];
      dz1[h] = z1[h] > 0 ? da : 0;
    }
    const dx = new Float32Array(IN);
    for (let h = 0; h < HID; h++) {
      const d = dz1[h];
      if (d === 0) continue;
      const base = h * IN;
      for (let i = 0; i < IN; i++) dx[i] += W1[base + i] * d;
    }
    void a1;
    return dx;
  }

  /** Fast Gradient Sign Method — one step of size ε away from the true label. */
  fgsm(x: Float32Array, epsilon: number, trueLabel: number): AttackResult {
    const grad = this.inputGradient(x, trueLabel);
    const adv = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      const step = epsilon * Math.sign(grad[i]);
      adv[i] = Math.min(1, Math.max(0, x[i] + step));
    }
    return this.buildResult(x, adv, trueLabel);
  }

  /**
   * Projected Gradient Descent — the iterative, stronger cousin of FGSM. Takes
   * `steps` small steps and projects back into the ε-ball (L∞) each time.
   */
  pgd(x: Float32Array, epsilon: number, trueLabel: number, steps = 10): AttackResult {
    const alpha = Math.max(epsilon / steps, 0.01) * 1.25;
    const adv = new Float32Array(x);
    for (let t = 0; t < steps; t++) {
      const grad = this.inputGradient(adv, trueLabel);
      for (let i = 0; i < adv.length; i++) {
        let v = adv[i] + alpha * Math.sign(grad[i]);
        // Project into the L∞ ε-ball around x, then into valid pixel range.
        v = Math.min(x[i] + epsilon, Math.max(x[i] - epsilon, v));
        adv[i] = Math.min(1, Math.max(0, v));
      }
    }
    return this.buildResult(x, adv, trueLabel);
  }

  private buildResult(x: Float32Array, adv: Float32Array, trueLabel: number): AttackResult {
    const perturbation = new Float32Array(x.length);
    let linf = 0;
    let l2 = 0;
    for (let i = 0; i < x.length; i++) {
      const d = adv[i] - x[i];
      perturbation[i] = d;
      const ad = Math.abs(d);
      if (ad > linf) linf = ad;
      l2 += d * d;
    }
    const original = this.forward(x);
    const adversarialForward = this.forward(adv);
    void trueLabel;
    return {
      adversarial: adv,
      perturbation,
      linf,
      l2: Math.sqrt(l2),
      original,
      adversarialForward,
      flipped: adversarialForward.pred !== original.pred,
    };
  }
}

let cached: AdversarialModel | null = null;

/** Lazily loads and caches the model (weights are a separate ~100 KB chunk). */
export async function loadModel(): Promise<AdversarialModel> {
  if (cached) return cached;
  const weights = (await import('./mnist-weights.json')).default as unknown as ModelWeights;
  cached = new AdversarialModel(weights);
  return cached;
}
