// Trains the tiny MNIST classifier that powers /lab/adversarial.
//
// Deliberately dependency-free and readable: a 784→128→10 MLP (ReLU + softmax)
// trained with minibatch SGD in plain JavaScript. The point is not
// state-of-the-art accuracy — it's a real, inspectable model whose gradients we
// can reproduce by hand in the browser to run a genuine FGSM attack.
//
// Run once with:  node scripts/train-mnist.mjs
// It downloads MNIST to a temp dir (never committed) and writes the quantised
// weights + a few sample digits to lib/mnist-weights.json.

import { gunzipSync } from 'node:zlib';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = 'https://storage.googleapis.com/cvdf-datasets/mnist/';
const FILES = {
  trainImages: 'train-images-idx3-ubyte.gz',
  trainLabels: 'train-labels-idx1-ubyte.gz',
  testImages: 't10k-images-idx3-ubyte.gz',
  testLabels: 't10k-labels-idx1-ubyte.gz',
};

const CACHE = path.join(os.tmpdir(), 'mnist-cache');
const OUT = path.join(process.cwd(), 'lib', 'mnist-weights.json');

const IN = 784;
const HID = 128;
const OUTC = 10;

async function download(name) {
  await fs.mkdir(CACHE, { recursive: true });
  const cached = path.join(CACHE, name);
  try {
    return await fs.readFile(cached);
  } catch {
    process.stdout.write(`  downloading ${name}…\n`);
    const res = await fetch(BASE + name);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${name}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(cached, buf);
    return buf;
  }
}

function parseImages(gz) {
  const buf = gunzipSync(gz);
  const count = buf.readUInt32BE(4);
  const rows = buf.readUInt32BE(8);
  const cols = buf.readUInt32BE(12);
  const n = rows * cols;
  const data = new Float32Array(count * n);
  const raw = new Uint8Array(count * n);
  for (let i = 0; i < count * n; i++) {
    const v = buf[16 + i];
    raw[i] = v;
    data[i] = v / 255;
  }
  return { data, raw, count, n };
}

function parseLabels(gz) {
  const buf = gunzipSync(gz);
  const count = buf.readUInt32BE(4);
  const labels = new Uint8Array(count);
  for (let i = 0; i < count; i++) labels[i] = buf[8 + i];
  return labels;
}

// Gaussian sample (Box–Muller) for He initialisation.
function randn() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function main() {
  return (async () => {
    console.log('MNIST adversarial-lab trainer');
    const [triGz, trlGz, teiGz, telGz] = await Promise.all([
      download(FILES.trainImages),
      download(FILES.trainLabels),
      download(FILES.testImages),
      download(FILES.testLabels),
    ]);

    const train = parseImages(triGz);
    const trainLabels = parseLabels(trlGz);
    const test = parseImages(teiGz);
    const testLabels = parseLabels(telGz);
    console.log(`  train: ${train.count}  test: ${test.count}`);

    // Parameters (flat Float32Arrays).
    const W1 = new Float32Array(HID * IN);
    const b1 = new Float32Array(HID);
    const W2 = new Float32Array(OUTC * HID);
    const b2 = new Float32Array(OUTC);
    const s1 = Math.sqrt(2 / IN);
    const s2 = Math.sqrt(2 / HID);
    for (let i = 0; i < W1.length; i++) W1[i] = randn() * s1;
    for (let i = 0; i < W2.length; i++) W2[i] = randn() * s2;

    const z1 = new Float32Array(HID);
    const a1 = new Float32Array(HID);
    const z2 = new Float32Array(OUTC);
    const p = new Float32Array(OUTC);
    const dz2 = new Float32Array(OUTC);
    const dz1 = new Float32Array(HID);

    const N = train.count;
    const order = new Int32Array(N);
    for (let i = 0; i < N; i++) order[i] = i;

    const EPOCHS = 10;
    const BATCH = 64;
    const lr0 = 0.2;

    const forward = (x, off) => {
      for (let h = 0; h < HID; h++) {
        let s = b1[h];
        const base = h * IN;
        for (let i = 0; i < IN; i++) s += W1[base + i] * x[off + i];
        z1[h] = s;
        a1[h] = s > 0 ? s : 0;
      }
      let max = -Infinity;
      for (let o = 0; o < OUTC; o++) {
        let s = b2[o];
        const base = o * HID;
        for (let h = 0; h < HID; h++) s += W2[base + h] * a1[h];
        z2[o] = s;
        if (s > max) max = s;
      }
      let sum = 0;
      for (let o = 0; o < OUTC; o++) {
        p[o] = Math.exp(z2[o] - max);
        sum += p[o];
      }
      for (let o = 0; o < OUTC; o++) p[o] /= sum;
    };

    for (let epoch = 0; epoch < EPOCHS; epoch++) {
      // Shuffle.
      for (let i = N - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        const t = order[i];
        order[i] = order[j];
        order[j] = t;
      }
      const lr = lr0 * Math.pow(0.85, epoch);
      let loss = 0;

      for (let start = 0; start < N; start += BATCH) {
        const end = Math.min(start + BATCH, N);
        const scale = lr / (end - start);
        // Accumulate gradients across the minibatch, then step.
        const gW1 = new Float32Array(HID * IN);
        const gb1 = new Float32Array(HID);
        const gW2 = new Float32Array(OUTC * HID);
        const gb2 = new Float32Array(OUTC);

        for (let k = start; k < end; k++) {
          const idx = order[k];
          const off = idx * IN;
          const y = trainLabels[idx];
          forward(train.data, off);
          loss += -Math.log(Math.max(p[y], 1e-12));

          for (let o = 0; o < OUTC; o++) dz2[o] = p[o] - (o === y ? 1 : 0);
          for (let h = 0; h < HID; h++) {
            let da = 0;
            for (let o = 0; o < OUTC; o++) da += W2[o * HID + h] * dz2[o];
            dz1[h] = z1[h] > 0 ? da : 0;
          }
          for (let o = 0; o < OUTC; o++) {
            gb2[o] += dz2[o];
            const base = o * HID;
            for (let h = 0; h < HID; h++) gW2[base + h] += dz2[o] * a1[h];
          }
          for (let h = 0; h < HID; h++) {
            gb1[h] += dz1[h];
            const base = h * IN;
            const d = dz1[h];
            if (d === 0) continue;
            for (let i = 0; i < IN; i++) gW1[base + i] += d * train.data[off + i];
          }
        }

        for (let i = 0; i < W1.length; i++) W1[i] -= scale * gW1[i];
        for (let i = 0; i < b1.length; i++) b1[i] -= scale * gb1[i];
        for (let i = 0; i < W2.length; i++) W2[i] -= scale * gW2[i];
        for (let i = 0; i < b2.length; i++) b2[i] -= scale * gb2[i];
      }
      console.log(`  epoch ${epoch + 1}/${EPOCHS}  lr=${lr.toFixed(3)}  loss=${(loss / N).toFixed(4)}`);
    }

    // Evaluate.
    let correct = 0;
    for (let i = 0; i < test.count; i++) {
      forward(test.data, i * IN);
      let arg = 0;
      for (let o = 1; o < OUTC; o++) if (p[o] > p[arg]) arg = o;
      if (arg === testLabels[i]) correct++;
    }
    const acc = correct / test.count;
    console.log(`  test accuracy: ${(acc * 100).toFixed(2)}%`);

    // Quantise each tensor to int8 (per-tensor symmetric) and base64-encode.
    const quant = (arr) => {
      let maxAbs = 0;
      for (let i = 0; i < arr.length; i++) maxAbs = Math.max(maxAbs, Math.abs(arr[i]));
      const scale = maxAbs / 127 || 1;
      const q = new Int8Array(arr.length);
      for (let i = 0; i < arr.length; i++) q[i] = Math.max(-127, Math.min(127, Math.round(arr[i] / scale)));
      return { b64: Buffer.from(q.buffer).toString('base64'), scale };
    };

    // Pick clean sample digits: the first correctly-classified, high-confidence
    // test image for each class, so the preloaded gallery always demos well.
    const samples = [];
    const wantPerClass = 2;
    const perClass = new Array(OUTC).fill(0);
    for (let i = 0; i < test.count && samples.length < OUTC * wantPerClass; i++) {
      const y = testLabels[i];
      if (perClass[y] >= wantPerClass) continue;
      forward(test.data, i * IN);
      let arg = 0;
      for (let o = 1; o < OUTC; o++) if (p[o] > p[arg]) arg = o;
      if (arg !== y || p[y] < 0.9) continue;
      const px = new Uint8Array(IN);
      for (let j = 0; j < IN; j++) px[j] = test.raw[i * IN + j];
      samples.push({ label: y, b64: Buffer.from(px.buffer).toString('base64') });
      perClass[y]++;
    }
    samples.sort((a, b) => a.label - b.label);

    const out = {
      note: 'Tiny MLP for the adversarial-examples lab. Trained by scripts/train-mnist.mjs.',
      arch: [IN, HID, OUTC],
      testAccuracy: Number((acc * 100).toFixed(2)),
      w1: quant(W1),
      b1: quant(b1),
      w2: quant(W2),
      b2: quant(b2),
      samples,
    };
    await fs.writeFile(OUT, JSON.stringify(out));
    const size = (await fs.stat(OUT)).size;
    console.log(`  wrote ${OUT}  (${(size / 1024).toFixed(0)} KB, ${samples.length} samples)`);
  })();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
