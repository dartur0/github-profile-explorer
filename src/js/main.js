async function getUser(username) {
    try{
    const response = await fetch(`https://api.github.com/users/${username}`);

    if (!response.ok) {
        throw new Error('User not found');
    }

    const data = await response.json();
    console.log(data);
    return data;

    } catch (error) {
        console.log('Error:', error.message);
        return null;
    }
}

async function getRepos(username) {
    try{
    const response = await fetch(`https://api.github.com/users/${username}/repos`);

    if (!response.ok) {
        throw new Error('Could not fetch repositories');
    }

    const data = await response.json();
    console.log(data);
    return data;

    } catch (error) {
        console.log('Error:', error.message);
        return [];
    }
}

const searchButton = document.getElementById('search-btn');
const usernameInput = document.getElementById('username-input');

function displayProfile(user, repos) {
    const resultDiv = document.getElementById('profile-result');
    if (!user) {
        resultDiv.innerHTML = '<p class="error">User not found</p>';
        return;
    }

    resultDiv.innerHTML = `
    <div class="profile-card">
      <img src="${user.avatar_url}" alt="${user.login}" class="avatar">
      <h2>${user.name || user.login}</h2>
      <p class="username">@${user.login}</p>
      <p class="bio">${user.bio || ''}</p>
      <div class="profile-stats">
        <span>Repos: ${user.public_repos}</span>
        <span>Followers: ${user.followers}</span>
        <span>Following: ${user.following}</span>
      </div>
    </div>
  `;
}

searchButton.addEventListener('click', async function() {
    const username = usernameInput.value.trim();

    if (!username) return;
    const user = await getUser(username);
    const repos = await getRepos(username);

    displayProfile(user, repos);
});

