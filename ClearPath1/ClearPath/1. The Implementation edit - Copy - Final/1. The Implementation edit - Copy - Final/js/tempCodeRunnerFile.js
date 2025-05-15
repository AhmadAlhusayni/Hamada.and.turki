// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", function(event){
    event.preventDefault();
    window.location.href = 'tasks.html';
});

// Handle task form submission
document.getElementById("taskForm").addEventListener("submit", function(event){
    event.preventDefault();
    alert("Task Submitted!");
    window.location.href = 'success.html';
});

// Handle personalization
function personalize() {
    window.location.href = 'personalization.html';
}

function setDifficulty(level) {
    alert("Difficulty set to " + level);
    window.location.href = 'tasks.html';
}

// Handle modify button
function modifyTask() {
    window.location.href = 'task-creation.html';
}

// Handle success page close
function close() {
    window.location.href = 'tasks.html';
}
