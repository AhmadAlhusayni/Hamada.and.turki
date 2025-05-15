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
    // Redirect to dashboard.html instead of showing the task interface
    window.location.href = 'dashboard.html';
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

// Login - Modified to redirect to dashboard.html
loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    // Redirect to dashboard.html instead of showing the built-in task interface
    window.location.href = 'Login.html';
  } else {
    alert('Invalid username or password');
  }
});

// Initialize app
checkAuthStatus();