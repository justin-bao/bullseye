import assert from "node:assert/strict";
import test from "node:test";
import {
  answerMetricsQuestion,
  applyFollowUp,
  createProductCycle,
  exportMarkdown,
  setGateStatus,
  stages
} from "../src/agentEngine.mjs";

test("creates every planned stage and gate from a rough idea", () => {
  const cycle = createProductCycle({
    idea: "AI tool that helps clinic operators reduce patient no-shows",
    audience: "clinic operators",
    businessModel: "B2B SaaS",
    timeline: "30-day MVP",
    risk: "Validate cheaply first",
    materials: "Customers complain about manual reminders."
  });

  assert.equal(Object.keys(cycle.stages).length, stages.length);
  assert.equal(cycle.gates.length, stages.length);
  assert.equal(cycle.context.regulated, true);
  assert.ok(cycle.stages.market.sections.some((section) => section.title === "Evidence matrix"));
  assert.ok(cycle.stages.prd.sections.some((section) => section.title === "Analytics events"));
});

test("records approval gates and follow-up prompts", () => {
  let cycle = createProductCycle({ idea: "B2B onboarding analytics for founders" });
  cycle = setGateStatus(cycle, "brief", "approved");
  cycle = applyFollowUp(cycle, "market", "Focus on seed-stage SaaS companies.");

  assert.equal(cycle.gates.find((gate) => gate.id === "brief").status, "approved");
  assert.equal(cycle.decisionLog.length, 2);
  assert.ok(cycle.stages.market.sections.at(-1).items[0].includes("seed-stage SaaS"));
});

test("exports markdown and answers metric questions", () => {
  const cycle = createProductCycle({ idea: "Marketplace for product research participants" });
  const md = exportMarkdown(cycle);
  const answer = answerMetricsQuestion(cycle, "activation 42%, week-two retention 18%", "Where should we improve?");

  assert.ok(md.includes("Market and Competitive Research"));
  assert.ok(md.includes("Decision Log"));
  assert.ok(answer.includes("activation"));
  assert.ok(answer.includes("Recommended next step"));
});
