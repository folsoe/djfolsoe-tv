const STATE_URL = "https://folsoetv.dk/api/theme";

async function setTheme(theme) {
  const status = document.getElementById("status");
  status.textContent = "Skifter til " + theme + "...";

  try {
    const res = await fetch(STATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error("API rejected theme");

    setActiveButton(data.theme);
    status.textContent = "Aktivt theme: " + data.theme;
  } catch (err) {
    status.textContent = "FEJL: Cloudflare API svarer ikke. Tjek Worker route /api/theme.";
  }
}

async function loadCurrentTheme() {
  const status = document.getElementById("status");
  try {
    const res = await fetch(STATE_URL + "?cache=" + Date.now());
    const data = await res.json();
    setActiveButton(data.theme || "fredagsbar");
    status.textContent = "Aktivt theme: " + (data.theme || "fredagsbar");
  } catch (err) {
    status.textContent = "Klar — men API kunne ikke læses endnu.";
  }
}

function setActiveButton(theme) {
  document.querySelectorAll("button[data-theme]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === theme);
  });
}

window.addEventListener("DOMContentLoaded", loadCurrentTheme);
