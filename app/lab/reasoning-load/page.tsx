import type { Metadata } from 'next';
import LoadBearingCoT from '@/components/LoadBearingCoT';
import SiteChrome from '@/components/SiteChrome';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'Is the chain of thought load-bearing, or decoration? · Yulan Galagoda',
  description:
    'An interactive reproduction of Lanham et al. 2023: perturb a model’s reasoning (truncate, corrupt a step, replace with filler, paraphrase) and see whether its answer actually depends on the steps. Recorded runs on llama-3.3-70b via Groq.',
  alternates: { canonical: `${SITE}/lab/reasoning-load` },
  openGraph: {
    title: 'Load-bearing reasoning · Yulan Galagoda',
    description:
      'Does the chain of thought do the work, or was the answer decided elsewhere? A hands-on reproduction of chain-of-thought perturbation tests.',
    url: `${SITE}/lab/reasoning-load`,
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Is the chain of thought load-bearing?',
      url: `${SITE}/lab/reasoning-load`,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any (runs in the browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
      description:
        'Interactive reproduction of chain-of-thought perturbation tests (Lanham et al. 2023): truncation, adding mistakes, filler tokens, and paraphrasing, with recorded model runs shown side by side.',
      author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE },
      citation: 'https://arxiv.org/abs/2307.13702',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Lab', item: `${SITE}/lab` },
        { '@type': 'ListItem', position: 3, name: 'Load-bearing reasoning', item: `${SITE}/lab/reasoning-load` },
      ],
    },
  ],
};

export default function ReasoningLoadPage() {
  return (
    <>
      <SiteChrome />
      <main className="lab" id="main">
      <div className="container">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="/lab" className="lab__back">&larr; Lab</a>

        <header className="lab__head">
          <span className="eyebrow">Lab · Instrument 09</span>
          <h1 className="lab__title">Is the chain of thought load-bearing, or decoration?</h1>
          <p className="lab__lede">
            A model solves a problem and writes its reasoning out step by step. But does the answer
            actually depend on those steps? Take the chain of thought and damage it, truncate it, break
            one step, replace the whole thing with filler, and re-answer. If the answer does not budge,
            the reasoning was not doing the work; it was written to look like an explanation after the
            answer had already been decided.
          </p>
          <p className="lab__note">
            A reproduction, not a discovery. This replicates{' '}
            <a href="https://arxiv.org/abs/2307.13702" target="_blank" rel="noopener noreferrer">
              Lanham et al. (2023), &ldquo;Measuring Faithfulness in Chain-of-Thought Reasoning&rdquo;
              (Anthropic)
            </a>
            . Runs are recorded ahead of time on <code>llama-3.3-70b</code> (via Groq), temperature 0,
            and replayed here; nothing you do on this page is sent anywhere.
          </p>
        </header>

        <div className="lab__panel lab__panel--full">
          <LoadBearingCoT />
        </div>

        <section className="lab__prose">
          <h2>How it works</h2>
          <p>
            Each problem is first solved normally, producing a numbered chain of thought and an answer.
            Then the reasoning is perturbed four ways, each mapped to a test from the paper.{' '}
            <em>Truncate</em> keeps only the first few steps and forces an answer (does it need the
            later steps?). <em>Corrupt</em> inserts a wrong number into one step and lets the model
            continue (does a broken step change the answer?), done for every step so you can see which
            ones are load-bearing. <em>Filler</em> replaces the whole chain with meaningless tokens of
            matched length (does content matter, or just having tokens?). <em>Paraphrase</em> restates
            every step preserving meaning, and is the control: a robust answer should be unchanged.
          </p>
          <p>
            Everything runs at temperature 0 with a fixed seed, and the corruption is a deterministic
            edit, so the whole dataset is reproducible. Paraphrase equivalence is checked by a separate
            judge model call, a transparent proxy for the paper&rsquo;s NLI/embedding threshold, which
            Groq does not offer; the paraphrased steps are shown so you can judge for yourself.
          </p>
          <p>
            <b>What this does not prove.</b> It is behavioural, not mechanistic: it shows{' '}
            <em>that</em> the chain matters to the output, never <em>where</em> the computation lives
            inside the model. And a null result is ambiguous. On the questions here the answer is
            completely indifferent to its own reasoning, which is consistent with the chain being
            decorative, but the model also answers every question correctly, so these tasks are simply
            easy enough that it may not need the steps at all. To separate &ldquo;decorative&rdquo; from
            &ldquo;too easy&rdquo; you need problems at the edge of the model&rsquo;s ability, where
            removing or breaking the reasoning would actually hurt. That ambiguity, not a clean number,
            is the real lesson: reading a chain of thought tells you less than it appears to.
          </p>
        </section>
      </div>
    </main>
    </>
  );
}
