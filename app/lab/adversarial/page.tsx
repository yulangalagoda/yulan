import type { Metadata } from 'next';
import AdversarialLab from '@/components/AdversarialLab';
import SiteChrome from '@/components/SiteChrome';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'Adversarial Examples Playground: FGSM in your browser · Yulan Galagoda',
  description:
    'Fool a neural network in real time. Add an imperceptible, gradient-crafted perturbation to a handwritten digit and watch the classifier flip, a live FGSM/PGD demo of the adversarial-ML attacks behind my research. Runs entirely client-side.',
  alternates: { canonical: `${SITE}/lab/adversarial` },
  openGraph: {
    title: 'Adversarial Examples Playground · Yulan Galagoda',
    description:
      'Live FGSM/PGD attack on a digit classifier, imperceptible perturbations that flip a neural network, right in your browser.',
    url: `${SITE}/lab/adversarial`,
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Adversarial Examples Playground',
      url: `${SITE}/lab/adversarial`,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any (runs in the browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
      description:
        'Interactive FGSM and PGD adversarial-example attacks on a handwritten-digit classifier, computed entirely client-side with a hand-written forward pass and input gradient.',
      keywords:
        'adversarial machine learning, FGSM, PGD, adversarial examples, evasion attack, neural network robustness, MNIST',
      author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Lab', item: `${SITE}/lab` },
        { '@type': 'ListItem', position: 3, name: 'Adversarial Examples', item: `${SITE}/lab/adversarial` },
      ],
    },
  ],
};

export default function AdversarialLabPage() {
  return (
    <>
      <SiteChrome />
      <main className="lab" id="main">
      <div className="container container--narrow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="/lab" className="lab__back">&larr; Lab</a>

        <header className="lab__head">
          <span className="eyebrow">Lab · Instrument 03</span>
          <h1 className="lab__title">Adversarial examples playground</h1>
          <p className="lab__lede">
            A neural network can be confidently, catastrophically wrong on an input that looks
            completely normal to you. Pick or draw a digit, then add a gradient-crafted perturbation
            and watch the classifier flip, while the image looks unchanged. This is the family of
            attack at the centre of my research; here it runs live in your browser.
          </p>
        </header>

        <div className="lab__panel lab__panel--wide">
          <AdversarialLab />
        </div>

        <section className="lab__prose">
          <h2>How it works</h2>
          <p>
            The classifier is a small multilayer perceptron, 784 inputs (one per pixel), a
            128-unit hidden layer, ten outputs, trained on MNIST to about 98% accuracy. It is
            deliberately tiny and dependency-free: the weights are a ~150&nbsp;KB file, and the
            forward pass is a few dozen lines of hand-written TypeScript. No TensorFlow.js, no ONNX
            runtime, nothing loaded from a CDN.
          </p>
          <p>
            The attack is the interesting part. <strong>FGSM</strong>, the Fast Gradient Sign
            Method, asks a simple question: for each pixel, which way should I nudge it to make the
            model <em>more</em> wrong? That direction is the sign of the gradient of the loss with
            respect to the input, so the whole attack is{' '}
            <code>x&prime; = x + ε · sign(∇ₓ&nbsp;loss)</code>. To compute ∇ₓ I run the same
            backpropagation the trainer used, but stop one layer early, at the image instead of the
            weights. <strong>PGD</strong> (Projected Gradient Descent) iterates that step and projects
            back into an ε-ball each time; it&rsquo;s slower but stronger, and it&rsquo;s the standard
            benchmark attack in the literature.
          </p>
          <p>
            Because the perturbation is bounded by ε in the L∞ sense, no single pixel moves by more
            than ε, a small ε stays invisible to the eye while still crossing the model&rsquo;s
            decision boundary. That is the whole unsettling point of adversarial examples: robustness
            to random noise says nothing about robustness to <em>adversarial</em> noise.
          </p>
          <p>
            My MSc research applies exactly this idea outside the image domain, to intrusion-detection
            models on the Controller Area Network bus, where an attacker perturbs network features
            rather than pixels to slip malicious traffic past a deep-learning detector, and where{' '}
            <em>adversarial training</em> (folding these very examples back into training) is one of
            the defences. Digits are just the version you can see. Honest caveats: this is a plain MLP,
            not a hardened or adversarially-trained model, and a hand-drawn digit is normalised to
            roughly match MNIST, so treat it as an intuition pump, not a benchmark.
          </p>
        </section>
      </div>
    </main>
    </>
  );
}
