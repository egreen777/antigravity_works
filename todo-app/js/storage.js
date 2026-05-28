/**
 * Aether Tasks - Storage Management Module
 */

const STORAGE_KEY = 'aether-tasks-data';

// Default starter tasks to display on first load
const DEFAULT_TASKS = [
  {
    id: 'starter-1',
    title: 'Launch Aether Tasks Dashboard',
    desc: 'Review the glassmorphism layout, check responsiveness on mobile, and inspect animation frames.',
    priority: 'high',
    category: 'Work',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
    completed: false,
    created: Date.now() - 3600000,
    subtasks: [
      { id: 'sub-1-1', title: 'Review ES6 modules structure', completed: true },
      { id: 'sub-1-2', title: 'Test theme toggle mechanism', completed: false },
      { id: 'sub-1-3', title: 'Observe 60 FPS CSS transitions', completed: false }
    ]
  },
  {
    id: 'starter-2',
    title: 'Pick up weekly groceries',
    desc: 'Focus on fresh organic vegetables, oat milk, and healthy snacks for study/coding sessions.',
    priority: 'medium',
    category: 'Shopping',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], // 4 days from now
    completed: false,
    created: Date.now() - 7200000,
    subtasks: [
      { id: 'sub-2-1', title: 'Buy almond/oat milk', completed: true },
      { id: 'sub-2-2', title: 'Select green apples & avocados', completed: true },
      { id: 'sub-2-3', title: 'Granola & nuts', completed: false }
    ]
  },
  {
    id: 'starter-3',
    title: 'Morning 15-minute meditation',
    desc: 'Start the day with mindful breathing to clear the mind before starting coding.',
    priority: 'low',
    category: 'Health',
    dueDate: new Date().toISOString().split('T')[0], // Today
    completed: true,
    created: Date.now() - 86400000,
    subtasks: []
  }
];

/**
 * Load tasks from localStorage, seeding default items if empty.
 * @returns {Array} Array of task objects
 */
export function loadTasks() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      // Seed default tasks and save them
      saveTasks(DEFAULT_TASKS);
      return DEFAULT_TASKS;
    }
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Failed to load tasks from local storage:', error);
    return [];
  }
}

/**
 * Save tasks list to localStorage.
 * @param {Array} tasks Array of task objects
 */
export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to local storage:', error);
  }
}
