/**
 * Aether Tasks - State Management Module
 */
import { loadTasks, saveTasks } from './storage.js';

// Internal State
const state = {
  tasks: [],
  filters: {
    category: 'all',
    priority: 'all',
    search: '',
    sort: 'created-desc'
  },
  listeners: [] // Callbacks to run on state change
};

/**
 * Initialize application state from storage
 */
export function initState() {
  state.tasks = loadTasks();
}

/**
 * Subscribe a callback to be executed when state changes
 * @param {Function} callback 
 */
export function subscribe(callback) {
  state.listeners.push(callback);
}

/**
 * Notify all subscribers that the state has changed
 */
function notify() {
  saveTasks(state.tasks);
  state.listeners.forEach(callback => callback(getFilteredTasks(), getStats(), state.filters));
}

/**
 * Get raw tasks array
 */
export function getTasks() {
  return state.tasks;
}

/**
 * Get current filter state
 */
export function getFilters() {
  return state.filters;
}

/**
 * Update filter state
 * @param {string} filterType 'category', 'priority', 'search', or 'sort'
 * @param {string} value 
 */
export function setFilter(filterType, value) {
  if (filterType in state.filters) {
    state.filters[filterType] = value;
    notify();
  }
}

/**
 * Add a new task to the state
 * @param {Object} taskData 
 */
export function addTask(taskData) {
  const newTask = {
    id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    title: taskData.title.trim(),
    desc: (taskData.desc || '').trim(),
    priority: taskData.priority || 'medium',
    category: taskData.category || 'Work',
    dueDate: taskData.dueDate || '',
    completed: false,
    created: Date.now(),
    subtasks: taskData.subtasks || []
  };
  state.tasks.push(newTask);
  notify();
  return newTask;
}

/**
 * Update an existing task
 * @param {string} taskId 
 * @param {Object} updatedFields 
 */
export function updateTask(taskId, updatedFields) {
  const index = state.tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    state.tasks[index] = {
      ...state.tasks[index],
      ...updatedFields,
      // Ensure strings are trimmed
      title: updatedFields.title ? updatedFields.title.trim() : state.tasks[index].title,
      desc: updatedFields.desc !== undefined ? updatedFields.desc.trim() : state.tasks[index].desc
    };
    notify();
  }
}

/**
 * Delete a task by ID
 * @param {string} taskId 
 */
export function deleteTask(taskId) {
  state.tasks = state.tasks.filter(t => t.id !== taskId);
  notify();
}

/**
 * Toggle overall task completed status
 * @param {string} taskId 
 */
export function toggleTaskComplete(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    
    // If marking task as complete, optionally check off all subtasks
    if (task.completed) {
      task.subtasks.forEach(sub => sub.completed = true);
    } else {
      // If task marked active and all subtasks were completed, mark all active or leave as is.
      // Usually, unticking task leaves subtasks as is, or we can untick all.
      // Let's untick all subtasks to allow restarting the task checklist.
      task.subtasks.forEach(sub => sub.completed = false);
    }
    
    notify();
  }
}

/**
 * Toggle a specific subtask completion state
 * @param {string} taskId 
 * @param {string} subtaskId 
 */
export function toggleSubtaskComplete(taskId, subtaskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (subtask) {
      subtask.completed = !subtask.completed;
      
      // Auto-update parent task completion status:
      // If all subtasks are now checked, should we mark parent complete?
      // Yes, if there are subtasks, and all are completed, it's a great UX to auto-check the task!
      // If some subtasks are unchecked, and the task was completed, we uncheck the task.
      const totalSub = task.subtasks.length;
      const completedSub = task.subtasks.filter(s => s.completed).length;
      
      if (totalSub > 0) {
        if (completedSub === totalSub) {
          task.completed = true;
        } else {
          task.completed = false;
        }
      }
      
      notify();
    }
  }
}

/**
 * Get current analytics statistics
 */
export function getStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const active = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, active, completed, percentage };
}

/**
 * Get tasks sorted and filtered by active conditions
 */
export function getFilteredTasks() {
  let result = [...state.tasks];
  const { category, priority, search, sort } = state.filters;

  // 1. Search Filter
  if (search.trim() !== '') {
    const query = search.toLowerCase().trim();
    result = result.filter(task => 
      task.title.toLowerCase().includes(query) || 
      task.desc.toLowerCase().includes(query)
    );
  }

  // 2. Category Filter
  if (category !== 'all') {
    result = result.filter(task => task.category === category);
  }

  // 3. Priority Filter
  if (priority !== 'all') {
    result = result.filter(task => task.priority === priority);
  }

  // 4. Sorting
  result.sort((a, b) => {
    switch (sort) {
      case 'created-asc':
        return a.created - b.created;
      case 'created-desc':
        return b.created - a.created;
      case 'due-asc':
        // Handle tasks without due dates (put at the end)
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'priority-desc':
        const weight = { high: 3, medium: 2, low: 1 };
        return weight[b.priority] - weight[a.priority];
      default:
        return b.created - a.created;
    }
  });

  return result;
}
