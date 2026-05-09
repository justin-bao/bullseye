# Bullseye

Bullseye is a one-shot product creation agent for product managers, founders, and entrepreneurs. It turns a rough product idea, startup thesis, feature concept, or problem statement into a structured product cycle: research, personas, validation, solution strategy, MVP scope, design direction, PRD, architecture, build plan, launch checklist, and post-launch learning loop.

The app is intentionally research-first. Instead of jumping straight into implementation, Bullseye helps clarify the vision, identify the market and user assumptions, define cheap validation steps, and create the artifacts a product team needs before asking coding agents to build.

## What It Does

- Captures a freeform product idea plus audience, business model, timeline, risk posture, and supplementary materials.
- Generates staged product artifacts across the full PM lifecycle.
- Adds explicit approval gates for major decisions.
- Preserves a decision log as the user approves, revises, or adds follow-up prompts.
- Supports follow-up prompts at each stage without resetting the workflow.
- Exports the generated product cycle as Markdown or JSON.
- Includes a post-launch data Q&A surface for interpreting product metrics and NFR signals.

## Product Workflow

Bullseye organizes the product creation process into these stages:

1. Brief
2. Market research
3. User research
4. Validation plan
5. Solution strategy
6. MVP scope
7. Design direction
8. PRD
9. Technical architecture
10. Coding-agent task breakdown
11. Launch and learning loop

Each stage has a matching decision gate, recommended next action, risk note, and approval or revision control.

For the detailed lifecycle, see [docs/flow.md](docs/flow.md).

For implementation details and future system shape, see [docs/architecture.md](docs/architecture.md).

## Running Locally

```bash
npm run dev
```

Then open:

```text
http://127.0.0.1:4173/
```

## Development Commands

```bash
npm test
npm run build
```

- `npm test` runs the Node test suite for the product-cycle generation engine.
- `npm run build` performs syntax checks for the app modules.

## Project Structure

```text
index.html                  Static app shell
src/app.mjs                 Browser UI, state, exports, gates, follow-ups
src/agentEngine.mjs         Product-cycle generation logic
src/styles.css              Application styling
test/agentEngine.test.mjs   Engine tests
```

## Current Implementation Notes

This version is a self-contained static prototype. Research, persona creation, validation planning, PRD generation, architecture planning, and analytics answers are generated from local logic in `src/agentEngine.mjs`.

Future versions can replace or augment that logic with live integrations:

- Web search and source citation collection
- Figma artifact creation
- Document generation
- GitHub/code-agent orchestration
- Deployment previews
- Product analytics or warehouse connections
- CRM, survey, support, or interview-note ingestion

## Product Principle

Bullseye should help users avoid building the wrong thing beautifully. The default workflow favors learning, evidence, validation, and explicit product decisions before implementation.
