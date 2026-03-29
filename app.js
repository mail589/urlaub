const API_URL = "https://v0-vacation-today-api.vercel.app/api/vacation-today";

const dateLabel = document.getElementById("dateLabel");
const summary = document.getElementById("summary");
const vacationList = document.getElementById("vacationList");
const otherList = document.getElementById("otherList");
const vacationCount = document.getElementById("vacationCount");
const otherCount = document.getElementById("otherCount");
const refreshBtn = document.getElementById("refreshBtn");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEmpty(target, text) {
  target.innerHTML = `<div class="empty">${escapeHtml(text)}</div>`;
}

function renderError(text) {
  summary.innerHTML = `<div class="error">${escapeHtml(text)}</div>`;
  renderEmpty(vacationList, "Keine Daten verfügbar.");
  renderEmpty(otherList, "Keine Daten verfügbar.");
  vacationCount.textContent = "0";
  otherCount.textContent = "0";
}

function renderCards(target, items, kind) {
  if (!items || items.length === 0) {
    renderEmpty(
      target,
      kind === "vacation"
        ? "Heute ist niemand im Urlaub."
        : "Heute gibt es keine weiteren Abwesenheiten."
    );
    return;
  }

  target.innerHTML = items.map((item) => {
    const fullName =
      `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
      item.name ||
      "Unbekannt";

    const badgeClass = kind === "vacation" ? "badge-vacation" : "badge-other";
    const badgeText = kind === "vacation" ? "Urlaub" : (item.type || "Abwesend");

    return `
      <div class="card">
        <div class="card-main">
          <div class="name">${escapeHtml(fullName)}</div>
          <div class="meta">
            ${escapeHtml(item.type || "Abwesenheit")} ·
            bis ${escapeHtml(item.endDate || "unbekannt")} ·
            Rückkehr ${escapeHtml(item.returnDate || "unbekannt")}
          </div>
        </div>
        <div class="badge ${badgeClass}">${escapeHtml(badgeText)}</div>
      </div>
    `;
  }).join("");
}

async function loadData() {
  summary.textContent = "Lade Daten ...";

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API-Fehler: ${response.status}`);
    }

    const data = await response.json();

    const vacationItems = Array.isArray(data.vacation) ? data.vacation : [];
    const otherItems = Array.isArray(data.otherAbsences) ? data.otherAbsences : [];
    const total = Number(data.totalCount || 0);

    dateLabel.textContent = `Stand: ${escapeHtml(data.date || "")}`;
    vacationCount.textContent = String(vacationItems.length);
    otherCount.textContent = String(otherItems.length);

    if (total === 0) {
      summary.textContent = "Heute ist niemand abwesend.";
    } else if (total === 1) {
      summary.textContent = "Heute ist 1 Mitarbeitende:r abwesend.";
    } else {
      summary.textContent = `Heute sind ${total} Mitarbeitende abwesend.`;
    }

    renderCards(vacationList, vacationItems, "vacation");
    renderCards(otherList, otherItems, "other");
  } catch (error) {
    console.error(error);
    dateLabel.textContent = "Fehler beim Laden";
    renderError("Die Abwesenheiten konnten nicht geladen werden.");
  }
}

refreshBtn.addEventListener("click", loadData);

loadData();
setInterval(loadData, 10 * 60 * 1000);
