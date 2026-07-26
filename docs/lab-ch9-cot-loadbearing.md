# CH-9 — Is the chain of thought load-bearing? (build & design notes)

*A lab tool for yulan.me. Reproduction of Lanham et al. (2023), "Measuring
Faithfulness in Chain-of-Thought Reasoning," Anthropic — [arXiv:2307.13702](https://arxiv.org/abs/2307.13702).*

Read this top to bottom and you'll understand the whole pipeline end to end: the
question, the four perturbations, how the runs are produced, how the numbers are
computed, and how the page turns that into something you can inspect.

---

## 1. The question

CH-8 asked whether a model's stated reasoning reveals the *real cause* of its
answer. CH-9 asks a different, complementary thing: **does the reasoning do any
work at all, or is it decoration written after the answer was already decided?**

The test is behavioural. Take a chain of thought that produced an answer, damage it
in a meaning-preserving or meaning-breaking way, and re-answer. If the answer is
indifferent to what its own reasoning says, the reasoning was not load-bearing.

## 2. Reproduction, not discovery

The four perturbations come straight from Lanham et al. (2023):

| CH-9 name | Lanham test | what it probes |
|---|---|---|
| **Truncate** | early answering | does the answer need the *later* steps? |
| **Corrupt** | adding mistakes | does a wrong step change the answer? |
| **Filler** | filler tokens | does *content* matter, or just having tokens? |
| **Paraphrase** | paraphrasing | is the answer stable to meaning-preserving rewrites? (control) |

The page cites the paper prominently and frames the tool as a reproduction that
makes the effect manipulable — never as a new finding.

## 3. The four perturbations, precisely

Every question is first solved normally, producing a **numbered chain of thought**
(`Step 1: … Step 2: … Answer: (X)`) which we split into discrete steps. Then:

1. **Truncate** — keep only the first *k* steps and force an answer *now* ("based
   only on this, your best answer"). Done at two depths (drop the last step; drop
   the second half). If the answer is already fixed at small *k*, the later steps
   were post-hoc.
2. **Corrupt** — put a clearly wrong number into step *i*, then let the model
   *continue* from there. Done for **every** step, so we learn *which* step, when
   broken, actually changes the answer (per-step sensitivity). If breaking a step
   does not move the answer, that step was not load-bearing.
3. **Filler** — replace the whole reasoning with meaningless tokens of the **same
   length** ("let me think about this carefully and…"), then force an answer.
   Length is matched so any effect isn't just "less context."
4. **Paraphrase** — restate each step preserving meaning and every number, then
   force an answer. This is the **control**: a faithful, robust answer should be
   *unchanged* by a meaning-preserving rewrite. A separate judge call checks the
   paraphrase really is equivalent (see the honesty note in §5).

## 4. Architecture

Identical to CH-8: inference happens **offline** in the generator; the recorded
runs are committed as JSON; the site replays them client-side.

```
  scripts/gen-cot-loadbearing.mjs  ──Groq──►  lib/labs/cot-loadbearing.json  ──►  CH-9 React UI
        (offline, one-off)                       (committed dataset)              (static replay)
```

Determinism matters here, so the generator runs at **temperature 0 with a fixed
seed**, and the corruption is a deterministic edit (change the last number in a
step), so the whole dataset is reproducible.

## 5. The generator, step by step (`scripts/gen-cot-loadbearing.mjs`)

Run once, locally: `GROQ_API_KEY=xxxx node scripts/gen-cot-loadbearing.mjs`.

- **Model.** `llama-3.3-70b-versatile` via Groq (same as CH-8; a CoT-prompted
  standard model whose *visible* numbered steps are the object of study).
- **Baseline.** Ask for numbered steps + `Answer: (X)`; parse steps by the
  `Step N:` markers, parse the answer letter.
- **Answering from a supplied chain.** Two modes: *force* ("based only on this,
  answer now" — used for truncate, filler, paraphrase) and *continue* ("carry on
  from here" — used for corrupt, so a mistake can propagate).
- **Corruption** is a deterministic edit: the last number in the step is changed to
  a clearly wrong value (or a logical keyword is flipped). No model call needed, so
  it's reproducible.
- **Filler** matches the word count of the real reasoning, so length is controlled.
- **Paraphrase equivalence — the one honest caveat.** The paper validates paraphrase
  equivalence with NLI/embedding similarity above a stated threshold. Groq offers no
  embedding or NLI endpoint, so equivalence is checked by a **separate judge model
  call** ("are these two chains equivalent, step for step? YES/NO"). That is a
  transparent *proxy*, weaker than a formal threshold; the page says so, and the
  paraphrase text is shown so you can judge for yourself.
- **Rate limits.** Free-tier friendly: ~1.2s pacing, exponential backoff on 429.
  Per-step corruption multiplies calls, so expect a few hundred calls and a run of
  several minutes for the small bank.

## 6. Dataset schema

```jsonc
{
  "meta": { "status", "model", "provider", "generatedAt",
            "source": { "citation", "arxiv" }, "nQuestions", "perturbations", "note" },
  "metrics": { "baselineAccuracy", "truncateFlipRate", "corruptFlipRate",
               "fillerAccuracy", "fillerFlipRate", "paraphraseFlipRate", "paraphraseEquivRate" },
  "items": [{
    "id", "task", "difficulty", "question", "options": [4], "correct",
    "baseline":   { "answer", "steps": [...], "cot", "correct" },
    "truncate":   [{ "k", "keptSteps", "answer", "flipped", "correct" }],
    "corrupt":    { "perStep": [{ "step", "corruptedText", "answer", "flipped" }], "anyFlip" },
    "filler":     { "fillerText", "answer", "flipped", "correct" },
    "paraphrase": { "steps": [...], "equivalent", "answer", "flipped", "correct" }
  }]
}
```

## 7. Metrics, and how to read them

- **Baseline accuracy** — accuracy with the full chain of thought.
- **Corrupt flip rate** — over all (question, step) corruptions, how often the answer
  changed. **High = the reasoning is load-bearing** (the answer tracks the steps).
- **Filler accuracy** — accuracy when the reasoning is replaced by nonsense of the
  same length. **High = the reasoning was decorative** (the model didn't need it).
- **Truncate flip rate** — how often dropping the later steps changes the answer.
  Low = those steps were post-hoc.
- **Per-step sensitivity** — which specific step, when corrupted, flips the answer.
  The most interesting view: it localises where the answer actually depends on the
  chain (early steps usually matter more than the final restatement).
- **Paraphrase flip rate** — the control. Should be near zero; if it's high the model
  is reacting to surface form, not meaning.

## 8. What's behind the UI (planned)

A client component at `/lab/reasoning-load/` (CH-9), reading the JSON:

- **Header + citation** framing it as a reproduction of Lanham et al. 2023.
- **Metrics strip** — corrupt-flip (load-bearing), filler-accuracy (decorative),
  paraphrase-flip (control), from `metrics`.
- **Controls** — pick a question (difficulty labelled); pick a perturbation
  (truncate / corrupt / filler / paraphrase).
- **Original vs perturbed** — the numbered baseline chain on the left; the perturbed
  chain on the right (truncated / one step reddened / filler / paraphrased), with the
  answer **before → after** and a flip flag.
- **Per-step sensitivity strip** — for corrupt, a row of the steps, each marked
  whether breaking it flipped the answer: the map of which steps are load-bearing.

## 9. What this does NOT prove (stated plainly on the page)

- **Behavioural, not mechanistic.** It shows *that* the chain matters (or doesn't) to
  the output; it says nothing about *where* the computation lives inside the model.
- **A null result is ambiguous.** No deterioration under corruption/filler can mean
  the chain was decorative — *or* simply that the task was easy enough to answer
  without it. That's exactly why questions are **difficulty-stratified**: watch the
  easy items answer correctly through filler (uninteresting) versus the hard items,
  where filler should hurt if the reasoning was doing real work. The ambiguity is the
  interesting part, not a flaw to hide.
- **Paraphrase equivalence is judged, not measured** (§5).

## 10. How to regenerate

Edit `QUESTIONS` / `MODEL` in `scripts/gen-cot-loadbearing.mjs`, re-run with your
`GROQ_API_KEY`, commit the new `lib/labs/cot-loadbearing.json`. The UI updates
itself from the JSON.

---

*Build status: DONE. Recorded on `llama-3.3-70b` (Groq, temperature 0): baseline
accuracy 100%, corrupt-flip 0%, filler-accuracy 100%, truncate-flip 0%,
paraphrase-flip 0%. The answer is completely indifferent to its own reasoning here,
consistent with a decorative chain, but the tasks are also easy enough (100%
baseline) that the model may not need the steps, exactly the ambiguity the page
foregrounds. Live as CH-9 at /lab/reasoning-load.*
