document.addEventListener('DOMContentLoaded', function () {
  const fetchBtn = document.getElementById('fetch-btn');
  const usernameInput = document.getElementById('username');
  const profileCard = document.getElementById('profile-card');

  fetchBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username) {
      profileCard.innerHTML = `<p style="color: var(--error-color);">Please enter a username.</p>`;
      profileCard.classList.add('show');
      return;
    }

    try {
      profileCard.innerHTML = `<p>Loading...</p>`;
      profileCard.classList.add('show');

      const res = await fetch(`https://api.github.com/users/${username}`);
      if (!res.ok) throw new Error('User not found');
      const data = await res.json();

      profileCard.innerHTML = `
        <div class="profile-avatar">
          <img src="${data.avatar_url}" alt="${data.login}">
        </div>
        <h2 class="profile-name">${data.name || data.login}</h2>
        <p class="profile-bio">${data.bio || 'No bio available.'}</p>
        <div class="profile-stats">
          <div><span>${data.public_repos}</span>Repos</div>
          <div><span>${data.followers}</span>Followers</div>
          <div><span>${data.following}</span>Following</div>
        </div>
        <a href="${data.html_url}" target="_blank" class="btn btn-secondary" style="margin-top:1rem;display:inline-block;">
          <i class="fab fa-github"></i> Visit Profile
        </a>
      `;
    } catch (error) {
      profileCard.innerHTML = `<p style="color: var(--error-color);">User not found. Please try again.</p>`;
      profileCard.classList.add('show');
    }
  });
});
