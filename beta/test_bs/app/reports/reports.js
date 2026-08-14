const REPORTS_KEY = "adaptive-entry-reports-v1";

const summary = document.getElementById("summary");
const reportList = document.getElementById("reportList");
const exportBox = document.getElementById("exportBox");
const copyAllBtn = document.getElementById("copyAllBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const clearBtn = document.getElementById("clearBtn");

function readReports() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatNumber(value, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "--";
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${Math.round(value * 100)}%` : "--";
}

function render() {
  const reports = readReports();
  exportBox.value = JSON.stringify(reports, null, 2);
  summary.textContent = reports.length
    ? `${reports.length} local report${reports.length === 1 ? "" : "s"} ready for analysis.`
    : "No reports yet. Run a measurement, then press Add report.";

  reportList.innerHTML = reports.slice().reverse().map((report) => {
    const summaryData = report.summary || {};
    const observer = report.observer || {};
    return `
      <article class="report-card">
        <h2>${new Date(report.createdAt).toLocaleString()}</h2>
        <p class="eyebrow">${observer.phonePlacement || "unknown"} · ${observer.signalFelt || "uncertain"} · ${observer.transitionTest || "not tested"}</p>
        <div class="facts">
          <span><strong>${formatNumber(summaryData.breathsPerMinute)}</strong><small>breaths/min</small></span>
          <span><strong>${formatNumber(summaryData.inhaleDuration)}</strong><small>inhale sec</small></span>
          <span><strong>${formatNumber(summaryData.exhaleDuration)}</strong><small>exhale sec</small></span>
          <span><strong>${formatPercent(summaryData.breathConfidence)}</strong><small>confidence</small></span>
        </div>
        <p class="notes">${observer.notes || "No notes."}</p>
      </article>
    `;
  }).join("");
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyAll() {
  const text = exportBox.value;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    exportBox.focus();
    exportBox.select();
    document.execCommand("copy");
  }
  summary.textContent = "Copied all reports for Codex.";
}

copyAllBtn.addEventListener("click", copyAll);
downloadAllBtn.addEventListener("click", () => {
  const reports = readReports();
  downloadJson(`adaptive-entry-reports-${new Date().toISOString().slice(0, 10)}.json`, reports);
});
clearBtn.addEventListener("click", () => {
  if (!window.confirm("Clear local reports from this browser?")) return;
  localStorage.removeItem(REPORTS_KEY);
  render();
});

render();
