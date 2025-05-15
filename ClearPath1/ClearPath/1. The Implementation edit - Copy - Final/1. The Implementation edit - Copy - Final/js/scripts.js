let users = {};  // Stores users' data
let tasks = [];  // Stores all tasks

let editingTaskIndex = null;  // Used for modifying existing tasks

// Load the saved data from localStorage when the app starts
window.onload = function () {
    loadData();
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        showTab("todo-list");
        updateToDoList();
    } else {
        showTab("login");
    }
}

// On app load, retrieve data from localStorage
function loadData() {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || {};
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    users = storedUsers;
    tasks = storedTasks;
}

// Save users and tasks to localStorage
function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Show the appropriate tab (login, todo-list, task-creation, success)
function showTab(tabId) {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    
    if (tabId === 'todo-list') {
        const username = sessionStorage.getItem('currentUser');
        if (username) {
            document.getElementById("username-display").textContent = `Welcome, ${username}`;
        }
    }
}

// Login Function
function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter valid credentials!");
        return;
    }

    // Check if the username already exists
    if (users[username]) {
        if (users[username].password !== password) {
            alert("Incorrect password. Please try again.");
            return;
        }
    } else {
        // Create a new user if the username doesn't exist
        users[username] = { password, tasks: [] };
    }

    // Store the username in session and proceed
    sessionStorage.setItem("currentUser", username);
    saveData(); // Save the updated users to localStorage
    showTab("todo-list");
    updateToDoList(); // Refresh the task list for the logged-in user
}

// Open the task creation tab
function openTaskCreation() {
    editingTaskIndex = null;
    document.getElementById("task").value = "";
    document.getElementById("priority").value = "";
    document.getElementById("days-to-finish").value = "";
    document.getElementById("deadline").value = "";
    selectedDifficulty = '';
    document.getElementById("difficulty").querySelectorAll("button").forEach(button => button.classList.remove('selected'));
    showTab("task-creation");
}

// Select Difficulty
let selectedDifficulty = '';
function selectDifficulty(difficulty) {
    selectedDifficulty = difficulty;
    document.getElementById("difficulty").querySelectorAll("button").forEach(button => {
        if (button.textContent === difficulty) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
}

// Submit the task and save it
function submitTask() {
    const task = document.getElementById("task").value.trim();
    const priority = parseInt(document.getElementById("priority").value);
    const daysToFinish = parseInt(document.getElementById("days-to-finish").value);
    const deadline = document.getElementById("deadline").value;
    const difficulty = selectedDifficulty;

    if (!task || isNaN(priority) || priority < 1 || priority > 5 || isNaN(daysToFinish) || !deadline || !difficulty) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const username = sessionStorage.getItem('currentUser');
    const taskDetails = { name: task, priority, daysToFinish, deadline, difficulty, username, completed: false, taskNotification: true };

    if (!users[username].tasks) {
        users[username].tasks = [];
    }

    if (editingTaskIndex !== null) {
        // If editing, update the existing task
        users[username].tasks[editingTaskIndex] = taskDetails;
    } else {
        // Otherwise, add new task
        users[username].tasks.push(taskDetails);
    }

    saveData(); // Save the updated tasks to localStorage
    showSuccessMessage(taskDetails, true); // Show success message for new task
    showTab("success");
}

// Show success message after submitting a task
function showSuccessMessage(taskDetails) {
    const successMessageContainer = document.getElementById("success-message");
    successMessageContainer.innerHTML = `
        <p><strong>Task Name:</strong> ${taskDetails.name}</p>
        <p><strong>Priority:</strong> ${taskDetails.priority}</p>
        <p><strong>How many days it takes to finish:</strong> ${taskDetails.daysToFinish}</p>
        <p><strong>Deadline:</strong> ${taskDetails.deadline}</p>
        <p><strong>Difficulty:</strong> ${taskDetails.difficulty}</p>
    `;
}

// Go back to the To-Do List
function goBackToList() {
    showTab("todo-list");
}

// Back to the login screen
function goBackToLogin() {
    sessionStorage.removeItem("currentUser");
    showTab("login");
}

// Update the task list for the logged-in user
function updateToDoList() {
    const username = sessionStorage.getItem('currentUser');
    const userTasks = users[username].tasks || [];

    const categorizedTasks = categorizeTasks(userTasks);
    const userTaskList = document.getElementById("user-list");
    userTaskList.innerHTML = ''; // Clear the existing task list

    Object.keys(categorizedTasks).forEach(category => {
        const categoryContainer = document.createElement('div');
        categoryContainer.innerHTML = `<h3>${category}</h3>`;
        categorizedTasks[category].forEach((task, index) => {
            const taskContainer = document.createElement('div');
            taskContainer.classList.add('task-container');
            taskContainer.classList.add(task.completed ? 'completed' : 'incomplete');
            taskContainer.id = `task-${index}`; // Assign a unique ID to each task

            taskContainer.innerHTML = `
                <strong>Task:</strong> ${task.name}<br>
                <strong>Priority:</strong> ${task.priority}<br>
                <strong>Days to Finish:</strong> ${task.daysToFinish}<br>
                <strong>Deadline:</strong> ${task.deadline}<br>
                <strong>Difficulty:</strong> ${task.difficulty}<br>
                <span class="status ${task.completed ? 'completed' : 'incomplete'}">${task.completed ? 'Completed' : 'Incomplete'}</span>
                <div class="task-buttons">
                    <button class="done-btn" onclick="markAsDone(${index})">Done</button>
                    <button class="edit-btn" onclick="modifyTask(${index})">Modify</button>
                    <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
                    ${!task.completed && task.taskNotification ? '<span class="notification-icon" onclick="dismissNotification(${index})">&#128276;</span>' : ''}
                </div>
            `;
            categoryContainer.appendChild(taskContainer);
        });
        userTaskList.appendChild(categoryContainer);
    });
}

// Mark a task as done
function markAsDone(index) {
    const username = sessionStorage.getItem('currentUser');
    users[username].tasks[index].completed = true;
    saveData();
    updateToDoList();
}

// Modify an existing task
function modifyTask(index) {
    const username = sessionStorage.getItem('currentUser');
    const task = users[username].tasks[index];

    document.getElementById("task").value = task.name;
    document.getElementById("priority").value = task.priority;
    document.getElementById("days-to-finish").value = task.daysToFinish;
    document.getElementById("deadline").value = task.deadline;
    selectedDifficulty = task.difficulty;
    document.getElementById("difficulty").querySelectorAll("button").forEach(button => {
        if (button.textContent === task.difficulty) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });

    editingTaskIndex = index;
    showTab("task-creation");
}

// Delete a task
function deleteTask(index) {
    const username = sessionStorage.getItem('currentUser');
    users[username].tasks.splice(index, 1);
    saveData();
    updateToDoList();
}

// Dismiss Notification
function dismissNotification(index) {
    const username = sessionStorage.getItem('currentUser');
    const task = users[username].tasks[index];
    task.taskNotification = false; // Dismiss the notification
    saveData(); // Save the updated tasks to localStorage
    updateToDoList(); // Refresh the task list to remove the notification icon
}

// Function to handle the notification icon click
function remindTask(iconElement) {
    alert("Reminder: This task is due soon! Please make sure to complete it.");
    // You can also add further logic here to change the icon or mark it as reminded.
    
    // Optional: Change the icon to indicate the task has been reminded
    iconElement.textContent = '✔️'; // Change the icon to a checkmark after reminding
    iconElement.style.color = 'green'; // Update the color to indicate it's done
}

// Categorize tasks
function categorizeTasks(tasks) {
    const categories = {
        "Urgent & Important": [],
        "Urgent & Not Important": [],
        "Not Urgent & Important": [],
        "Not Urgent & Not Important": []
    };

    tasks.forEach(task => {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const isUrgent = (deadline - now) <= 3 * 24 * 60 * 60 * 1000; // 3 days to deadline
        const isImportant = task.priority >= 4;

        if (isUrgent && isImportant) {
            categories["Urgent & Important"].push(task);
        } else if (isUrgent && !isImportant) {
            categories["Urgent & Not Important"].push(task);
        } else if (!isUrgent && isImportant) {
            categories["Not Urgent & Important"].push(task);
        } else {
            categories["Not Urgent & Not Important"].push(task);
        }
    });

    // Sort tasks in each category by deadline, days required, priority, and difficulty
    Object.keys(categories).forEach(category => {
        categories[category].sort((a, b) => {
            const deadlineA = new Date(a.deadline);
            const deadlineB = new Date(b.deadline);
            const difficultyOrder = { "Easy": 1, "Mid": 2, "Hard": 3 };

            return deadlineA - deadlineB || a.daysToFinish - b.daysToFinish || b.priority - a.priority || difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        });
    });

    return categories;
}
