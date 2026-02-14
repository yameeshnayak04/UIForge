# UIForge — Deterministic AI UI Generator

UIForge converts natural language UI intent into a working React UI using a fixed component library, with planner/generator/explainer orchestration, live preview, and version rollback.

## Assignment Fit

- Deterministic component system with whitelist enforcement
- Explicit multi-step agent flow: Planner → Generator → Explainer
- Incremental modifications via patch operations (no full rewrite by default)
- Left chat panel, code panel, live preview, regenerate, and rollback support
- Safety checks: prompt-injection filter, component whitelist validation, prop safety validation

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Zod for structured output validation
- LLM providers: Gemini, OpenAI, Mock
- Local version history with browser storage

## Component System (Fixed)

Allowed components:

- `Button`
- `Card`
- `Input`
- `Table`
- `Modal`
- `Sidebar`
- `Navbar`
- `Chart`
- `Stack`
- `Text`

Rules:

- AI can only select, compose, and set props/content for these components
- AI cannot generate new components
- AI cannot generate CSS or arbitrary class names

## Agent Design

### 1) Planner

File: `src/agent/prompts.ts`

- Interprets user intent
- Chooses components and layout
- For modify requests, outputs patch operations (`add`, `remove`, `update`, `move`)

### 2) Generator

Files: `src/agent/orchestrator.ts`, `src/lib/code-generator.ts`

- For modify flows: applies planner patches to current AST (deterministic patch-first)
- For generate/regenerate: validates generated AST and normalizes into final code
- Final code is always derived from final validated AST

### 3) Explainer

File: `src/agent/prompts.ts`

- Produces plain-English reasoning for layout/component decisions
- On modify, explains what changed and why

## Safety & Validation

Files: `src/agent/injection-filter.ts`, `src/agent/validators.ts`

- Prompt injection / dangerous string detection
- Plan validation and patch schema validation with Zod
- Component whitelist enforcement
- Dangerous prop content checks
- Component contract checks (non-empty content requirements for text/buttons/data widgets)

## Iteration & Versioning

Files: `src/app/page.tsx`, `src/lib/storage/versions.ts`

- Chat supports `generate`, `modify`, `regenerate`
- Every successful generation stores a version snapshot
- Version panel allows rollback to previous AST/code

## Setup

### 1) Install

```bash
npm install
```

### 2) Configure environment

Create `.env.local` (optional if using mock provider):

```bash
LLM_PROVIDER=mock
# LLM_PROVIDER=gemini
# GEMINI_API_KEY=your_key
# GEMINI_MODEL=gemini-1.5-flash

# LLM_PROVIDER=openai
# OPENAI_API_KEY=your_key
# OPENAI_MODEL=gpt-4o-mini
```

### 3) Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Prompt Templates

Prompt separation is explicit in `src/agent/prompts.ts`:

- `buildPlannerPrompt(...)`
- `buildGeneratorPrompt(...)`
- `buildExplainerPrompt(...)`

## Known Limitations

- Planner quality depends on model output consistency
- No semantic diff UI yet (version rollback only)
- Validation is lightweight and rule-based (not full static verification)
- Complex UX states (deep interactivity) are intentionally constrained for determinism

## What I’d Improve with More Time

- Add schema-driven prop validation per component with richer type contracts
- Add visual diff between versions
- Add replayable generation timeline (prompt → plan → AST → code)
- Add stronger AST normalization and conflict-aware patch repair
- Add server-side persistence for version history

## Demo Checklist

In the demo video, show:

- Initial generation from natural language
- Incremental modify request (patch-based)
- Live preview update
- Explanation output
- Rollback to previous version
