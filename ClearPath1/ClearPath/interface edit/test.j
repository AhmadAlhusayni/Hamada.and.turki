// DOM Elements
const loginTab = document.querySelector('[data-tab="login"]');
const registerTab = document.querySelector('[data-tab="register"]');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const todoApp = document.getElementById('todo-app');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const addTaskForm = document.getElementById('add-task-form');
const newTaskInput = document.getElementById('new-task');
const taskList = document.getElementById('task-list');
const userName = document.getElementById('user-name');

// Local Storage Keys
const USERS_STORAGE_KEY = 'taskflow_users';
const CURRENT_USER_KEY = 'taskflow_current_user';
const TASKS_STORAGE_KEY = 'taskflow_tasks';

// Initialize local storage
if (!localStorage.getItem(USERS_STORAGE_KEY)) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
}

// Check if user is logged in
function checkAuthStatus() {
  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (currentUser) {
    loginForm.classList.remove('active');
    registerForm.classList.remove('active');
    todoApp.classList.add('active');
    userName.textContent = currentUser.username;
    loadTasks();
  }
}

// Tab switching
loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
});

// Password Toggle Functionality
const passwordToggles = document.querySelectorAll('.password-toggle');

passwordToggles.forEach(toggle => {
  toggle.addEventListener('click', function() {
    const input = this.previousElementSibling;
    const isPassword = input.type === 'password';
    
    // Toggle input type
    input.type = isPassword ? 'text' : 'password';
    
    // Toggle eye icon
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
  });
});

// Password Validation
const passwordInput = document.getElementById('register-password');
const validationItems = {
  length: document.getElementById('lengthValidation'),
  upper: document.getElementById('upperValidation'),
  lower: document.getElementById('lowerValidation'),
  number: document.getElementById('numberValidation'),
  special: document.getElementById('specialInfo')
};

passwordInput.addEventListener('input', function(e) {
  const value = e.target.value;
  
  // Length validation - now 8 characters instead of 10
  validationItems.length.classList.toggle('valid', value.length >= 8);
  validationItems.length.classList.toggle('invalid', value.length < 8);
  
  // Uppercase validation
  const hasUpper = /[A-Z]/.test(value);
  validationItems.upper.classList.toggle('valid', hasUpper);
  validationItems.upper.classList.toggle('invalid', !hasUpper);
  
  // Lowercase validation
  const hasLower = /[a-z]/.test(value);
  validationItems.lower.classList.toggle('valid', hasLower);
  validationItems.lower.classList.toggle('invalid', !hasLower);
  
  // Number validation
  const hasNumber = /\d/.test(value);
  validationItems.number.classList.toggle('valid', hasNumber);
  validationItems.number.classList.toggle('invalid', !hasNumber);
  
  // Special characters are allowed but not required - just for information
  validationItems.special.classList.add('info');
});

// Registration with validation
registerBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;

  // Updated validation checks
  const validations = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password)
  };

  // Update validation UI
  validationItems.length.classList.toggle('valid', validations.length);
  validationItems.upper.classList.toggle('valid', validations.upper);
  validationItems.lower.classList.toggle('valid', validations.lower);
  validationItems.number.classList.toggle('valid', validations.number);

  // Check all validations
  const isValid = Object.values(validations).every(v => v);
  
  if (!username || !password) {
    alert('Please fill all fields');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  if (!isValid) {
    alert('Please meet all password requirements');
    return;
  }

  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  if (users.some(user => user.username === username)) {
    alert('Username already exists');
    return;
  }

  const newUser = { 
    id: Date.now().toString(), 
    username, 
    password 
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  // Show success notification
  const notification = document.createElement('div');
  notification.className = 'success-notification';
  notification.textContent = 'Account created successfully! Please login.';
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);

  // Clear form and switch to login
  document.getElementById('register-username').value = '';
  document.getElementById('register-password').value = '';
  document.getElementById('register-confirm-password').value = '';
  loginTab.click();
});

// Login
loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    checkAuthStatus();
  } else {
    alert('Invalid username or password');
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  todoApp.classList.remove('active');
  loginForm.classList.add('active');
  loginTab.click();
});

// Load tasks
function loadTasks() {
  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!currentUser) return;

  const allTasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) || '{}');
  const userTasks = allTasks[currentUser.id] || [];

  // Clear the task list
  taskList.innerHTML = '';

  // Add tasks to the list
  userTasks.forEach(task => {
    addTaskToDOM(task);
  });
}

// Save tasks
function saveTasks(tasks) {
  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!currentUser) return;

  const allTasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) || '{}');
  allTasks[currentUser.id] = tasks;
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(allTasks));
}

// Add task to DOM
function addTaskToDOM(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''}`;
  li.dataset.id = task.id;

  li.innerHTML = `
    <div class="task-content">
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
      <span class="task-text">${task.text}</span>
    </div>
    <div class="task-actions">
      <button class="task-delete-btn">✕</button>
    </div>
  `;

  // Add event listener for checkbox
  const checkbox = li.querySelector('.task-checkbox');
  checkbox.addEventListener('change', () => {
    toggleTaskCompletion(task.id);
    li.classList.toggle('completed');
  });

  // Add event listener for delete button
  const deleteBtn = li.querySelector('.task-delete-btn');
  deleteBtn.addEventListener('click', () => {
    deleteTask(task.id);
    li.remove();
  });

  taskList.appendChild(li);
}

// Dashboard Functions
function openDashboard() {
  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!currentUser) return;

  // Set username in the dashboard
  document.getElementById('dashboard-username').textContent = currentUser.username;

  // Load task statistics
  const allTasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) || '{}');
  const userTasks = allTasks[currentUser.id] || [];

  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Update statistics
  document.getElementById('total-tasks').textContent = totalTasks;
  document.getElementById('completed-tasks').textContent = completedTasks;
  document.getElementById('pending-tasks').textContent = pendingTasks;

  // Render chart
  renderTaskChart(totalTasks, completedTasks, pendingTasks);

  // Show dashboard
  document.getElementById('dashboard-modal').style.display = 'flex';
}

function closeDashboard() {
  document.getElementById('dashboard-modal').style.display = 'none';
}

function renderTaskChart(totalTasks, completedTasks, pendingTasks) {
  const ctx = document.getElementById('taskChart').getContext('2d');
  if (window.taskChart) {
    window.taskChart.destroy(); // Destroy existing chart instance
  }
  window.taskChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Pending'],
      datasets: [{
        label: 'Tasks',
        data: [completedTasks, pendingTasks],
        backgroundColor: [
          '#4CAF50', // Green for completed
          '#F44336'  // Red for pending
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Add event listener to open dashboard after login
loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    checkAuthStatus();
    openDashboard(); // Open dashboard after successful login
  } else {
    alert('Invalid username or password');
  }
});


// Add new task
addTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const taskText = newTaskInput.value.trim();
  
  if (!taskText) return;

  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!currentUser) return;

  const allTasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) || '{}');
  const userTasks = allTasks[currentUser.id] || [];

  const newTask = {
    id: Date.now().toString(),
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString()
  };

  userTasks.push(newTask);
  saveTasks(userTasks);
  addTaskToDOM(newTask);
  newTaskInput.value = '';
});

// Toggle task completion
function toggleTaskCompletion(taskId) {
  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!currentUser) return;

  const allTasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) || '{}');
  const userTasks = allTasks[currentUser.id] || [];

  const updatedTasks = userTasks.map(task => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks(updatedTasks);
}

// Delete task
function deleteTask(taskId) {
  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!currentUser) return;

  const allTasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) || '{}');
  const userTasks = allTasks[currentUser.id] || [];

  const updatedTasks = userTasks.filter(task => task.id !== taskId);
  saveTasks(updatedTasks);
}

// Initialize app
checkAuthStatus();