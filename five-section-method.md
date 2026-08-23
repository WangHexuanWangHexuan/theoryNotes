---
name: five-section-method
description: Analyze a mathematical or theoretical-CS definition, theorem, normal form, lemma, or proof using a fixed five-section structure — motivation, boundary questions, relations, proof intuition, and the algebra underneath together with the technique of analysis the proof uses. Use this whenever the user asks you to explain, unpack, clarify, or "help me understand" a theorem, definition, normal form, complexity result, algebraic structure, or proof — including when they paste a lecture slide, textbook screenshot, or photo of a blackboard and just say "explain this". Also use it when they ask why a hypothesis is needed, what happens if a condition is dropped or weakened, how a result connects to others, or what the real idea behind a proof is. Prefer this over a plain explanation for any formal result; only skip it for pure computation, homework arithmetic, or one-line factual lookups ("who proved this", "when was this published").
---

# The Five-Section Method

A fixed analytical frame for formal results. Textbook exposition tells you *what* a theorem says and *that* it is true. This frame instead reconstructs the result the way someone who invented it would see it: what pressure produced it, where its edges are, what it plugs into, what the proof is really doing, and what algebraic object was hiding underneath all along.

Apply it to definitions, theorems, normal forms, lemmas, algorithms with correctness proofs, and closure results. When the user gives you a paired definition + proposition (very common on lecture slides — a definition box followed by consequences), treat the pair as one object and analyze them together; they were designed together.

## The frame

Always produce these five sections, in this order, under these headings. The order is not decorative: motivation supplies the "why" that makes the boundary questions meaningful, boundaries expose what the object really needs, that in turn explains what it can connect to, and only then does the proof read as inevitable rather than clever.

```
## 1. Motivation
## 2. Boundary: how much can you weaken it?
## 3. Relations
## 4. Intuition of the proof
## 5. The algebra underneath
### (a) The object
### (b) The technique
```

Section 5 carries two questions — *what structure was really being manipulated* and *what reusable analytical technique did the proof use* — so it always splits into those two parts. Keep both even when one is short.

You may retitle a heading slightly to fit the subject (e.g. "5. The algebra underneath → The structure underneath" for a non-algebraic result), but keep the numbering and the role of each slot.

---

### 1. Motivation

Find the **pressure** — the specific thing that goes wrong without this result, stated concretely enough to be falsifiable.

The failure mode here is writing "this is useful because it simplifies things." That is content-free. Instead:

- Name the pathology precisely. Not "general grammars are messy" but "there is no bound on derivation length in terms of |w|, because ε-rules let the sentential form shrink and unit rules let it stall."
- Say what the definition *buys*, and connect each purchase to a downstream consequence. If the source material lists several consequences (a slide's bullet points, a textbook's corollaries), show that they are usually one property and its knock-on effects, not independent facts.
- Prefer the historical or engineering motive when you know it. Someone had a problem; this was the fix.

### 2. Boundary: how much can you weaken it?

This is the section that does the most work and the one no textbook writes. The claim is that you do not understand a hypothesis until you know what breaks without it.

Method: enumerate the hypotheses and design choices explicitly — including the ones stated so quietly they look like notation (the "ε-free" in "every ε-free CFL", the "finite" in "finite group", the choice of 2 in "exactly two symbols"). For each, drop it or weaken it and classify what happens:

- **Breaks outright** — and exhibit the counterexample, or the repair that rescues it (often a single-exception patch, e.g. permitting `S → ε` with S never on a right-hand side).
- **Survives, bound degrades** — the result still holds but a complexity or size guarantee gets worse. Say by how much.
- **Survives, sharpness lost** — the statement is still true but an *exact* claim becomes a bound. Exactness is usually the whole point; flag when it's what you lose.
- **Becomes trivial or collapses** — strengthening past a threshold makes the object degenerate into a weaker class.

A table is usually the clearest presentation. Then answer the meta-question the table raises: **is this the minimal hypothesis set, or is some condition cosmetic?** Distinguish conditions that are load-bearing from conditions that are conventions.

Also look for **hidden ordering or procedural constraints** — steps in a construction that must happen in a particular sequence, where the naive order causes exponential blow-up or reintroduces a pathology just removed. These are real boundary conditions and are almost always omitted from statements of the theorem.

### 3. Relations

Situate the result. Aim for a small map, not a list of name-drops. Cover whichever of these apply:

- **Downstream**: what this is a precondition *for*. Which algorithm, bound, or proof cannot run without it — and say what feature it supplies to that consumer (e.g. "binary branching is exactly what makes the DP recurrence have one split point").
- **Dual or sibling**: the alternative formulation solving the same problem with a different invariant (normal form ↔ normal form, primal ↔ dual, top-down ↔ bottom-up). Say what each one is *for*; siblings usually differ by which quantity they make exact.
- **Upward**: what this makes immediate as a corollary, or where it places the object in a hierarchy.
- **Generalization / specialization**: the general theorem this is an instance of, and the special cases where it degenerates.
- **Negative relations** — what the result explicitly does *not* buy you. Naming an adjacent problem that stays hard or undecidable prevents the most common overgeneralization, and is often more informative than another positive connection.

### 4. Intuition of the proof

Reconstruct the proof as a sequence of **moves**, each with a one-line reason for existing. Give each move a name. The test of this section: someone who reads it should be able to reproduce the proof's shape from memory a week later without having memorized anything.

- State the **invariant** — the property being established or preserved. Most constructive normalization proofs are "repeatedly remove one irregularity while preserving the language/value/structure," and the interesting content is *which* irregularities and *why those*.
- Where steps must run in a specific order, explain the dependency (step B can undo step A, so A goes last).
- If the result has a numerical claim (a step count, a bound, a length), derive it separately and structurally. Often such counts fall out of a shape argument — "a full binary tree with n leaves has exactly n−1 internal nodes" — rather than induction over the construction. Show the shape argument; it is more memorable and more portable.
- Use one concrete metaphor per move if it genuinely fits (a fresh variable acting as a program counter, a closure step acting as a shortcut). Do not force metaphors; a wrong one is worse than none.

### 5. The algebra underneath

Two things belong here, and they are different questions. Answer both, under sub-headings **(a) The object** and **(b) The technique**, so neither gets swallowed by the other.

#### (a) The object

Reveal the formal object the proof was manipulating without saying so. Syntactic bookkeeping is usually an algebraic operation in disguise, and naming it is what makes the result portable to other domains.

Diagnostic questions — run through these and report what actually applies rather than inventing structure:

- Is there a **semiring, monoid, lattice, or category** the objects live in? (Languages under ∪ and concatenation; Boolean matrices; tropical semiring for shortest paths.)
- Is the construction a **fixed point** of a monotone map? Then it's Knaster–Tarski / least-fixed-point iteration, and "compute the nullable set" is a fixpoint computation.
- Is a step a **closure operator** — transitive closure, `U* = (I − U)^{-1}` over a semiring? Eliminating a class of rules is frequently Gaussian elimination in disguise.
- Read the object as a **system of polynomial equations** and identify the degree of each term. Normal forms very often say: kill the constant term, kill the linear term, leave pure degree 2. Once a recurrence is bilinear, it is matrix multiplication, and fast matrix multiplication applies.
- Is there a **free object or universal property**? A **homomorphism** that lifts one alphabet into another? A **quotient**?
- Does the counting have a name (Catalan, binomial, partition)? Say what it counts.

Then state the payoff in one sentence: what this algebraic reading lets you *do* that the syntactic reading does not.

#### (b) The technique

Now name and explain the **method of analysis** itself — the reusable move the proof made, lifted out of this particular subject. Section 4 narrates what happened to *this* result; this part explains the technique as a technique, so it can be recognised and reused on a result the reader has never seen. That transfer is the whole point of studying a proof rather than memorising a statement.

For each technique the proof uses (usually one dominant one, sometimes two in combination):

- **Name it.** Pigeonhole. Monotone iteration to a least fixed point. Transitive closure / Gaussian elimination over a semiring. Geometric-series comparison across levels. Interval dynamic programming. Quotient by a congruence. Adversary or exchange argument. Potential function / termination measure. Diagonalization. Probabilistic method. Compactness. Induction on a well-founded order. Generating functions. Amortization. Duality. If it has a standard name, use it; if not, describe the move in one sentence.
- **State its enabling condition** — the structural property the technique needs in order to work. Pigeonhole needs a finite codomain and more items than slots. Fixed-point iteration needs monotonicity plus a complete lattice (or a well-founded descent for termination). Geometric comparison needs a ratio bounded away from 1 — which is usually exactly where a hypothesis in section 2 was doing its work. Say which hypothesis supplies the condition; this is where sections 2 and 5 lock together, and pointing at that link is one of the most useful things this method produces.
- **State its signature and its limits.** What shape of conclusion does the technique yield — existence, a bound, exactness, uniqueness, impossibility? A pigeonhole argument gives existence and a bound, never uniqueness. A fixed-point argument gives canonicity but no complexity bound by itself. Knowing what a technique *cannot* deliver explains why a proof needs a second ingredient.
- **State where else it applies.** One or two concrete transfers to results in adjacent areas, chosen to show the technique's range rather than to name-drop. If the reader will meet this move again in the same course, say where.

Close the whole section with one sentence tying (a) and (b) together: what the structural reading plus the technique jointly let you do that neither gives alone. That sentence is the reason the section exists.

---

## Calibration

`references/worked-example.md` contains a full worked analysis (Chomsky Normal Form) at the intended
density and tone. Read it when you are unsure how deep a section should go, or when the subject is a
normal form / closure result and you want a model to pattern-match against. It is a calibration
target, not a template to imitate — a different result will have different structure in each slot.

## Output

Write the analysis inline in the response as markdown, and also save it to a file named after the subject (e.g. `chomsky-normal-form.md`) so it can be kept as a study note. Deliver the file with whatever file-sending tool is available. If no such tool exists, write the file and tell the user its path.

The file should contain the same analysis, plus a one-line header naming the result and its source (textbook, course, slide number) when known.

## Style

- **Density over length.** Every sentence should carry a fact, a distinction, or a mechanism. Cut anything that would survive being deleted.
- **Tables** for the boundary section and any comparison of variants; prose elsewhere. LaTeX for real formulas.
- **Do not hedge into vagueness.** "Roughly speaking the constant matters" is worthless; give the constant.
- **Say when you don't know.** If a boundary case is genuinely open, or you are unsure whether a weakening breaks the result, say so explicitly rather than asserting. A confident wrong boundary claim poisons the whole method, because the boundary section is exactly where the user will trust you most.
- Match the user's language. If they write in Chinese, answer in Chinese; if the source slide is in one language and the question in another, follow the question.
- If a section genuinely has little to say for a particular result — some definitions have no interesting proof — keep the heading, say in one or two sentences why it's thin, and move on. An honest short section beats padding.