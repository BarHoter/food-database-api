document.addEventListener('DOMContentLoaded', () => {
    // Check if user is foodgod
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser !== 'foodgod') {
        window.location.href = 'index.html';
        return;
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Load users for the dropdown
    const userSelect = document.getElementById('userSelect');
    try {
        const response = await fetch('../data/generated_data_agents.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const agents = await response.json();
        
        // Add users to dropdown
        agents.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent.AgentID;
            option.textContent = `${agent.Name} (${agent.AgentID})`;
            userSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Error loading users: ' + error.message);
    }

    // Handle user activity form submission
    const userActivityForm = document.getElementById('userActivityForm');
    userActivityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedUser = userSelect.value;
        if (selectedUser) {
            window.location.href = `view-user-activity.html?userId=${selectedUser}`;
        }
    });
}); 