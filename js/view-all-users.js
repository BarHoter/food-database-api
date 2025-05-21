document.addEventListener('DOMContentLoaded', async () => {
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

    const usersContainer = document.getElementById('usersContainer');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const totalUsersElement = document.getElementById('totalUsers');
    const totalBuyersElement = document.getElementById('totalBuyers');
    const totalSellersElement = document.getElementById('totalSellers');
    const modal = document.getElementById('transactionsModal');
    const closeModal = document.querySelector('.close-modal');
    const tabButtons = document.querySelectorAll('.tab-btn');

    let allUsers = [];
    let filteredUsers = [];
    let allTransactions = [];
    let currentUserId = null;
    let currentTab = 'all';

    // Load users and transactions
    try {
        const [usersResponse, transactionsResponse] = await Promise.all([
            fetch('../data/generated_data_agents.json'),
            fetch('../data/generated_data_transactions.json')
        ]);

        allUsers = await usersResponse.json();
        allTransactions = await transactionsResponse.json();
        filteredUsers = [...allUsers];
        
        // Update stats
        updateStats(allUsers);
        
        // Load initial view
        displayUsers(filteredUsers);
        
        // Set up search and filter handlers
        searchInput.addEventListener('input', filterUsers);
        typeFilter.addEventListener('change', filterUsers);
        
    } catch (error) {
        console.error('Error loading data:', error);
        usersContainer.innerHTML = '<div class="no-results">Error loading data. Please try again later.</div>';
    }

    // Modal event listeners
    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTab = button.dataset.tab;
            displayUserTransactions(currentUserId);
        });
    });

    function updateStats(users) {
        const totalUsers = users.length;
        const totalBuyers = users.filter(user => user.Type === 1).length;
        const totalSellers = users.filter(user => user.Type === 2).length;

        totalUsersElement.textContent = totalUsers;
        totalBuyersElement.textContent = totalBuyers;
        totalSellersElement.textContent = totalSellers;
    }

    function filterUsers() {
        const searchTerm = searchInput.value.toLowerCase();
        const typeValue = typeFilter.value;

        filteredUsers = allUsers.filter(user => {
            const matchesSearch = 
                user.AgentID.toLowerCase().includes(searchTerm) ||
                user.Address.toLowerCase().includes(searchTerm);

            const matchesType = !typeValue || user.Type === parseInt(typeValue);

            return matchesSearch && matchesType;
        });

        displayUsers(filteredUsers);
    }

    function getUserTypeBadge(type) {
        switch (type) {
            case 0:
                return '<span class="user-type type-admin">Administrator</span>';
            case 1:
                return '<span class="user-type type-buyer">Buyer</span>';
            case 2:
                return '<span class="user-type type-seller">Seller</span>';
            default:
                return '<span class="user-type">Unknown</span>';
        }
    }

    function displayUsers(users) {
        if (users.length === 0) {
            usersContainer.innerHTML = '<div class="no-results">No users found</div>';
            return;
        }

        usersContainer.innerHTML = users.map(user => `
            <div class="user-card" onclick="showUserTransactions('${user.AgentID}')">
                <div class="user-header">
                    <span class="user-id">${user.AgentID}</span>
                    ${getUserTypeBadge(user.Type)}
                </div>
                <div class="user-details">
                    <div class="detail-row">
                        <span class="detail-label">Address</span>
                        <span class="detail-value">${user.Address}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type</span>
                        <span class="detail-value">${user.Type === 0 ? 'Administrator' : user.Type === 1 ? 'Buyer' : 'Seller'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function getStatusBadge(status) {
        return `<span class="status-badge status-${status.toLowerCase()}">${status}</span>`;
    }

    function displayUserTransactions(userId) {
        const userTransactionsDiv = document.getElementById('userTransactions');
        const user = allUsers.find(u => u.AgentID === userId);
        
        let transactions = allTransactions.filter(t => {
            if (currentTab === 'buyer') return t.Buyer === userId;
            if (currentTab === 'seller') return t.Seller === userId;
            return t.Buyer === userId || t.Seller === userId;
        });

        if (transactions.length === 0) {
            userTransactionsDiv.innerHTML = '<div class="no-results">No transactions found</div>';
            return;
        }

        userTransactionsDiv.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                ${getStatusBadge(transaction.Status)}
                <div class="detail-row">
                    <span class="detail-label">Transaction ID</span>
                    <span class="detail-value">${transaction.TransactionID}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Created</span>
                    <span class="detail-value">${new Date(transaction.Created_at).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Delivery Date</span>
                    <span class="detail-value">${new Date(transaction.DT).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Product</span>
                    <span class="detail-value">${transaction.Product}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Quantity</span>
                    <span class="detail-value">${transaction.Quantity}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price Per Unit</span>
                    <span class="detail-value">$${transaction.PricePernit.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total</span>
                    <span class="detail-value">$${(transaction.PricePernit * transaction.Quantity).toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Role</span>
                    <span class="detail-value">${transaction.Buyer === userId ? 'Buyer' : 'Seller'}</span>
                </div>
            </div>
        `).join('');
    }

    // Make showUserTransactions available globally
    window.showUserTransactions = (userId) => {
        currentUserId = userId;
        const user = allUsers.find(u => u.AgentID === userId);
        document.querySelector('.modal-header h2').textContent = `Transactions for ${userId}`;
        displayUserTransactions(userId);
        modal.classList.add('show');
    };
}); 