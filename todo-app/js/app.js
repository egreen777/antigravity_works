/**
 * Aether Tasks - Application Entry Point
 */
import { initState, subscribe, getFilteredTasks, getStats, getFilters } from './state.js';
import { renderTaskList, renderAnalytics, renderFilters, initUIListeners } from './ui.js';

// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');

/**
 * Initialize theme based on user preferences and localStorage
 */
function initTheme() {
  const savedTheme = localStorage.getItem('aether-tasks-theme') || 'dark';
  
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }
}

/**
 * Handle Theme Toggle Button click
 */
function handleThemeToggle() {
  if (document.body.classList.contains('dark-theme')) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('aether-tasks-theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('aether-tasks-theme', 'dark');
  }
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  // 1. Set theme
  initTheme();

  // 2. Wire theme toggle event listener
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', handleThemeToggle);
  }

  // 3. Initialize state
  initState();

  // 4. Initialize UI Event Listeners
  initUIListeners();

  // 5. Subscribe UI to State updates
  subscribe((filteredTasks, stats, filters) => {
    renderTaskList(filteredTasks);
    renderAnalytics(stats);
    renderFilters(filters);
  });

  // 6. Perform initial render
  renderTaskList(getFilteredTasks());
  renderAnalytics(getStats());
  renderFilters(getFilters());
});
