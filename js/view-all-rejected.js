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

    const transactionsContainer = document.getElementById('transactionsContainer');
    const searchInput = document.getElementById('searchInput');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');

    let allTransactions = [];
    let filteredTransactions = [];

    // Load transactions
    try {
        const response = await fetch('../data/generated_data_transactions.json');
        const transactions = await response.json();
        
        // Filter rejected transactions
        allTransactions = transactions.filter(t => t.Status === 'Rejected');
        filteredTransactions = [...allTransactions];
        
        // Load initial view
        displayTransactions(filteredTransactions);
        
        // Set up search and filter handlers
        searchInput.addEventListener('input', filterTransactions);
        startDate.addEventListener('change', filterTransactions);
        endDate.addEventListener('change', filterTransactions);
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        transactionsContainer.innerHTML = '<div class="no-results">Error loading transactions. Please try again later.</div>';
    }

    function filterTransactions() {
        const searchTerm = searchInput.value.toLowerCase();
        const start = startDate.value ? new Date(startDate.value) : null;
        const end = endDate.value ? new Date(endDate.value) : null;

        filteredTransactions = allTransactions.filter(transaction => {
            const matchesSearch = 
                transaction.TransactionID.toLowerCase().includes(searchTerm) ||
                transaction.BuyerID.toLowerCase().includes(searchTerm) ||
                transaction.SellerID.toLowerCase().includes(searchTerm) ||
                transaction.ProductBarcode.toLowerCase().includes(searchTerm);

            if (!matchesSearch) return false;

            if (start || end) {
                const transactionDate = new Date(transaction.DT);
                if (start && transactionDate < start) return false;
                if (end && transactionDate > end) return false;
            }

            return true;
        });

        displayTransactions(filteredTransactions);
    }

    function displayTransactions(transactions) {
        if (transactions.length === 0) {
            transactionsContainer.innerHTML = '<div class="no-results">No transactions found</div>';
            return;
        }

        transactionsContainer.innerHTML = transactions.map(transaction => `
            <div class="transaction-card">
                <div class="transaction-header">
                    <span class="transaction-id">${transaction.TransactionID}</span>
                    <span class="status-badge status-rejected">Rejected</span>
                </div>
                <div class="transaction-details">
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
                        <span class="detail-value">${transaction.ProductBarcode}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Quantity</span>
                        <span class="detail-value">${transaction.Quantity}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Price/Unit</span>
                        <span class="detail-value">$${transaction.PricePerUnit.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Shipping</span>
                        <span class="detail-value">$${transaction.ShippingPrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total</span>
                        <span class="detail-value">$${(transaction.PricePerUnit * transaction.Quantity + transaction.ShippingPrice).toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Seller</span>
                        <span class="detail-value">${transaction.SellerID}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Buyer</span>
                        <span class="detail-value">${transaction.BuyerID}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}); 