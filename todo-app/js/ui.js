/**
 * Aether Tasks - UI Management Module
 */
import { 
  toggleTaskComplete, 
  deleteTask, 
  toggleSubtaskComplete, 
  setFilter,
  addTask,
  updateTask
} from './state.js';

// DOM Selectors
const taskListContainer = document.getElementById('task-list');
const progressCircle = document.getElementById('progress-circle');
const progressPercentage = document.getElementById('progress-percentage');
const statTotal = document.getElementById('stat-total');
const statActive = document.getElementById('stat-active');
const statCompleted = document.getElementById('stat-completed');
const categoryPills = document.getElementById('category-pills');
const searchInput = document.getElementById('search-input');
const priorityFilter = document.getElementById('priority-filter');
const sortSelect = document.getElementById('sort-select');

// Modal Elements
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const modalTitleText = document.getElementById('modal-title-text');
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskPrioritySelect = document.getElementById('task-priority');
const taskCategorySelect = document.getElementById('task-category');
const taskDueDateInput = document.getElementById('task-due-date');
const newSubtaskInput = document.getElementById('new-subtask-input');
const addSubtaskBtn = document.getElementById('add-subtask-btn');
const subtasksChecklistEdit = document.getElementById('subtasks-checklist-edit');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const addTaskBtn = document.getElementById('add-task-btn');

// Local Temp State for Edit Modal
let tempSubtasks = [];
let editingTaskId = null;

// Circumference of radial progress circle (r=40)
const RADIAL_CIRCUMFERENCE = 251.3;

/**
 * Format date string into human readable format (e.g., "May 28, 2026")
 * @param {string} dateStr 
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', options);
}

/**
 * Check if a date is overdue (before today) and the task is incomplete
 * @param {string} dateStr 
 * @param {boolean} isCompleted 
 */
function isOverdue(dateStr, isCompleted) {
  if (!dateStr || isCompleted) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

/**
 * Render the full list of filtered tasks
 * @param {Array} tasks 
 */
export function renderTaskList(tasks) {
  taskListContainer.innerHTML = '';

  if (tasks.length === 0) {
    renderEmptyState();
    return;
  }

  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = `card glass task-card ${task.completed ? 'completed' : ''}`;
    card.id = `card-${task.id}`;

    // Priority badge HTML
    const priorityText = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    const priorityBadge = `<span class="badge priority-${task.priority}"><i data-lucide="circle-alert"></i>${priorityText}</span>`;

    // Category badge HTML
    const categoryBadge = `<span class="badge category-${task.category.toLowerCase()}">${task.category}</span>`;

    // Due Date HTML
    let dueDateHTML = '';
    if (task.dueDate) {
      const formatted = formatDate(task.dueDate);
      const overdue = isOverdue(task.dueDate, task.completed);
      dueDateHTML = `
        <span class="badge due-date ${overdue ? 'overdue' : ''}">
          <i data-lucide="calendar"></i>
          ${overdue ? 'Overdue: ' : ''}${formatted}
        </span>
      `;
    }

    // Subtasks progress bar HTML
    let subtaskHTML = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const total = task.subtasks.length;
      const completed = task.subtasks.filter(s => s.completed).length;
      const pct = Math.round((completed / total) * 100);
      subtaskHTML = `
        <div class="task-subtasks-progress">
          <div class="mini-progress-bar">
            <div class="mini-progress-fill" style="width: ${pct}%"></div>
          </div>
          <span>${completed}/${total} Steps</span>
        </div>
      `;
    }

    // HTML Content assembly
    card.innerHTML = `
      <div class="task-left">
        <label class="checkbox-container" aria-label="Toggle Complete">
          <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
          <span class="checkmark">
            <i data-lucide="check"></i>
          </span>
        </label>
        
        <div class="task-info">
          <div class="task-title-row">
            <span class="task-title">${task.title}</span>
            <div class="task-badges">
              ${priorityBadge}
              ${categoryBadge}
              ${dueDateHTML}
            </div>
          </div>
          ${task.desc ? `<p class="task-desc">${task.desc}</p>` : ''}
          ${subtaskHTML}
        </div>
      </div>
      
      <div class="task-right">
        <button class="btn-icon edit-task-btn" data-id="${task.id}" aria-label="Edit Task">
          <i data-lucide="edit-3"></i>
        </button>
        <button class="btn-icon delete-task-btn" data-id="${task.id}" aria-label="Delete Task">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;

    taskListContainer.appendChild(card);
  });

  // Re-generate Lucide icon elements
  lucide.createIcons();

  // Attach event listeners to task card elements
  attachTaskCardEvents();
}

/**
 * Render the empty state illustration when list is empty
 */
function renderEmptyState() {
  taskListContainer.innerHTML = `
    <div class="card glass empty-state">
      <div class="empty-state-icon">
        <i data-lucide="check-square"></i>
      </div>
      <h4>All caught up!</h4>
      <p>There are no tasks that match your active filters. Enjoy your day or create a new task to get started.</p>
    </div>
  `;
  lucide.createIcons();
}

/**
 * Render the overall dashboard progress and total metrics
 * @param {Object} stats 
 */
export function renderAnalytics(stats) {
  statTotal.textContent = stats.total;
  statActive.textContent = stats.active;
  statCompleted.textContent = stats.completed;
  progressPercentage.textContent = `${stats.percentage}%`;

  // Draw radial progress offset
  const offset = RADIAL_CIRCUMFERENCE - (stats.percentage / 100) * RADIAL_CIRCUMFERENCE;
  progressCircle.style.strokeDashoffset = offset;
}

/**
 * Render active filter inputs in matching styles
 * @param {Object} filters 
 */
export function renderFilters(filters) {
  // Update Category Pill Active State
  const pills = categoryPills.querySelectorAll('.category-pill');
  pills.forEach(pill => {
    if (pill.dataset.category === filters.category) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Update dropdown values if different
  if (priorityFilter.value !== filters.priority) {
    priorityFilter.value = filters.priority;
  }
  if (sortSelect.value !== filters.sort) {
    sortSelect.value = filters.sort;
  }
  if (searchInput.value !== filters.search) {
    searchInput.value = filters.search;
  }
}

/**
 * Bind click events on task list cards (checkboxes, edits, deletions)
 */
function attachTaskCardEvents() {
  // Toggle check status
  const checkboxes = taskListContainer.querySelectorAll('.task-checkbox');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const taskId = e.target.dataset.id;
      toggleTaskComplete(taskId);
    });
  });

  // Edit task trigger
  const editBtns = taskListContainer.querySelectorAll('.edit-task-btn');
  editBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.dataset.id;
      openModalForEdit(taskId);
    });
  });

  // Delete task with anim
  const deleteBtns = taskListContainer.querySelectorAll('.delete-task-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.dataset.id;
      const card = document.getElementById(`card-${taskId}`);
      if (card) {
        card.classList.add('removing');
        // Wait for animation to finish before removing from state
        card.addEventListener('animationend', () => {
          deleteTask(taskId);
        });
      } else {
        deleteTask(taskId);
      }
    });
  });
}

/**
 * Opens task drawer in "Create" mode
 */
export function openModalForCreate() {
  editingTaskId = null;
  tempSubtasks = [];
  modalTitleText.textContent = 'Create New Task';
  taskIdInput.value = '';
  taskForm.reset();
  
  // Set default date to today
  taskDueDateInput.value = new Date().toISOString().split('T')[0];
  
  renderModalSubtasks();
  taskModal.classList.remove('hidden');
}

/**
 * Opens task drawer in "Edit" mode and fills the form
 * @param {string} taskId 
 */
import { getTasks } from './state.js';
function openModalForEdit(taskId) {
  const task = getTasks().find(t => t.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  tempSubtasks = JSON.parse(JSON.stringify(task.subtasks)); // Deep clone
  
  modalTitleText.textContent = 'Edit Task Details';
  taskIdInput.value = task.id;
  taskTitleInput.value = task.title;
  taskDescInput.value = task.desc;
  taskPrioritySelect.value = task.priority;
  taskCategorySelect.value = task.category;
  taskDueDateInput.value = task.dueDate;

  renderModalSubtasks();
  taskModal.classList.remove('hidden');
}

/**
 * Close modal
 */
export function closeModal() {
  taskModal.classList.add('hidden');
  editingTaskId = null;
  tempSubtasks = [];
}

/**
 * Render the subtask list inside the Edit Modal
 */
function renderModalSubtasks() {
  subtasksChecklistEdit.innerHTML = '';
  
  tempSubtasks.forEach((sub, index) => {
    const li = document.createElement('li');
    li.className = `subtask-edit-item ${sub.completed ? 'completed' : ''}`;
    
    li.innerHTML = `
      <div class="subtask-edit-item-left">
        <label class="checkbox-container" aria-label="Toggle Subtask Complete">
          <input type="checkbox" class="modal-subtask-check" data-index="${index}" ${sub.completed ? 'checked' : ''}>
          <span class="checkmark" style="height: 18px; width: 18px; border-radius: 4px;">
            <i data-lucide="check" style="width: 12px; height: 12px;"></i>
          </span>
        </label>
        <span>${sub.title}</span>
      </div>
      <button type="button" class="btn-icon modal-subtask-delete" data-index="${index}" aria-label="Delete Subtask" style="width: 32px; height: 32px;">
        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
      </button>
    `;
    
    subtasksChecklistEdit.appendChild(li);
  });
  
  lucide.createIcons();
  attachModalSubtaskEvents();
}

/**
 * Bind event actions inside the modal subtask list
 */
function attachModalSubtaskEvents() {
  // Checkbox toggling
  const checks = subtasksChecklistEdit.querySelectorAll('.modal-subtask-check');
  checks.forEach(check => {
    check.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      tempSubtasks[index].completed = e.target.checked;
      renderModalSubtasks();
    });
  });

  // Delete subtask
  const deletes = subtasksChecklistEdit.querySelectorAll('.modal-subtask-delete');
  deletes.forEach(del => {
    del.addEventListener('click', (e) => {
      // Find closest button target to read dataset (handles icons click target delegation)
      const btn = e.target.closest('.modal-subtask-delete');
      const index = parseInt(btn.dataset.index);
      tempSubtasks.splice(index, 1);
      renderModalSubtasks();
    });
  });
}

/**
 * Handle form submissions (Save actions for Create & Edit)
 * @param {Event} e 
 */
function handleFormSubmit(e) {
  e.preventDefault();
  
  const title = taskTitleInput.value;
  const desc = taskDescInput.value;
  const priority = taskPrioritySelect.value;
  const category = taskCategorySelect.value;
  const dueDate = taskDueDateInput.value;

  const data = {
    title,
    desc,
    priority,
    category,
    dueDate,
    subtasks: tempSubtasks
  };

  if (editingTaskId) {
    updateTask(editingTaskId, data);
  } else {
    addTask(data);
  }

  closeModal();
}

/**
 * Add a subtask dynamically to the temp listing in the form modal
 */
function handleAddSubtask() {
  const text = newSubtaskInput.value.trim();
  if (text === '') return;

  tempSubtasks.push({
    id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    title: text,
    completed: false
  });

  newSubtaskInput.value = '';
  renderModalSubtasks();
}

/**
 * Initialize all general non-task UI events
 */
export function initUIListeners() {
  // Form submit
  taskForm.addEventListener('submit', handleFormSubmit);

  // Add Subtask button inside modal
  addSubtaskBtn.addEventListener('click', handleAddSubtask);
  newSubtaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  });

  // Create task modal open/close buttons
  addTaskBtn.addEventListener('click', openModalForCreate);
  closeModalBtn.addEventListener('click', closeModal);
  cancelTaskBtn.addEventListener('click', closeModal);

  // Close modal when clicking on dark backdrop overlay
  taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) {
      closeModal();
    }
  });

  // Filter: Category Pill clicks
  categoryPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (pill) {
      setFilter('category', pill.dataset.category);
    }
  });

  // Filter: Priority Select
  priorityFilter.addEventListener('change', (e) => {
    setFilter('priority', e.target.value);
  });

  // Sort Select
  sortSelect.addEventListener('change', (e) => {
    setFilter('sort', e.target.value);
  });

  // Search input typing
  searchInput.addEventListener('input', (e) => {
    setFilter('search', e.target.value);
  });
}
