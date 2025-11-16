// ...existing code...
// playerCounts 配列（既存値）
const playerCounts = [
  25440,21988,23110,26225,21672,24791,25930,22544,21399,26310,23355,22107,
  24988,25744,21730,26011,22966,24402,21588,26340,23277,22290,24655,25800,
  21844,26188,23033,22411,25072,25510,21630,25977,22788,21455,24390,26202,
  22066,25344,22821,24599,22355,26055,23540,21799,26301,23188,25214
];

async function fetchAndAppendLatest() {
  try {
    const res = await fetch("/playercount");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const latest = data?.response?.player_count ?? null;
    console.log("fetched player_count:", latest);
    if (latest !== null) playerCounts.push(latest);
  } catch (e) {
    console.error("playercount fetch error:", e);
  }
}

function renderChart() {
  const canvas = document.getElementById('playerChart');
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: playerCounts.map((_, i) => i + 1),
      datasets: [{
        label: 'player_count',
        data: playerCounts,
        borderColor: '#000',
        backgroundColor: 'rgba(0,0,0,0.05)',
        fill: true,
        tension: 0.2,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { beginAtZero: false }
      }
    }
  });
}

(async function(){
  await fetchAndAppendLatest();
  renderChart();
})();
// ...existing code...
/*
(async function(){
  try {
    const res = await fetch("/playercount");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const PlayerCount = data?.response?.player_count ?? null;
    console.log(PlayerCount);
  } catch (e) {
    console.error("playercount fetch error:", e);
  }
})();
*/