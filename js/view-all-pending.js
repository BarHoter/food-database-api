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
        
        // Filter pending transactions
        allTransactions = transactions.filter(t => t.Status === 'Pending');
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

    async function handleTransactionAction(transactionId, action) {
        try {
            // In a real application, this would be an API call
            // For now, we'll update the local data
            const transactionIndex = allTransactions.findIndex(t => t.TransactionID === transactionId);
            if (transactionIndex === -1) return;

            allTransactions[transactionIndex].Status = action;
            
            // Update filtered transactions
            const filteredIndex = filteredTransactions.findIndex(t => t.TransactionID === transactionId);
            if (filteredIndex !== -1) {
                filteredTransactions.splice(filteredIndex, 1);
            }

            // Update the display
            displayTransactions(filteredTransactions);

            // Show success message
            alert(`Transaction ${transactionId} has been ${action.toLowerCase()}`);

        } catch (error) {
            console.error('Error updating transaction:', error);
            alert('Error updating transaction. Please try again.');
        }
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
                    <span class="status-badge status-pending">Pending</span>
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
                    <div class="action-buttons">
                        <button onclick="handleTransactionAction('${transaction.TransactionID}', 'Approved')" class="approve-btn">Approve</button>
                        <button onclick="handleTransactionAction('${transaction.TransactionID}', 'Rejected')" class="reject-btn">Reject</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Make handleTransactionAction available globally
    window.handleTransactionAction = handleTransactionAction;
}); 