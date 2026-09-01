async function getUser(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error("User not found");
    return await response.json();
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

async function getRepos(username) {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
    );
    if (!response.ok) throw new Error("Could not fetch repositories");
    return await response.json();
  } catch (error) {
    console.error("Error:", error.message);
    return [];
  }
}

async function getLanguageStats(repos) {
  const totals = {};

  const topRepos = repos.slice(0, 10);

  for (const repo of topRepos) {
    if (!repo.languages_url) continue;
    try {
      const response = await fetch(repo.languages_url);
      if (!response.ok) continue;

      const languages = await response.json();
      for (const lang in languages) {
        totals[lang] = (totals[lang] || 0) + languages[lang];
      }
    } catch (error) {
      console.warn("Skipping repo due to error:", repo.name);
    }
  }
  return totals;
}

function calculateLanguagePercentages(totals) {
  const totalBytes = Object.values(totals).reduce((sum, val) => sum + val, 0);
  if (totalBytes === 0) return {};

  const percentages = {};
  for (const lang in totals) {
    percentages[lang] = (totals[lang] / totalBytes) * 100;
  }
  return percentages;
}

function renderHTMLLegend(data) {
  const legendDiv = document.getElementById('chart-legend');
  legendDiv.innerHTML = '';

  let colorIndex = 0;
  for (const lang in data ) {
    const percentage = data[lang].toFixed(1);
    const color = pieColors[colorIndex % pieColors.length];

    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="color-box" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]})"></span>
      <span class="lang-name">${lang}</span>
      <span class="lang-percent">${percentage}%</span>
    `;
    legendDiv.appendChild(item);
    colorIndex++;
  }
}

function displayProfile(user, repos) {
  const resultDiv = document.getElementById("profile-result");
  if (!user) {
    resultDiv.innerHTML = '<p class="error">User not found</p>';
    return;
  }

  const reposHTML = repos
    .map(
      (repo) => `
    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-card">
      <h3>${repo.name}</h3>
      <p>${repo.description || "No description"}</p>
      <div class="repo-meta">
        <span>${repo.stargazers_count}</span>
        <span>${repo.language || "Unknown"}</span>
      </div>
    </a>
  `,
    )
    .join("");

  resultDiv.innerHTML = `
    <div class="profile-card">
      <img src="${user.avatar_url}" alt="${user.login}" class="avatar">
      <h2>${user.name || user.login}</h2>
      <p class="username">@${user.login}</p>
      <p class="bio">${user.bio || ""}</p>
      <div class="profile-stats">
        <span>Repos: ${user.public_repos}</span>
        <span>Followers: ${user.followers}</span>
        <span>Following: ${user.following}</span>
      </div>
    </div>
    <div class="repos-list">
      ${reposHTML}
    </div>
  `;
}

const searchButton = document.getElementById("search-btn");
const usernameInput = document.getElementById("username-input");

searchButton.addEventListener("click", async function () {
  const username = usernameInput.value.trim();
  if (!username) return;

  document.getElementById("profile-result").innerHTML = "<p>Loading...</p>";

  const user = await getUser(username);
  const repos = await getRepos(username);

  displayProfile(user, repos);

  if (user && repos.length > 0) {
    const languageTotals = await getLanguageStats(repos);
    currentLanguageData = calculateLanguagePercentages(languageTotals);
    redraw();
    renderHTMLLegend(currentLanguageData);
  }
});

let currentLanguageData = null;

const pieColors = [
  [232, 160, 191],
  [107, 122, 153],
  [143, 166, 201],
  [201, 123, 156],
  [237, 225, 229],
  [76, 92, 119],
];

window.setup = function () {
  const canvas = createCanvas(400, 400);
  canvas.parent("chart-container");
  noLoop();
};

window.draw = function () {
  background(31, 36, 56);

  if (!currentLanguageData || Object.keys(currentLanguageData).length === 0) {
    fill(255);
    textAlign(CENTER, CENTER);
    text("No language data available", width / 2, height / 2);
    return;
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 130;

  let startAngle = 0;
  let colorIndex = 0;

  for (const lang in currentLanguageData) {
    const percentage = currentLanguageData[lang];
    const angleSize = (percentage / 100) * TWO_PI;
    const endAngle = startAngle + angleSize;

    const color = pieColors[colorIndex % pieColors.length];
    fill(color[0], color[1], color[2]);
    noStroke();

    arc(centerX, centerY, radius * 2, radius * 2, startAngle, endAngle, PIE);

    startAngle = endAngle;
    colorIndex++;
  }
};
