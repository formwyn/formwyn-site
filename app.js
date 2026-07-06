// Homepage "tell us about your room" flow. Calls /api/match, which does the
// real LLM extraction + matching server-side, and renders the returned
// reveal. Recency (last few setups shown to this visitor) is tracked
// client-side in localStorage and sent with each request so the variety
// mechanism can de-weight repeats without needing server-side session state.

const RECENCY_KEY = 'emberlo_recent_setups';
const RECENCY_WINDOW = 3;

function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENCY_KEY) || '[]');
  } catch {
    return [];
  }
}

function pushRecent(name) {
  const recent = getRecent();
  recent.push(name);
  while (recent.length > RECENCY_WINDOW) recent.shift();
  localStorage.setItem(RECENCY_KEY, JSON.stringify(recent));
}

function renderReveal(container, data) {
  const { reveal, setup } = data;
  const itemRows = (reveal.items || []).map((item) => `
    <tr>
      <td>${item.category}</td>
      <td>${item.product}</td>
      <td>${item.price}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="reveal-card">
      <p class="narrator">${reveal.narrator}</p>
      <table class="freshness-table">
        <thead><tr><th>Category</th><th>Pick</th><th>Price</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p class="core"><strong>Estimated total:</strong> ${reveal.totalEstimate}</p>
      <p class="freshness ${reveal.freshnessState}">${reveal.freshnessLine}</p>
      <a class="permalink" href="/setups/${setup.slug}.html">Permalink for ${setup.name}</a>
    </div>
  `;
}

function renderError(container, message) {
  container.innerHTML = `
    <div class="reveal-card error-card">
      <p class="narrator">Something went wrong finding your setup: ${message}</p>
    </div>
  `;
}

async function askEmberlo(text, container, button) {
  button.disabled = true;
  button.textContent = 'Putting your setup together…';
  try {
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, recentlyServed: getRecent() }),
    });
    const data = await res.json();
    if (!res.ok) {
      renderError(container, data.error || 'Unknown error');
      return;
    }
    renderReveal(container, data);
    pushRecent(data.setup.name);
  } catch (err) {
    renderError(container, err.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Reveal my setup';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ask-form');
  if (!form) return;
  const textarea = document.getElementById('ask-text');
  const button = document.getElementById('ask-button');
  const container = document.getElementById('reveal-container');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    askEmberlo(textarea.value.trim(), container, button);
  });
});
