async function getUser(username) {
  const response = await fetch(`https://api.github.com/users/${username}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User "${username}" not found`);
    }
    if (response.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Please try again later.");
    }
    throw new Error("Failed to fetch profile data");
  }
  return await response.json();
}

async function getRepos(username) {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
  );

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("GitHub API rate limit exceeded.");
    }
    throw new Error("Could not fetch repositories");
  }
  return await response.json();
}

async function getLanguageStats(repos) {
  const totals = {};
  const topRepos = repos.slice(0, 10);

  for (const repo of topRepos) {
    if (!repo.languages_url) continue;
    try {
      const response = await fetch(repo.languages_url);
      if (response.status === 403) break; 
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

function showError(message) {
  const resultDiv = document.getElementById("profile-result");
  resultDiv.innerHTML = `
    <div class="profile-card error-card">
      <h2>Oops!</h2>
      <p class="bio">${message}</p>
    </div>
  `;
  
  currentLanguageData = null;
  animationProgress = 0;
  redraw();
  document.getElementById("chart-legend").innerHTML = '';
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

const searchForm = document.getElementById("search-form");
const usernameInput = document.getElementById("username-input");

searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  if (!username) return;

  document.getElementById("profile-result").innerHTML = '<div class="spinner"></div>';
  document.getElementById("chart-legend").innerHTML = '';
  currentLanguageData = null;
  animationProgress = 0;

  try {
    const user = await getUser(username);
    const repos = await getRepos(username);

    if (repos.length === 0) {
      displayProfile(user, []);
      document.getElementById("chart-container").style.display = "none";
      document.getElementById("chart-legend").innerHTML = 
        '<p style="color: var(--text-muted); text-align: center;">This user has no public repositories to analyze.</p>';
      return;
    }

    document.getElementById("chart-container").style.display = "flex";
    displayProfile(user, repos);

    const languageTotals = await getLanguageStats(repos);
    currentLanguageData = calculateLanguagePercentages(languageTotals);

    if (Object.keys(currentLanguageData).length === 0) {
      document.getElementById("chart-legend").innerHTML = 
        '<p style="color: var(--text-muted); text-align: center;">Could not detect programming languages in repositories.</p>';
    } else {
      animationProgress = 0;
      loop();
      renderHTMLLegend(currentLanguageData);
    }

  } catch (error) {
    showError(error.message);
  }
});

let currentLanguageData = null;
let animationProgress = 0;

const pieColors = [
  [242, 166, 141], 
  [232, 180, 184], 
  [224, 201, 162], 
  [245, 213, 190], 
  [214, 147, 147], 
  [196, 165, 186]
];

window.setup = function () {
  const canvas = createCanvas(400, 400);
  canvas.parent("chart-container");
};

window.draw = function () {
  background(34, 27, 32);

  if (!currentLanguageData || Object.keys(currentLanguageData).length === 0) {
    fill(196, 181, 184);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("No language data available", width / 2, height / 2);
    return;
  }

  if (animationProgress < 1) {
    animationProgress = lerp(animationProgress, 1, 0.08);
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 130;

  let startAngle = -HALF_PI;
  let colorIndex = 0;

  const maxTotalAnfle = TWO_PI * animationProgress;

  for (const lang in currentLanguageData) {
    const percentage = currentLanguageData[lang];
    const targetAngelSize = ((percentage / 100) * TWO_PI);

    const angleSize = targetAngelSize * animationProgress;
    const endAngle = startAngle + angleSize;

    const color = pieColors[colorIndex % pieColors.length];
    fill(color[0], color[1], color[2]);
    noStroke();

    arc(centerX, centerY, radius * 2, radius * 2, startAngle, endAngle, PIE);

    startAngle = endAngle;
    colorIndex++;
  }
};
