# CuriosityLab

**Can Bayesian optimization discover how to make knowledge worth exploring?**

An offline, human-in-the-loop prototype for optimizing educational entry points rather than click-through rate alone. Built for the NTU Bayesian Optimization in Everyday Life assignment. No API key, backend or package installation required.

## Run

Open `index.html` in a browser (all files must remain together), or use `python -m http.server 8000` from this directory and open `http://localhost:8000`. For GitHub Pages, publish the repository root. A standalone HTML build is also supplied separately.

- **Human experiment:** 36 shuffled, curated topics across science, daily life, psychology, history, language, design, computing and other fields. Each trial shows a recommended presentation, collects interest, offers optional exploration, and asks a transfer/comprehension question. Data remain in browser local storage and can be exported as JSON. The first four trials use random initialization; later trials use GP-UCB. Reset clears observations.
- **Synthetic benchmark:** compare BO with uniform random search using matched seeds, profiles, and noise sequences; export the curve as CSV. The synthetic response is deliberately simple, not a fitted human model.

## Topic expansion (v0.2)

The original eight topics are retained and 28 new topics are added. Each session shuffles the complete pool, with quiz choices also shuffled. A session can be resumed using local browser storage; existing v1 observations remain usable. This is a curated offline prototype, not a live AI-generated knowledge feed. Human outcomes are not yet validated.

## Design space

| Variable | Values |
|---|---|
| Presentation style | question, counterintuitive statement, analogy, definition |
| Disclosure | full explanation, hint, withheld answer |
| Optional follow-up cards | 1, 2, 3 |

There are 36 possible configurations. The score is `0.2*C + 0.4*E + 0.4*L`, where C is expressed interest (binary), E is whether at least one optional card was opened, and L is quiz correctness (binary). All are imperfect behavioral proxies; opening a card is not proof of learning. Weights are illustrative, not empirically validated. The content is always available, even if the learner expresses no interest. No incentives to stay longer or forced extra exploration.

## Optimizer

`optimizer.js` implements an exact Gaussian process with constant prior mean 0.5, fixed observation-noise variance 0.018, covariance `0.12 exp(-0.8 I(style differs) - 0.65 (gap difference)^2 - 0.45 (links difference)^2)`, Cholesky solves, and exhaustive UCB selection over the finite domain (`mu + 1.65*sd`). Four randomly selected configurations initialize both algorithms. Repeated designs are disallowed until the finite search space is exhausted. These are manually chosen hyperparameters, not fitted estimates. The human experiment currently uses scalarized Standard BO with mixed variables; contextual and multi-objective extensions are not implemented.

## Reproducible evaluation

`node test.js` runs numerical, content, and benchmark tests. `benchmark.csv` contains the mean simple regret from 40 fixed seeds, 18 evaluations each. The synthetic optimum is known by enumerating all 36 strategies. Simple regret = optimal latent score minus the best latent score among evaluated strategies (not the noisy observed score). GP-UCB mean final regret 0.0000; random search 0.03049; strict BO wins 16/40, with 24 ties. The synthetic function has smooth structure aligned with the kernel; results cannot be interpreted as evidence of human learning or general BO superiority. More challenging simulation families and a randomized human study are future work.

## Limitations and next steps

- 36 topics allow up to 32 adaptive observations per session; topic difficulty, prior knowledge, and learning carryover are not controlled. Do not infer a robust personal optimum from this pilot.
- A low-disclosure teaser may still reveal the answer implicitly (e.g. direct definitions). The manipulation is an operational approximation, not a validated psychological information-gap measure.
- Optional link count changes exploration opportunity; the binary E metric avoids directly rewarding more clicks but does not eliminate this confound.
- Current dashboard shows strategy labels, potentially introducing demand effects. Future blinded study should hide them and use matched topic sets, baseline knowledge, delayed transfer tests, and consented participants.
- Future contextual BO could model topic and prior knowledge; multi-objective BO could expose the trade-off between interest, exploration, and learning without fixed weights.

## Files

- `index.html`: responsive interactive experiment and benchmark UI
- `optimizer.js`: real finite-domain GP-UCB implementation and simulator
- `topics.js`: 36 curated educational topics, each with four openings, three optional explorations and a comprehension quiz
- `test.js`: Node.js tests
- `benchmark.csv`: reproducible synthetic results
