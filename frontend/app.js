// Main Application Logic

class CloudTaskApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Landing page buttons
        document.getElementById('show-login-btn')?.addEventListener('click', () => this.showPage('login-page'));
        document.getElementById('show-signup-btn')?.addEventListener('click', () => this.showPage('signup-page'));

        // Auth form switches
        document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('login-page');
        });
        document.getElementById('switch-to-signup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('signup-page');
        });

        // Signup form
        document.getElementById('signup-form')?.addEventListener('submit', (e) => this.handleSignup(e));

        // Verify form
        document.getElementById('verify-form')?.addEventListener('submit', (e) => this.handleVerify(e));

        // Login form
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());

        // Task form
        document.getElementById('task-form')?.addEventListener('submit', (e) => this.handleAddTask(e));

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
    }

    // Page Navigation
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        this.clearMessages();
    }

    // Loading Overlay
    showLoading() {
        document.getElementById('loading-overlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('show');
    }

    // Message Display
    showMessage(elementId, message, type = 'error') {
        const messageEl = document.getElementById(elementId);
        messageEl.textContent = message;
        messageEl.className = `message ${type} show`;
    }

    clearMessages() {
        document.querySelectorAll('.message').forEach(msg => {
            msg.classList.remove('show');
        });
    }

    // Check Authentication State
    checkAuthState() {
        if (auth.isAuthenticated()) {
            this.loadApp();
        } else {
            this.showPage('landing-page');
        }
    }

    // Authentication Handlers
    async handleSignup(e) {
        e.preventDefault();
        this.clearMessages();

        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            this.showMessage('signup-message', 'Passwords do not match', 'error');
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            this.showMessage('signup-message', 'Password must be at least 8 characters', 'error');
            return;
        }

        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            this.showMessage('signup-message', 'Password must contain uppercase, lowercase, and numbers', 'error');
            return;
        }

        this.showLoading();

        try {
            await auth.signUp(email, password);
            this.hideLoading();
            
            // Store email for verification
            document.getElementById('verify-email').textContent = email;
            localStorage.setItem('pendingVerificationEmail', email);
            
            this.showPage('verify-page');
            this.showMessage('verify-message', 'Verification code sent to your email', 'success');
        } catch (error) {
            this.hideLoading();
            this.showMessage('signup-message', error.message, 'error');
        }
    }

    async handleVerify(e) {
        e.preventDefault();
        this.clearMessages();

        const code = document.getElementById('verify-code').value.trim();
        const email = localStorage.getItem('pendingVerificationEmail');

        if (!email) {
            this.showMessage('verify-message', 'Session expired. Please sign up again.', 'error');
            return;
        }

        this.showLoading();

        try {
            await auth.confirmSignUp(email, code);
            this.hideLoading();
            
            localStorage.removeItem('pendingVerificationEmail');
            
            this.showPage('login-page');
            this.showMessage('login-message', 'Account verified! Please login.', 'success');
        } catch (error) {
            this.hideLoading();
            this.showMessage('verify-message', error.message, 'error');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        this.clearMessages();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        this.showLoading();

        try {
            await auth.signIn(email, password);
            this.hideLoading();
            this.loadApp();
        } catch (error) {
            this.hideLoading();
            
            let errorMessage = error.message;
            if (errorMessage.includes('UserNotConfirmedException')) {
                errorMessage = 'Please verify your email first. Check your inbox for the verification code.';
                document.getElementById('verify-email').textContent = email;
                localStorage.setItem('pendingVerificationEmail', email);
                this.showPage('verify-page');
                return;
            } else if (errorMessage.includes('NotAuthorizedException')) {
                errorMessage = 'Incorrect email or password';
            }
            
            this.showMessage('login-message', errorMessage, 'error');
        }
    }

    handleLogout() {
        auth.signOut();
        this.tasks = [];
        this.showPage('landing-page');
    }

    // App Loading
    async loadApp() {
        this.showPage('app-page');
        document.getElementById('user-email').textContent = auth.getCurrentUserEmail();
        
        this.showLoading();
        try {
            await this.loadTasks();
        } catch (error) {
            console.error('Error loading tasks:', error);
            alert('Error loading tasks. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    // Task Management
    async loadTasks() {
        try {
            this.tasks = await api.getTasks();
            this.renderTasks();
        } catch (error) {
            console.error('Error loading tasks:', error);
            throw error;
        }
    }

    async handleAddTask(e) {
        e.preventDefault();

        const input = document.getElementById('task-input');
        const title = input.value.trim();

        if (!title) return;

        this.showLoading();

        try {
            const newTask = await api.createTask(title);
            this.tasks.unshift(newTask); // Add to beginning
            this.renderTasks();
            input.value = ''; // Clear input
        } catch (error) {
            alert('Error creating task: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async handleToggleTask(taskId, completed) {
        this.showLoading();

        try {
            await api.updateTask(taskId, completed);
            
            // Update local task
            const task = this.tasks.find(t => t.taskId === taskId);
            if (task) {
                task.completed = completed;
                this.renderTasks();
            }
        } catch (error) {
            alert('Error updating task: ' + error.message);
            // Revert the change
            this.renderTasks();
        } finally {
            this.hideLoading();
        }
    }

    async handleDeleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        this.showLoading();

        try {
            await api.deleteTask(taskId);
            
            // Remove from local tasks
            this.tasks = this.tasks.filter(t => t.taskId !== taskId);
            this.renderTasks();
        } catch (error) {
            alert('Error deleting task: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;

        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');
        
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        taskList.innerHTML = filteredTasks.map(task => {
            const date = new Date(task.createdAt);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            return `
                <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.taskId}">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                        onchange="app.handleToggleTask('${task.taskId}', this.checked)"
                    >
                    <span class="task-content">${this.escapeHtml(task.title)}</span>
                    <span class="task-date">${formattedDate}</span>
                    <button 
                        class="btn btn-danger" 
                        onclick="app.handleDeleteTask('${task.taskId}')"
                    >
                        Delete
                    </button>
                </li>
            `;
        }).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CloudTaskApp();
});
