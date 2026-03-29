const API_URL = "https://v0-vacation-today-api.vercel.app/api/vacation-today";

const dateLabel = document.getElementById("dateLabel");
const summary = document.getElementById("summary");
const vacationList = document.getElementById("vacationList");
const otherList = document.getElementById("otherList");
const vacationCount = document.getElementById("vacationCount");
const otherCount = document.getElementById("otherCount");
const refreshBtn = document.getElementById("refreshBtn");

function renderEmpty(target, text) {
  target.innerHTML = `<div class="empty">${text}</div>`;
}

function renderCards(target, items) {
  if (!items || items.length === 0) {
    renderEmpty(target, "Keine Einträge");
    return;
  }

  target.innerHTML = items.map(e => `
    <div class="card">
      <strong>${e.name}</strong><br/>
      ${e.type || ""} bis ${e.endDate || ""}
    </div>
  `).join("");
}

async function loadData() {
  summary.textContent = "Lade Daten ...";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    dateLabel.textContent = "Stand: " + data.date;

    const vacation = data.vacation || [];
    const other = data.otherAbsences || [];
    const total = data.totalCount || 0;

    vacationCount.textContent = vacation.length;
    otherCount.textContent = other.length;

    if (total === 0) {
      summary.textContent = "Heute ist niemand abwesend.";
    } else {
      summary.textContent = total + " Mitarbeitende abwesend";
    }

    renderCards(vacationList, vacation);
    renderCards(otherList, other);

  } catch (e) {
    summary.textContent = "Fehler beim Laden";
  }
}

refreshBtn.onclick = loadData;

loadData();
