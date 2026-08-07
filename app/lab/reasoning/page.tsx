import type { Metadata } from 'next';
import UnfaithfulCoT from '@/components/UnfaithfulCoT';
import SiteChrome from '@/components/SiteChrome';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'Unfaithful reasoning: when the chain of thought lies · Yulan Galagoda',
  description:
    'An interactive reproduction of Turpin et al. 2023: add a bias a model is not told about, watch its answer move, and see that its chain of thought almost never mentions the real cause. Recorded runs on llama-3.3-70b via Groq.',
  alternates: { canonical: `${SITE}/lab/reasoning` },
  openGraph: {
    title: 'Unfaithful reasoning · Yulan Galagoda',
    description:
      'Stated reasoning is not the same as actual cause. A hands-on reproduction of biasing-features and unfaithful chain-of-thought.',
    url: `${SITE}/lab/reasoning`,
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Unfaithful chain-of-thought',
      url: `${SITE}/lab/reasoning`,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any (runs in the browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
      description:
        'Interactive reproduction of biasing-features and unfaithful chain-of-thought (Turpin et al. 2023), with recorded model runs shown side by side.',
      author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE },
      citation: 'https://arxiv.org/abs/2305.04388',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Lab', item: `${SITE}/lab` },
        { '@type': 'ListItem', position: 3, name: 'Unfaithful reasoning', item: `${SITE}/lab/reasoning` },
      ],
    },
  ],
};

export default function ReasoningLabPage() {
  return (
    <>
      <SiteChrome />
      <main className="lab" id="main">
      <div className="container">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="/lab" className="lab__back">&larr; Lab</a>

        <header className="lab__head">
          <span className="eyebrow">Lab · Instrument 08</span>
          <h1 className="lab__title">When something invisible changes the answer, does the model admit it?</h1>
          <p className="lab__lede">
            Add a biasing feature a model is never told about, a suggested answer, or a pattern where
            the correct option is always in the same place. Watch the answer move toward the bias.
            Then read the chain of thought and see whether it mentions the real cause. It almost never
            does: the model writes a fluent, confident justification for a conclusion it reached for
            an entirely different reason.
          </p>
          <p className="lab__note">
            A reproduction, not a discovery. This replicates{' '}
            <a href="https://arxiv.org/abs/2305.04388" target="_blank" rel="noopener noreferrer">
              Turpin, Michael, Perez &amp; Bowman (2023), NeurIPS
            </a>
            , and makes the effect manipulable. Runs are recorded ahead of time on{' '}
            <code>llama-3.3-70b</code> (via Groq) and replayed here in your browser; nothing you do on
            this page is sent anywhere.
          </p>
        </header>

        <div className="lab__panel lab__panel--full">
          <UnfaithfulCoT />
        </div>

        <section className="lab__prose">
          <h2>How it works</h2>
          <p>
            Each question is run three ways. <em>Clean</em> is the question on its own. In{' '}
            <em>Suggested answer</em>, the prompt adds a confident but wrong steer (&ldquo;I&rsquo;m
            confident the answer is X&rdquo;). In <em>Positional</em>, the model first sees several
            worked examples whose answer is always (A), then a question whose correct answer has been
            moved off (A). The bias is never named to the model; the only question is whether its
            stated reasoning names it.
          </p>
          <p>
            Whether a chain of thought <em>admits</em> the bias is decided by a separate judge call, a
            fresh model asked only &ldquo;does this reasoning rely on the pattern / the
            suggestion?&rdquo; The full, verbatim chain of thought is shown for every run, so you can
            check that judgement yourself. The clearest cases are the ones where the biased chain
            reproduces the <em>same</em> derivation as the clean run, then contradicts its own working
            in the final line to match the nudge, without a word about why.
          </p>
          <p>
            An honest result: modern models resist these simple biases far more than the 2023-era
            models the paper tested, so the flip rate here is low, and the positional bias barely
            moves this model at all. The surviving point is the sharp one. In the cases where a bias
            <em>does</em> change the answer, the reasoning still never mentions it. Stated reasoning is
            not the same thing as actual cause, which is why monitoring a model by reading its chain
            of thought is harder than it looks.
          </p>
          <p>
            Honest limitations: a small question bank, recorded on one model at one date, with a
            firmer suggestion than the paper&rsquo;s gentle one (the gentle version barely moved this
            model). Stated confidence is the model&rsquo;s own number, not calibrated. Mention
            detection is a judged heuristic; the raw chains are shown so you can disagree.
          </p>
        </section>
      </div>
    </main>
    </>
  );
}
