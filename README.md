# GitHub Profile Explorer

An interactive web application for analyzing GitHub user profiles, exploring public repositories, and visualizing language statistics in real time.

https://dartur0.github.io/github-analyzer/

## Features

* **Profile Overview** — fetches user details including avatar, bio, follower/following counts, and public repo metrics.
* **Repository Showcase** — displays up to 100 recent public repositories with direct links, descriptions, star counts, and primary languages.
* **Language Statistics Visualization** — fetches detailed byte-level language usage across top repositories and calculates exact percentage shares.
* **Animated p5.js Pie Chart** — smooth, interactive pie chart rendering with a dynamic HTML color legend.
* **Edge Case & Error Handling** — gracefully manages non-existent users, empty repository lists, missing language data, and GitHub API rate limits with user-friendly UI alerts.
* **Responsive & Glassmorphism UI** — clean, dark-mode design styled with CSS variables and subtle backdrop blur effects.

## Tech Stack

* **HTML5 / CSS3** — semantic structure, modern Flexbox & Grid layouts, CSS variables, Glassmorphism aesthetic (no external CSS frameworks).
* **JavaScript (ES6+)** — asynchronous API fetching (`async/await`), DOM manipulation, modular event handling.
* **p5.js** — dynamic HTML5 Canvas rendering for animated chart visualization.
* **GitHub REST API** — data source for profile metadata, repository lists, and language bytes.

## How It Works

1. **User Search**: Submitting a username triggers parallel requests to the GitHub REST API for profile and repository information.
2. **Language Aggregation**: The app fetches language byte distributions for the top 10 most recently updated repositories to optimize API rate limit usage (60 requests/hour unauthenticated).
3. **Data Processing**: Raw byte counts are aggregated and converted into percentages relative to total code volume.
4. **Canvas Rendering**: `p5.js` calculates arc angles ($(\text{percentage} / 100) \cdot 2\pi$) and animates pie sectors frame-by-frame using linear interpolation (`lerp`).

## Project Structure

```text
github-analyzer/
├── index.html
├── README.md
└── src/
    ├── css/
    │   └── style.css
    └── js/
        └── main.js

```

## Running Locally

This project runs natively as a static web application without build tools.

1. Clone the repository:
```bash
git clone [[https://github.com/ваш-логин/github-analyzer.git]([https://dartur0.github.io/github-analyzer/
)](https://github.com/ваш-логин/github-analyzer.git](https://dartur0.github.io/github-analyzer/
))
cd github-analyzer

```


2. Serve the folder using any static HTTP server (required for ES modules):
* **VS Code**: Install the **Live Server** extension, open `index.html`, and click **Go Live**.
* **Python 3**: Run `python -m http.server 8000` in the project root and open `http://localhost:8000`.


## Possible Future Improvements

* **Personal Access Token (PAT) Input** — allow users to optionally supply a token to increase API rate limits from 60 to 5,000 requests/hour.
* **Repository Filtering & Sorting** — sort repos by stars, forks, or size directly in the UI.
* **Commit History Activity Heatmap** — render a contribution calendar using canvas or SVG.
