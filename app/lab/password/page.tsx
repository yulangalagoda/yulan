import type { Metadata } from 'next';
import PasswordLab from '@/components/PasswordLab';
import SiteChrome from '@/components/SiteChrome';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'Password Strength Lab: free client-side checker · Yulan Galagoda',
  description:
    'Analyse password strength with transparent math: guess entropy, dictionary and keyboard-walk detection, realistic crack-time estimates, and an optional k-anonymity breach check. Runs entirely in your browser, nothing is transmitted.',
  alternates: { canonical: `${SITE}/lab/password` },
  openGraph: {
    title: 'Password Strength Lab · Yulan Galagoda',
    description:
      'Transparent, client-side password analysis: entropy, patterns, crack-time estimates, and breach exposure.',
    url: `${SITE}/lab/password`,
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Password Strength Lab',
      url: `${SITE}/lab/password`,
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any (runs in the browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
      description:
        'Client-side password strength analyser with entropy math, pattern detection, crack-time estimates, and a k-anonymity breach check.',
      author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Lab', item: `${SITE}/lab` },
        { '@type': 'ListItem', position: 3, name: 'Password Strength', item: `${SITE}/lab/password` },
      ],
    },
  ],
};

export default function PasswordLabPage() {
  return (
    <>
      <SiteChrome />
      <main className="lab" id="main">
      <div className="container container--narrow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="/lab" className="lab__back">&larr; Lab</a>

        <header className="lab__head">
          <span className="eyebrow">Lab · Instrument 02</span>
          <h1 className="lab__title">Password strength lab</h1>
          <p className="lab__lede">
            Most strength meters are a black box. This one shows its work: the entropy math, the
            patterns an attacker exploits, and what they mean in real cracking time. Everything runs
            locally, the password never leaves this page.
          </p>
        </header>

        <div className="lab__panel lab__panel--wide">
          <PasswordLab />
        </div>

        <section className="lab__prose">
          <h2>How it works</h2>
          <p>
            The analyser starts from the brute-force ceiling: a password of length <em>L</em> drawn
            from a character pool of size <em>P</em> has at most <em>L</em> × log₂(<em>P</em>) bits
            of entropy. Real attackers never brute-force blindly, though, they run ordered wordlists
            and mangling rules first. So the model hunts for the same structure those rules exploit:
            top-guessed passwords (with l33t substitutions normalised away), dictionary words,
            keyboard walks, ascending or descending sequences, repeats, and years. Each finding
            replaces its share of the naive entropy with what the pattern actually costs an informed
            attacker, a year is worth ~7 bits, not the ~13 its digits suggest, because there are
            only about 130 plausible ones.
          </p>
          <p>
            The crack-time table converts the resulting guess count into wall-clock time under four
            explicit attacker profiles, from a rate-limited login form (~10 guesses/s) to an offline
            GPU rig against fast unsalted hashes (~10¹² guesses/s). The figures are order-of-magnitude
            estimates on purpose: the spread between the rows, not the precision of any one number, 
            is what should inform how strong a password needs to be.
          </p>
          <p>
            The optional breach check queries the Have I Been Pwned corpus using k-anonymity: the
            password is SHA-1 hashed locally and only the first five hex characters of the hash are
            sent. The API returns every suffix in that bucket and the comparison happens in your
            browser, so neither the password nor enough of its hash to identify it ever leaves the
            page. This mirrors the guidance in NIST SP 800-63B: check candidate passwords against
            known-breached corpora, prefer length over composition rules.
          </p>
          <p>
            Honest limitations: the embedded dictionaries are deliberately small (a real cracker
            carries tens of millions of entries), there is no personal-context modelling (names,
            birthdays, usernames), and no Markov or neural guessing model. Treat a strong verdict
            here as necessary, not sufficient, and use a password manager either way.
          </p>
        </section>
      </div>
    </main>
    </>
  );
}
