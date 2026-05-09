import {
  answerMetricsQuestion,
  applyFollowUp,
  createProductCycle,
  exportMarkdown,
  setGateStatus,
  stages
} from "./agentEngine.mjs";

const storageKey = "one-shot-product-agent-state";
const form = document.querySelector("#intakeForm");
const artifactView = document.querySelector("#artifactView");
const stageTabs = document.querySelector("#stageTabs");
const gateList = document.querySelector("#gateList");
const decisionLog = document.querySelector("#decisionLog");
const activeStageLabel = document.querySelector("#activeStageLabel");
const gateProgress = document.querySelector("#gateProgress");
const decisionCount = document.querySelector("#decisionCount");
const mapNodes = document.querySelector("#mapNodes");

let state = loadState() ?? { cycle: null, activeStage: "brief" };

renderMap();
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = {
    idea: value("#ideaInput"),
    audience: value("#audienceInput"),
    businessModel: value("#modelInput"),
    timeline: value("#timelineInput"),
    risk: value("#riskInput"),
    materials: value("#materialsInput")
  };
  state = { cycle: createProductCycle(input), activeStage: "brief" };
  persist();
  render();
});

document.querySelector("#applyFollowUp").addEventListener("click", () => {
  const prompt = value("#followUpInput");
  if (!prompt || !state.cycle) return;
  state.cycle = applyFollowUp(state.cycle, state.activeStage, prompt);
  document.querySelector("#followUpInput").value = "";
  persist();
  render();
});

document.querySelector("#askData").addEventListener("click", () => {
  const answer = answerMetricsQuestion(state.cycle, value("#metricsInput"), value("#dataQuestion"));
  document.querySelector("#dataAnswer").textContent = answer;
});

document.querySelector("#exportMarkdown").addEventListener("click", () => {
  download("product-cycle.md", exportMarkdown(state.cycle), "text/markdown");
});

document.querySelector("#exportJson").addEventListener("click", () => {
  download("product-cycle.json", JSON.stringify(state.cycle, null, 2), "application/json");
});

function render() {
  renderTabs();
  renderArtifact();
  renderGates();
  renderDecisionLog();
  activeStageLabel.textContent = stages.find((stage) => stage.id === state.activeStage)?.label ?? "Brief";
}

function renderTabs() {
  stageTabs.innerHTML = "";
  for (const stage of stages) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = stage.id === state.activeStage ? "stage-tab active" : "stage-tab";
    button.textContent = stage.label;
    button.addEventListener("click", () => {
      state.activeStage = stage.id;
      persist();
      render();
    });
    stageTabs.append(button);
  }
}

function renderArtifact() {
  if (!state.cycle) return;
  const artifact = state.cycle.stages[state.activeStage];
  artifactView.innerHTML = "";
  const header = document.createElement("div");
  header.className = "artifact-header";
  header.innerHTML = `<p class="eyebrow">${state.cycle.context.domain}</p><h2>${escapeHtml(artifact.title)}</h2><p>${escapeHtml(state.cycle.context.idea)}</p>`;
  artifactView.append(header);

  for (const section of artifact.sections) {
    artifactView.append(renderSection(section));
  }
}

function renderSection(section) {
  const node = document.querySelector("#sectionTemplate").content.firstElementChild.cloneNode(true);
  node.querySelector("h3").textContent = section.title;
  node.querySelector("span").textContent = section.confidence;
  const body = node.querySelector(".section-body");
  const list = document.createElement("ul");
  for (const item of section.items) {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  }
  body.append(list);
  return node;
}

function renderGates() {
  gateList.innerHTML = "";
  if (!state.cycle) {
    gateList.innerHTML = `<div class="muted">Generate a product cycle to review approval gates.</div>`;
    gateProgress.textContent = "0/11";
    return;
  }
  const approved = state.cycle.gates.filter((gate) => gate.status === "approved").length;
  gateProgress.textContent = `${approved}/${state.cycle.gates.length}`;

  for (const gate of state.cycle.gates) {
    const card = document.createElement("article");
    card.className = `gate-card ${gate.status}`;
    card.innerHTML = `
      <div>
        <strong>${escapeHtml(gate.label)}</strong>
        <p>${escapeHtml(gate.recommendation)}</p>
        <small>Risk: ${escapeHtml(gate.risk)}</small>
      </div>
    `;
    const controls = document.createElement("div");
    controls.className = "gate-controls";
    controls.append(gateButton(gate.id, "approved", "Approve"));
    controls.append(gateButton(gate.id, "changes", "Revise"));
    card.append(controls);
    gateList.append(card);
  }
}

function gateButton(id, status, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", () => {
    state.cycle = setGateStatus(state.cycle, id, status);
    state.activeStage = id;
    persist();
    render();
  });
  return button;
}

function renderDecisionLog() {
  decisionLog.innerHTML = "";
  const entries = state.cycle?.decisionLog ?? [];
  decisionCount.textContent = String(entries.length);
  if (!entries.length) {
    decisionLog.innerHTML = `<div class="muted">Approvals, revisions, and follow-ups will appear here.</div>`;
    return;
  }
  for (const entry of entries.toReversed()) {
    const item = document.createElement("div");
    item.className = "decision-entry";
    item.innerHTML = `<strong>${escapeHtml(entry.decision)}</strong><span>${escapeHtml(entry.gate)}</span><p>${escapeHtml(entry.detail)}</p>`;
    decisionLog.append(item);
  }
}

function renderMap() {
  const points = [
    [70, 80],
    [145, 45],
    [220, 82],
    [295, 113],
    [370, 80],
    [445, 47],
    [520, 82],
    [595, 113],
    [670, 80],
    [745, 47],
    [820, 70]
  ];
  mapNodes.innerHTML = stages
    .map((stage, index) => {
      const [x, y] = points[index];
      return `
        <g>
          <circle cx="${x}" cy="${y}" r="20" fill="currentColor" opacity="0.14"></circle>
          <circle cx="${x}" cy="${y}" r="8" fill="currentColor"></circle>
          <text x="${x}" y="${y + 42}" text-anchor="middle">${stage.label}</text>
        </g>
      `;
    })
    .join("");
}

function value(selector) {
  return document.querySelector(selector).value.trim();
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(storageKey));
  } catch {
    return null;
  }
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function download(filename, content, type) {
  if (!content) return;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
