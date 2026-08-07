import type { Metadata } from 'next';
import NarrationFaithfulness from '@/components/NarrationFaithfulness';
import SiteChrome from '@/components/SiteChrome';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'When the true cause is known, does the explanation track it? · Yulan Galagoda',
  description:
    'A faithfulness testbed where the answer key is held: a ranking is computed by deterministic code and the LLM only narrates it. Intervene on the signals and watch whether the explanation tracks. Recorded runs on llama-3.3-70b via Groq.',
  alternates: { canonical: `${SITE}/lab/narration` },
  openGraph: {
    title: 'Faithfulness with the answer key held · Yulan Galagoda',
    description:
      'When a deterministic scorer decides and the model only narrates, the true cause is known, so the explanation can be graded, not trusted.',
    url: `${SITE}/lab/narration`,
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Explanation faithfulness with a known cause',
      url: `${SITE}/lab/narration`,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any (runs in the browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
      description:
        'A faithfulness demonstration built on Glean’s design: a deterministic scorer ranks findings and an LLM narrates, so the true cause is known and the explanation can be checked against it by intervention.',
      author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE },
      citation: 'https://arxiv.org/abs/2307.13702',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Lab', item: `${SITE}/lab` },
        { '@type': 'ListItem', position: 3, name: 'Explanation faithfulness', item: `${SITE}/lab/narration` },
      ],
    },
  ],
};

export default function NarrationPage() {
  return (
    <>
      <SiteChrome />
      <main className="lab" id="main">
      <div className="container">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="/lab" className="lab__back">&larr; Lab</a>

        <header className="lab__head">
          <span className="eyebrow">Lab · Instrument 10</span>
          <h1 className="lab__title">When the true cause is known, does the explanation track it?</h1>
          <p className="lab__lede">
            Faithfulness research is usually stuck: you don&rsquo;t know the true reason for a
            model&rsquo;s output, so there is nothing to check its explanation against. This tool
            removes that by construction. Following the design of my OSINT project Glean, the ranking
            is computed by deterministic code and the model only narrates the result, so the signals
            that actually drove each decision are known exactly. The answer key is held, and the
            explanation can be graded instead of trusted.
          </p>
          <p className="lab__note">
            An original demonstration, grounded in the faithfulness literature (
            <a href="https://arxiv.org/abs/2305.04388" target="_blank" rel="noopener noreferrer">Turpin 2023</a>,{' '}
            <a href="https://arxiv.org/abs/2307.13702" target="_blank" rel="noopener noreferrer">Lanham 2023</a>).
            It uses a small purpose-built scorer in Glean&rsquo;s spirit (real Glean&rsquo;s scorer is
            still being built). The ranking runs live in your browser; the narrations are recorded on{' '}
            <code>llama-3.3-70b</code> (via Groq) and replayed. Nothing you do here is sent anywhere.
          </p>
        </header>

        <div className="lab__panel lab__panel--full">
          <NarrationFaithfulness />
        </div>

        <section className="lab__prose">
          <h2>How it works</h2>
          <p>
            Six signals each carry a fixed weight (lookalike domain and breach listing 3, sensitive
            port and recent registration 2, expired certificate and random-looking name 1). A
            finding&rsquo;s risk score is just the sum of the weights of the signals that fired, and
            findings are ranked by score. That is the entire decision procedure, and it is code, so the
            cause of any ranking is fully known. The model is then handed the evidence and asked to
            explain the ranking; it never sees the weights or does the ranking itself.
          </p>
          <p>
            To grade the explanation, we intervene: toggle each signal, recompute, and re-narrate.{' '}
            <em>Causal tracking</em> asks whether the explanation&rsquo;s mention of a signal flips when
            the signal is toggled. <em>Confabulation</em> is citing a signal that did not fire;{' '}
            <em>omission</em> is dropping a decisive signal that did. Mention detection is keyword-based
            over the recorded narration (shown verbatim), tuned to catch a signal cited as a{' '}
            <em>cause</em> rather than a downstream risk, "appears in a breach corpus" counts, "could
            lead to a breach" does not.
          </p>
          <p>
            The result on this model: with the cause made explicit and handed over, the narration is
            faithful, it tracks every intervention, invents nothing, and omits no decisive signal. That
            is the opposite of what the same model does in CH-8, where a hidden bias moves the answer
            and the reasoning never admits it, and CH-9, where the reasoning turns out to be decorative.
          </p>
          <p>
            <b>What this does not prove.</b> Faithfulness on a narrow, structured scoring task tells you
            little about faithfulness on open-ended reasoning. A model that narrates a six-signal
            weighted sum honestly may be wildly unfaithful when the reasoning is genuinely its own. The
            real lesson is the method: <em>when</em> you can hold the answer key you can grade an
            explanation rather than trust it, and most deployments cannot.
          </p>
        </section>
      </div>
    </main>
    </>
  );
}
