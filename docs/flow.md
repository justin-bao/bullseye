# Bullseye Product Flow

Bullseye is designed as an end-to-end product management agent. The user brings the product intuition; Bullseye turns it into a structured, evidence-aware path from idea to validation, design, build, launch, and learning.

## Operating Model

The agent should behave like a collaborative product partner, not a code generator that starts building immediately. Its default behavior is:

1. Clarify the idea and constraints.
2. Research the market and users.
3. Expose assumptions and confidence levels.
4. Recommend the cheapest credible validation path.
5. Explore solution options.
6. Lock the MVP boundary.
7. Create design and product artifacts.
8. Prepare architecture and coding-agent tasks.
9. Build only after explicit approval.
10. Instrument analytics and support post-launch learning.

Each stage is interruptible. The user can add follow-up prompts, ask for deeper research, revise the target segment, change the solution approach, or request another pass before approving the next gate.

## Stage 1: Intake and Vision Clarification

The user starts with any rough input:

- New product idea
- Startup concept
- Feature request
- Customer problem
- Market thesis
- Internal workflow pain
- Notes from customers, sales, support, analytics, or prior research

Bullseye captures:

- Product/problem statement
- Target audience
- Business model
- Timeline
- Risk posture
- Supplementary material

The output is a working brief with the current problem framing, clarifying questions, assumptions, constraints, and any regulated-domain warning.

Decision gate: `Initial brief`

## Stage 2: Market and Competitive Research

The market stage defines what must be researched before product work continues. In the current prototype, this is generated as a research agenda and hypothesis set. In the full agent version, this stage should use live sources and citations.

Expected research coverage:

- TAM, SAM, and SOM
- Market growth and dynamics
- Segment structure
- Procurement patterns
- Pricing and packaging norms
- Adoption barriers
- Direct competitors
- Indirect competitors
- Substitute workflows
- Internal build alternatives
- Market share where credible
- Funding, partnerships, and strategic wedges

Every finding should carry confidence and evidence quality:

- High confidence: public pricing, public features, review themes, visible positioning
- Medium confidence: analyst estimates, segment budgets, growth projections
- Low confidence: willingness to switch, willingness to pay, urgency before direct validation

Decision gate: `Research direction`

## Stage 3: User Research and Personas

Bullseye identifies who feels the pain, who pays, who administers, who influences, and who blocks adoption.

Expected research coverage:

- Pain points
- Jobs-to-be-done
- Current workarounds
- Switching costs
- Buying triggers
- Objections
- Success moments
- Willingness-to-pay signals

The default persona model includes:

- Primary user
- Economic buyer
- Admin or operator
- Blocker

In the full agent version, persona generation should combine user-supplied materials with public user research from reviews, forums, app stores, communities, public case studies, help docs, social posts, and support-like discussions.

Decision gate: `Target segment`

## Stage 4: Validation Before Build

Bullseye should recommend the cheapest credible way to learn whether the product is worth building.

Validation options include:

- Problem interviews
- Landing page tests
- Fake-door tests
- Concierge MVPs
- Clickable prototype tests
- Pricing surveys
- Sales outreach
- Smoke tests
- Waitlist campaigns

The validation plan should define:

- Hypotheses
- Target audience
- Test design
- Assets needed
- Success thresholds
- Failure signals
- Expected learning

The key principle: production build should not begin until the team has a credible demand signal or explicitly accepts the risk of building before validation.

Decision gate: `Validation plan`

## Stage 5: Solution Strategy

Bullseye proposes multiple solution paths that vary by effort, ambition, complexity, and time-to-learning.

The current default options are:

- Concierge-assisted MVP
- Focused self-serve product
- Full platform bet

Each option should be scored by:

- Impact
- Confidence
- Effort
- Strategic fit
- Defensibility
- Implementation risk
- Time-to-validation

Bullseye recommends one default path while preserving alternatives for future roadmap planning.

Decision gate: `Solution option`

## Stage 6: MVP Scope

The MVP stage protects the team from overbuilding.

It separates:

- What ships in v1
- What remains manual
- What can be faked
- What is explicitly excluded
- What must be real for the product to prove value

This stage should be strict. If a feature does not directly prove the core value proposition or reduce validation risk, it belongs outside v1.

Decision gate: `MVP scope`

## Stage 7: Design and Prototyping

Bullseye generates design directions before code. The current prototype describes design approaches; a full version should create editable Figma artifacts or HTML prototypes.

Expected design coverage:

- Onboarding
- Main workflow
- Empty state
- Error state
- Loading state
- Success state
- Settings
- Permissions
- Upgrade or paywall moments where relevant

Design critique should check:

- Persona fit
- Clarity
- Usability
- Accessibility
- Trust
- Evidence visibility
- Edge cases

Decision gate: `Design direction`

## Stage 8: PRD and Product Artifacts

The PRD consolidates the research, strategy, design, and success model into a build-ready product document.

Expected PRD coverage:

- Problem statement
- Target users and personas
- Market context
- Goals and non-goals
- Jobs-to-be-done
- User stories
- Functional requirements
- Non-functional requirements
- UX requirements
- Analytics events
- Success metrics
- Risks and assumptions
- Launch plan
- Open questions

Companion artifacts can include:

- Roadmap
- Experiment plan
- GTM brief
- Pricing recommendation
- Launch checklist
- QA checklist
- Support FAQ
- Sales one-pager
- Investor-style summary

Decision gate: `PRD approval`

## Stage 9: Technical Planning

Before coding agents start, Bullseye creates an architecture brief.

Expected architecture coverage:

- Application structure
- Data model
- Integrations
- Authentication
- Permissions
- Analytics
- Deployment target
- Environment variables
- AI/model dependencies
- Scalability assumptions
- Security and privacy requirements
- Compliance risks
- Technical tradeoffs

Decision gate: `Architecture approval`

## Stage 10: Implementation via Coding Agents

Bullseye breaks the work into agent-ready tasks with clear ownership. This prevents coding agents from making product decisions or stepping on each other’s work.

Typical agent lanes:

- Frontend
- Backend
- Data and analytics
- Integrations
- QA
- Deployment

Every task should reference the approved PRD, design direction, MVP scope, architecture brief, and analytics plan.

Decision gate: `Build start`

## Stage 11: Launch and Learning Loop

Bullseye should launch with analytics and learning loops already in place.

Post-launch tracking should cover:

- Activation
- Retention
- Conversion
- Engagement
- Revenue
- Quality
- Reliability
- Relevant NFR metrics

The user should be able to ask natural-language questions about funnels, cohorts, feature adoption, drop-off, product quality, performance, and reliability.

Decision gate: `Launch readiness`

## Decision Gates

The current gate list is:

1. Initial brief
2. Research direction
3. Target segment
4. Validation plan
5. Solution option
6. MVP scope
7. Design direction
8. PRD approval
9. Architecture approval
10. Build start
11. Launch readiness

Each gate includes:

- Recommendation
- Risk
- Approval action
- Revision action
- Decision log entry

The decision log is important because it explains why later artifacts look the way they do.

## Current Prototype Boundaries

The current app is a static prototype. It does not yet perform live web research, create real Figma files, call coding agents, deploy software, or connect to an analytics warehouse. Instead, it models the intended workflow and generates structured artifacts from deterministic local logic.

Those boundaries are intentional for the first version: the goal is to prove the product loop and interaction model before integrating external systems.
