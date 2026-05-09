export const stages = [
  { id: "brief", label: "Brief", gate: "Initial brief" },
  { id: "market", label: "Market", gate: "Research direction" },
  { id: "users", label: "Users", gate: "Target segment" },
  { id: "validation", label: "Validation", gate: "Validation plan" },
  { id: "strategy", label: "Strategy", gate: "Solution option" },
  { id: "mvp", label: "MVP", gate: "MVP scope" },
  { id: "design", label: "Design", gate: "Design direction" },
  { id: "prd", label: "PRD", gate: "PRD approval" },
  { id: "architecture", label: "Architecture", gate: "Architecture approval" },
  { id: "build", label: "Build", gate: "Build start" },
  { id: "launch", label: "Launch", gate: "Launch readiness" }
];

const positiveSignals = ["reduce", "save", "increase", "automate", "replace", "improve", "faster", "cheaper"];
const regulatedTerms = ["health", "medical", "finance", "legal", "insurance", "children", "bank", "clinical", "clinic", "patient"];

export function createProductCycle(input) {
  const context = normalizeInput(input);
  const brief = buildBrief(context);
  const market = buildMarketResearch(context);
  const users = buildUserResearch(context);
  const validation = buildValidationPlan(context, users);
  const strategy = buildStrategy(context, validation);
  const mvp = buildMvpScope(context, strategy);
  const design = buildDesignPlan(context, users);
  const prd = buildPrd(context, brief, users, mvp);
  const architecture = buildArchitecture(context, prd);
  const build = buildAgentTasks(context, architecture);
  const launch = buildLaunchPlan(context);

  return {
    context,
    generatedAt: new Date().toISOString(),
    stages: { brief, market, users, validation, strategy, mvp, design, prd, architecture, build, launch },
    gates: stages.map((stage) => ({
      id: stage.id,
      label: stage.gate,
      status: "pending",
      recommendation: gateRecommendation(stage.id),
      risk: gateRisk(stage.id)
    })),
    decisionLog: []
  };
}

export function applyFollowUp(cycle, stageId, prompt) {
  if (!cycle || !cycle.stages?.[stageId] || !prompt.trim()) return cycle;
  const stage = cycle.stages[stageId];
  const note = {
    title: "User follow-up",
    confidence: "User-directed",
    items: [
      `Prompt: ${prompt.trim()}`,
      "Agent response: refine this stage by treating the prompt as a new constraint, adding research depth where relevant, and preserving prior decisions unless explicitly changed."
    ]
  };

  return {
    ...cycle,
    stages: {
      ...cycle.stages,
      [stageId]: {
        ...stage,
        sections: [...stage.sections, note]
      }
    },
    decisionLog: [
      ...cycle.decisionLog,
      {
        at: new Date().toISOString(),
        gate: stageId,
        decision: "Follow-up added",
        detail: prompt.trim()
      }
    ]
  };
}

export function setGateStatus(cycle, gateId, status) {
  const gate = cycle.gates.find((item) => item.id === gateId);
  const label = gate?.label ?? gateId;
  return {
    ...cycle,
    gates: cycle.gates.map((item) => (item.id === gateId ? { ...item, status } : item)),
    decisionLog: [
      ...cycle.decisionLog,
      {
        at: new Date().toISOString(),
        gate: label,
        decision: status === "approved" ? "Approved" : "Changes requested",
        detail: status === "approved" ? "User accepted this gate." : "User requested another pass before proceeding."
      }
    ]
  };
}

export function answerMetricsQuestion(cycle, metricsText, question) {
  if (!cycle) return "Generate a product cycle first so the analytics answer can reference the intended metrics plan.";
  const q = question.trim() || "What should we learn next?";
  const metrics = metricsText.trim() || "No live metrics supplied yet.";
  const relevantEvents = cycle.stages.prd.sections
    .find((section) => section.title === "Analytics events")
    ?.items.slice(0, 4)
    .join(", ");

  return [
    `Question: ${q}`,
    `Available data: ${metrics}`,
    `Readout: compare the supplied metrics against the planned events (${relevantEvents}). Prioritize the largest drop-off between activation and retained use, then inspect whether reliability or onboarding friction explains it.`,
    "Recommended next step: create one learning-oriented experiment with a clear owner, metric, threshold, and review date."
  ].join("\n\n");
}

export function exportMarkdown(cycle) {
  if (!cycle) return "";
  const lines = [`# One-Shot Product Cycle`, "", `Generated: ${cycle.generatedAt}`, ""];
  for (const stage of stages) {
    const artifact = cycle.stages[stage.id];
    lines.push(`## ${artifact.title}`, "");
    for (const section of artifact.sections) {
      lines.push(`### ${section.title}`);
      if (section.confidence) lines.push(`Confidence: ${section.confidence}`);
      for (const item of section.items) lines.push(`- ${item}`);
      lines.push("");
    }
  }
  lines.push("## Decision Log", "");
  for (const entry of cycle.decisionLog) lines.push(`- ${entry.at}: ${entry.gate} - ${entry.decision}. ${entry.detail}`);
  return lines.join("\n");
}

function normalizeInput(input) {
  const idea = clean(input.idea) || "A new product concept that needs market, user, validation, design, and build planning.";
  const audience = clean(input.audience) || inferAudience(idea);
  const businessModel = clean(input.businessModel) || "Unknown / explore";
  const timeline = clean(input.timeline) || "2-week validation sprint";
  const risk = clean(input.risk) || "Validate cheaply first";
  const materials = clean(input.materials);
  const domain = inferDomain(idea, materials);
  const regulated = regulatedTerms.some((term) => `${idea} ${materials}`.toLowerCase().includes(term));
  const outcome = inferOutcome(idea);
  return { idea, audience, businessModel, timeline, risk, materials, domain, regulated, outcome };
}

function buildBrief(context) {
  return artifact("Working Product Brief", [
    section("Problem framing", "Medium", [
      `Idea: ${context.idea}`,
      `Primary audience: ${context.audience}`,
      `Desired outcome: ${context.outcome}`,
      `Business model to explore: ${context.businessModel}`
    ]),
    section("Clarifying questions", "High", [
      "Who feels the pain most acutely and how often?",
      "What workaround do they use today and what does it cost in time, money, risk, or status?",
      "What decision must the user make before the agent starts building?",
      "Which existing assets, relationships, data, or distribution channels can lower validation cost?"
    ]),
    section("Constraints and inputs", "Medium", [
      `Timeline posture: ${context.timeline}`,
      `Risk posture: ${context.risk}`,
      context.materials ? `Supplementary material captured: ${context.materials}` : "No supplementary material supplied yet.",
      context.regulated ? "Regulated-domain review required before launch." : "No obvious regulated-domain trigger detected from the prompt."
    ])
  ]);
}

function buildMarketResearch(context) {
  return artifact("Market and Competitive Research", [
    section("Research agenda", "High", [
      `Define TAM/SAM/SOM for the ${context.domain} opportunity using top-down market reports and bottom-up buyer counts.`,
      "Map market growth, purchasing urgency, budget ownership, switching costs, and procurement cycles.",
      "Separate direct competitors, indirect competitors, substitute workflows, and internal build options.",
      "Track pricing, packaging, positioning, channels, funding, partnerships, and likely strategic wedges."
    ]),
    section("Initial market hypotheses", "Medium", [
      "TAM should be expressed as all spend adjacent to the broad workflow or problem category.",
      "SAM should narrow to reachable geography, segment, platform, and buyer type.",
      "SOM should be a credible 24-month capture model based on distribution access and conversion assumptions.",
      "Adoption will depend more on trust, workflow fit, and measurable ROI than feature volume."
    ]),
    section("Evidence matrix", "Needs live sources", [
      "High confidence: user-visible competitor positioning, public pricing, public feature sets, review themes.",
      "Medium confidence: market growth forecasts, segment-specific budgets, share estimates.",
      "Low confidence until validated: willingness to switch, exact willingness to pay, urgency by persona.",
      "Contradiction check: compare analyst reports, public financials, review sites, forums, and customer interviews."
    ])
  ]);
}

function buildUserResearch(context) {
  const roles = inferRoles(context.audience);
  return artifact("User Research and Personas", [
    section("Pain point synthesis", "Medium", [
      `Likely core pain: ${context.outcome} without increasing operational burden.`,
      "Current workaround likely involves spreadsheets, manual coordination, generic tools, or under-instrumented internal processes.",
      "Strongest frustration themes to research: time loss, missed revenue, lack of visibility, error risk, stakeholder follow-up, and low confidence in decisions.",
      "Switching objections: setup effort, trust, integration burden, unclear ROI, and fear of workflow disruption."
    ]),
    section("Personas", "Medium", roles.map((role) => `${role.name}: ${role.summary}`)),
    section("Jobs-to-be-done", "Medium", [
      "When the user has a recurring workflow or decision to manage, they want a guided system that reduces effort and improves confidence.",
      "When a buyer evaluates the product, they want evidence that the tool creates measurable business value quickly.",
      "When an admin rolls it out, they want configuration, permissions, and monitoring without constant support requests.",
      "When a blocker resists adoption, they need proof that the new process is safer, clearer, and less disruptive than the status quo."
    ])
  ]);
}

function buildValidationPlan(context, users) {
  return artifact("Validation Before Build", [
    section("Recommended cheapest credible test", "High", [
      "Run 8 to 12 problem interviews with the sharpest target persona before building.",
      "Pair interviews with a fake-door landing page that measures CTA intent for the top promised outcome.",
      "Use a clickable prototype or concierge workflow only after problem urgency and current workaround cost are confirmed.",
      "Do not begin production build until at least one segment shows urgent pain, reachable distribution, and willingness to try."
    ]),
    section("Hypotheses", "Medium", [
      `${context.audience} experience the problem frequently enough to seek a dedicated solution.`,
      "The strongest value proposition can be communicated in one sentence and understood without a demo.",
      "At least one persona will trade setup effort or payment for measurable reduction in pain.",
      "A narrow MVP can prove value without automating every edge case."
    ]),
    section("Success thresholds", "Medium", [
      "60% or more of interviewed target users describe the pain as frequent and costly without prompting.",
      "30% or more of qualified landing page visitors click the primary CTA.",
      "5 or more qualified prospects agree to a follow-up demo, pilot, or paid concierge test.",
      "Clear failure signal: users like the concept but will not change behavior, pay, or share data."
    ]),
    section("Generated validation assets", "High", [
      "Interview script: ask about the last time the problem occurred, current workaround, cost, decision owner, and attempted alternatives.",
      "Landing page headline: Turn your rough workflow into a measurable outcome without adding operational drag.",
      "Outreach angle: looking for teams already feeling this problem weekly, not broad opinion feedback.",
      "Survey prompt: rank urgency, current spend, switching concern, and preferred proof point."
    ])
  ]);
}

function buildStrategy(context) {
  return artifact("Solution Strategy and Prioritization", [
    section("Option A: concierge-assisted MVP", "High", [
      "Use manual operations behind a polished intake, dashboard, and reporting layer.",
      "Best for validating willingness to pay and workflow shape quickly.",
      "Score: high confidence, low effort, medium defensibility, fastest time-to-learning."
    ]),
    section("Option B: focused self-serve product", "Medium", [
      "Build one core workflow end to end with onboarding, integrations, analytics, and repeatable templates.",
      "Best when the target segment and repeat behavior are already clear.",
      "Score: medium confidence, medium effort, higher scalability, moderate implementation risk."
    ]),
    section("Option C: full platform bet", "Low until validated", [
      "Build broader automation, collaboration, admin, permissions, and analytics from day one.",
      "Best only if the market evidence, enterprise demand, and distribution advantage are strong.",
      "Score: high ambition, high effort, slower learning, greater risk of overbuilding."
    ]),
    section("Recommendation", "High", [
      `Default to Option A for ${context.timeline}, then graduate to Option B after validation gates pass.`,
      "Preserve Option C as a roadmap vision, not the initial build target."
    ])
  ]);
}

function buildMvpScope(context) {
  return artifact("MVP Boundary", [
    section("Ship in v1", "High", [
      "Guided intake for the target workflow or problem.",
      "One core output that proves the promised value.",
      "Basic account/project persistence, artifact export, and review workflow.",
      "Instrumentation for activation, completion, conversion, quality, and reliability metrics."
    ]),
    section("Manual or faked", "High", [
      "Manual research synthesis behind the scenes until source patterns stabilize.",
      "Concierge onboarding for first pilots.",
      "Limited integrations through CSV/import-paste before building deep sync.",
      "Human review for high-risk recommendations."
    ]),
    section("Exclude from v1", "High", [
      "Broad admin customization.",
      "Complex multi-workspace permissions.",
      "Full marketplace or partner ecosystem.",
      "Automated decisions in regulated contexts without review and auditability."
    ])
  ]);
}

function buildDesignPlan(context, users) {
  return artifact("Design and Prototyping", [
    section("Prototype directions", "High", [
      "Command center: a dense PM workspace with stage tabs, gates, evidence, artifacts, and decisions.",
      "Wizard mode: a guided conversational flow for less experienced founders.",
      "Board mode: research, validation, design, build, and launch cards that move through approval states."
    ]),
    section("Editable artifact requirements", "High", [
      "Produce Figma-ready frames or HTML prototypes for onboarding, main workflow, empty state, success state, error state, settings, permissions, and paywall if relevant.",
      "Use a quiet operational UI with high information density, clear hierarchy, and strong scanability.",
      "Support design schema selection: default SaaS, consumer mobile, enterprise admin, or marketplace."
    ]),
    section("Design critique checklist", "High", [
      "Can each persona understand the promised value in under 10 seconds?",
      "Are evidence quality and assumptions visible enough to earn trust?",
      "Are approval gates obvious without blocking exploration?",
      "Are accessibility, loading, error, and empty states designed before build?"
    ])
  ]);
}

function buildPrd(context, brief, users, mvp) {
  return artifact("PRD", [
    section("Problem and goals", "High", [
      `Problem: ${context.idea}`,
      `Primary goal: help ${context.audience} reach ${context.outcome}.`,
      "Non-goal: do not build a broad platform before validating the narrow workflow.",
      "Launch criterion: users complete the core workflow and confirm the output is useful enough to act on."
    ]),
    section("Functional requirements", "High", [
      "Accept freeform product/problem input and optional supporting materials.",
      "Generate a staged product cycle with research, personas, validation, strategy, MVP, design, PRD, architecture, build, and launch artifacts.",
      "Allow follow-up prompts at every stage without resetting the workflow.",
      "Require explicit approval gates and preserve a decision log.",
      "Export product artifacts as Markdown and JSON."
    ]),
    section("Non-functional requirements", "High", [
      "Artifacts must be explainable, versionable, and easy to review.",
      "Research claims must show confidence and source-quality status.",
      "The system must degrade gracefully when live integrations are unavailable.",
      context.regulated ? "Regulated-domain flows require privacy, compliance, and human-review safeguards." : "No special compliance mode required unless new inputs trigger it."
    ]),
    section("Analytics events", "High", [
      "idea_submitted",
      "research_stage_completed",
      "gate_approved",
      "validation_asset_exported",
      "design_direction_selected",
      "build_plan_generated",
      "launch_readiness_approved"
    ]),
    section("Success metrics", "High", [
      "Activation: percentage of users generating a complete product cycle from first input.",
      "Engagement: follow-up prompts per stage and artifact exports per project.",
      "Conversion: percentage approving MVP/build gates or starting validation outreach.",
      "Quality: user-rated artifact usefulness and number of assumptions resolved.",
      "Reliability: generation completion rate and time to usable artifact."
    ])
  ]);
}

function buildArchitecture(context) {
  return artifact("Technical Planning", [
    section("Application structure", "Medium", [
      "Frontend: workflow UI, artifact viewer, decision gate controls, export tools, and data-stack Q&A.",
      "Backend: project state, artifact generation orchestration, web research jobs, file ingestion, integrations, and audit log.",
      "Agent layer: specialized workers for market research, user research, design, PRD, architecture, coding, QA, and analytics interpretation.",
      "Persistence: projects, stages, artifacts, decisions, source citations, uploaded materials, analytics mappings, and generated code tasks."
    ]),
    section("Integration points", "Medium", [
      "Web/search APIs for live research and citations.",
      "Figma for editable design artifacts; HTML prototypes as fallback.",
      "GitHub or equivalent for code agent task tracking and PRs.",
      "Deployment target for preview builds.",
      "Analytics warehouse or product analytics tools for post-launch questions."
    ]),
    section("Security and privacy", "Medium", [
      "Store uploaded materials with project-level access controls.",
      "Redact sensitive customer data before model calls when possible.",
      "Maintain source provenance and decision audit trails.",
      "Add compliance review for regulated domains, enterprise data, and financial or health claims."
    ])
  ]);
}

function buildAgentTasks() {
  return artifact("Coding Agent Task Breakdown", [
    section("Frontend agent", "High", [
      "Build the stage workspace, intake form, artifact renderer, decision gates, follow-up prompts, exports, and data Q&A surface.",
      "Implement responsive layouts, accessible controls, loading states, empty states, and error states.",
      "Verify core flows in browser across desktop and mobile widths."
    ]),
    section("Backend agent", "Medium", [
      "Implement project persistence, artifact versioning, file ingestion, source citation storage, and gate decision audit logs.",
      "Create orchestration endpoints for research, persona generation, validation planning, PRD generation, and build task creation."
    ]),
    section("Data and analytics agent", "Medium", [
      "Define analytics schema, event capture, funnel queries, cohort templates, NFR dashboards, and natural-language metric answer retrieval.",
      "Ship instrumentation before launch."
    ]),
    section("QA agent", "High", [
      "Test vague and specific prompts, follow-up continuity, gate approvals, export fidelity, analytics events, and graceful failure without integrations.",
      "Run accessibility checks and regression checks before launch readiness approval."
    ])
  ]);
}

function buildLaunchPlan() {
  return artifact("Launch and Learning Loop", [
    section("Launch readiness", "High", [
      "PRD, architecture, MVP scope, analytics plan, QA checklist, and launch checklist are approved.",
      "Validation thresholds have either passed or an explicit risk acceptance decision is logged.",
      "Support FAQ, onboarding copy, feedback path, and rollback plan are ready."
    ]),
    section("Post-launch learning", "High", [
      "Review activation, completion, conversion, retention, quality ratings, reliability, and qualitative feedback weekly.",
      "Generate experiment recommendations from observed drop-offs and unresolved assumptions.",
      "Update roadmap based on validated pain, adoption signals, and revenue or engagement evidence."
    ]),
    section("NFR monitoring", "Medium", [
      "Track latency, generation completion rate, error rate, uptime, accessibility issues, and data freshness.",
      "Escalate reliability regressions before adding new feature scope."
    ])
  ]);
}

function artifact(title, sections) {
  return { title, sections };
}

function section(title, confidence, items) {
  return { title, confidence, items };
}

function clean(value) {
  return String(value ?? "").trim();
}

function inferAudience(idea) {
  const lower = idea.toLowerCase();
  if (lower.includes("enterprise")) return "enterprise buyers and operators";
  if (lower.includes("founder") || lower.includes("startup")) return "founders and startup teams";
  if (lower.includes("patient") || lower.includes("clinic")) return "care teams and patients";
  if (lower.includes("developer") || lower.includes("engineer")) return "technical teams";
  return "the highest-urgency users in this workflow";
}

function inferDomain(idea, materials) {
  const text = `${idea} ${materials}`.toLowerCase();
  if (text.includes("health") || text.includes("clinic") || text.includes("patient")) return "healthcare workflow";
  if (text.includes("finance") || text.includes("invoice") || text.includes("payment")) return "financial operations";
  if (text.includes("education") || text.includes("student")) return "education technology";
  if (text.includes("sales") || text.includes("crm")) return "sales productivity";
  if (text.includes("ai") || text.includes("agent")) return "AI workflow software";
  return "workflow software";
}

function inferOutcome(idea) {
  const lower = idea.toLowerCase();
  const signal = positiveSignals.find((item) => lower.includes(item));
  if (signal) return `${signal} the most painful part of the current workflow`;
  return "create a clearer, faster, and more measurable workflow";
}

function inferRoles(audience) {
  const base = audience || "target users";
  return [
    { name: "Primary user", summary: `A hands-on ${base} persona who feels the pain repeatedly and needs the workflow to become easier immediately.` },
    { name: "Economic buyer", summary: "Owns budget, needs measurable ROI, and will compare the product against current tools, labor, and opportunity cost." },
    { name: "Admin or operator", summary: "Handles rollout, permissions, data quality, training, and support expectations." },
    { name: "Blocker", summary: "Worries about switching cost, trust, data exposure, change management, or unclear ownership." }
  ];
}

function gateRecommendation(stageId) {
  const map = {
    brief: "Approve once the problem, audience, assumptions, and constraints are clear enough to research.",
    market: "Approve when the research agenda and evidence confidence model fit the decision being made.",
    users: "Approve after selecting the sharpest initial segment.",
    validation: "Approve the cheapest credible test before build work starts.",
    strategy: "Choose one solution path as the default.",
    mvp: "Lock v1 boundaries and name what will remain manual.",
    design: "Select the UX direction and design schema.",
    prd: "Approve requirements, success metrics, and launch criteria.",
    architecture: "Approve technical shape, integrations, risks, and privacy posture.",
    build: "Start coding only after product and technical decisions are logged.",
    launch: "Launch after QA, analytics, support, and rollback plans are ready."
  };
  return map[stageId];
}

function gateRisk(stageId) {
  const map = {
    brief: "Research may chase the wrong audience.",
    market: "Market claims may sound precise without evidence.",
    users: "Personas may be too broad to guide product choices.",
    validation: "Skipping this creates a polished product with weak demand proof.",
    strategy: "Trying all options at once will blur scope.",
    mvp: "Overbuilding delays learning.",
    design: "Mockups may optimize polish over workflow clarity.",
    prd: "Ambiguous requirements create avoidable build churn.",
    architecture: "Integration and data risks may surface too late.",
    build: "Coding agents need crisp ownership to avoid conflicting work.",
    launch: "Without analytics and support paths, learning will be noisy."
  };
  return map[stageId];
}
