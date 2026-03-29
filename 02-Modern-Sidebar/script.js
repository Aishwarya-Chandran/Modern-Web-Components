
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const navContent = document.getElementById('navContent');


const menuItems = [
  "Dashboard", "Analytics", "Projects", "Messages", 
  "Calendar", "Tasks", "Notifications", "Settings", "Help"
];

hamburger.onclick = () => {
  sidebar.classList.add('open');
  overlay.classList.add('active');
  hamburger.classList.add('open'); 
  setTimeout(() => searchInput.focus(), 300);
};

const closeSidebar = () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  hamburger.classList.remove('open'); 
  clearSearch();
};

overlay.onclick = closeSidebar;
closeBtn.onclick = closeSidebar;


function navigate(pageName) {
  const items = document.querySelectorAll('.nav-item');
  items.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-page') === pageName) {
      item.classList.add('active');
    }
  });
  
}


searchInput.oninput = (e) => {
  const query = e.target.value.trim().toLowerCase();

  if (!query) {
    clearSearch();
    return;
  }

 
  searchResults.style.setProperty('display', 'block', 'important');
  navContent.style.display = "none"; 

  
  const matches = menuItems
    .filter(item => item.toLowerCase().includes(query))
    .sort((a, b) => {
      const aStart = a.toLowerCase().startsWith(query);
      const bStart = b.toLowerCase().startsWith(query);
      return (aStart === bStart) ? 0 : (aStart ? -1 : 1);
    });

  if (matches.length === 0) {
    searchResults.innerHTML = `<div class="no-results" style="color: white; padding: 10px;">No results for "${query}"</div>`;
    return;
  }


  searchResults.innerHTML = matches.map(m => `
    <div class="search-result-item" data-target="${m}" style="display: flex; align-items: center; gap: 10px; padding: 10px; cursor: pointer;">
      <div class="ri-icon">
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </div>
      <span class="ri-label" style="color: rgba(255,255,255,0.8);">${m.replace(new RegExp(`(${query})`, 'gi'), '<mark style="background:none; color:#00f5ff; font-weight:bold;">$1</mark>')}</span>
    </div>
  `).join('');


  searchResults.querySelectorAll('.search-result-item').forEach(res => {
    res.onclick = () => {
      const target = res.getAttribute('data-target');
      navigate(target);
      clearSearch(); 
    };
  });
};

function clearSearch() {
  searchInput.value = "";
  searchResults.style.display = "none";
  searchResults.innerHTML = "";
  navContent.style.display = "block"; 
}


document.querySelectorAll('.nav-item').forEach(item => {
  item.onclick = () => navigate(item.getAttribute('data-page'));
});