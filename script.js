/**
 * Application Engine
 */
let todos = [];
let currentFilter = 'all';
let searchQuery = '';

// Element Cache
const listContainer = document.getElementById('todo-list');
const loader = document.getElementById('loader');
const ring = document.getElementById('progress-ring');
const percentLabel = document.getElementById('progress-percent');
const toast = document.getElementById('toast');

// SVG Configuration
const radius = ring.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
ring.style.strokeDasharray = `${circumference} ${circumference}`;

/**
 * 1. Fetching Full Dataset (200 Items)
 */
async function initApp() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        if (!response.ok) throw new Error("API Offline");
        
        const data = await response.json();
        
        // Brief timeout for smooth visual transition
        setTimeout(() => {
            todos = data;
            loader.style.display = 'none';
            render();
        }, 1200);
    } catch (error) {
        loader.innerHTML = "⚠️ Critical Error: Data Link Severed.";
        console.error(error);
    }
}

/**
 * 2. Optimized Render Engine
 */
function render() {
    // Advanced Filter Logic
    const filtered = todos.filter(t => {
        const matchesFilter = currentFilter === 'all' || 
                             (currentFilter === 'completed' ? t.completed : !t.completed);
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    listContainer.innerHTML = '';
    
    if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="loader-wrap"><p>No tasks found in this view.</p></div>`;
    }

    // Creating Document Fragment for performance with 200 items
    const fragment = document.createDocumentFragment();

    filtered.forEach((todo) => {
        const card = document.createElement('div');
        card.className = `todo-card ${todo.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="custom-check ${todo.completed ? 'checked' : ''}"></div>
            <span>${todo.title}</span>
        `;

        // Click interaction
        card.addEventListener('click', () => {
            todo.completed = !todo.completed;
            render(); // Reactive update
        });

        fragment.appendChild(card);
    });

    listContainer.appendChild(fragment);
    updateProgressUI();
}

/**
 * 3. Add Local Todo (Requirement: Add to Last)
 */
document.getElementById('add-btn').addEventListener('click', () => {
    const newTask = {
        id: todos.length + 1,
        title: "⚡ Manual system entry verified",
        completed: false
    };
    
    // Core Logic: Add to the end of the existing array
    todos.push(newTask); 
    
    render();
    
    // Feedback Notifications
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
    
    // Scroll to the very bottom to show the new item
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

/**
 * 4. Control Listeners
 */
document.querySelectorAll('.filter-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-link').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

document.getElementById('search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    render();
});

/**
 * 5. Utilities
 */
function updateProgressUI() {
    const total = todos.length;
    const completedCount = todos.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);
    
    const offset = circumference - (percentage / 100) * circumference;
    ring.style.strokeDashoffset = offset;
    percentLabel.innerText = `${percentage}%`;
}

// Set initial live date
document.getElementById('live-date').innerText = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric' 
});

// Start the app
initApp();
