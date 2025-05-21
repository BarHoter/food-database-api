document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is foodgod
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser !== 'foodgod') {
        window.location.href = 'index.html';
        return;
    }

    const transactionsContainer = document.getElementById('transactionsContainer');
    const searchInput = document.getElementById('searchInput');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const backButton = document.querySelector('.back-btn');
    const logoutBtn = document.getElementById('logoutBtn');

    let allTransactions = [];
    let filteredTransactions = [];
    let productMap = {};

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // Handle back button
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'management.html';
        });
    }

    // Load products and transactions
    try {
        // Load products
        const productsResponse = await fetch('../data/random_records.json');
        const products = await productsResponse.json();
        // Build product code to name map (as string)
        productMap = {};
        products.forEach(product => {
            productMap[String(product.Code)] = product.english_name;
        });

        // Load transactions
        const response = await fetch('../data/generated_data_transactions.json');
        allTransactions = await response.json();
        
        // Filter only approved transactions
        filteredTransactions = allTransactions.filter(t => t.Status === 'Approved');
        
        displayTransactions(filteredTransactions);
        
        // Set up search and filter handlers
        if (searchInput) searchInput.addEventListener('input', filterTransactions);
        if (startDate) startDate.addEventListener('change', filterTransactions);
        if (endDate) endDate.addEventListener('change', filterTransactions);
        
    } catch (error) {
        console.error('Error loading transactions or products:', error);
        if (transactionsContainer) transactionsContainer.innerHTML = '<div class="no-results">Error loading transactions. Please try again later.</div>';
    }

    function filterTransactions() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const start = startDate && startDate.value ? new Date(startDate.value) : null;
        const end = endDate && endDate.value ? new Date(endDate.value) : null;

        filteredTransactions = allTransactions.filter(transaction => {
            const productKey = String(transaction.Product).replace(/\D/g, '');
            const matchesSearch = 
                transaction.TransactionID.toLowerCase().includes(searchTerm) ||
                productKey.toLowerCase().includes(searchTerm) ||
                (productMap[productKey] && productMap[productKey].toLowerCase().includes(searchTerm)) ||
                transaction.Buyer.toLowerCase().includes(searchTerm) ||
                transaction.Seller.toLowerCase().includes(searchTerm);

            let matchesDate = true;
            if (start || end) {
                const transactionDate = new Date(transaction.DT);
                if (start && transactionDate < start) matchesDate = false;
                if (end && transactionDate > end) matchesDate = false;
            }

            return matchesSearch && matchesDate && transaction.Status === 'Approved';
        });

        displayTransactions(filteredTransactions);
    }

    function getStatusBadge(status) {
        return `<span class="status-badge status-${status.toLowerCase()}">${status}</span>`;
    }

    function displayTransactions(transactions) {
        if (!transactionsContainer) return;
        if (transactions.length === 0) {
            transactionsContainer.innerHTML = '<div class="no-results">No transactions found</div>';
            return;
        }

        transactionsContainer.innerHTML = transactions.map(transaction => {
            const productKey = String(transaction.Product).replace(/\D/g, '');
            const productName = productMap[productKey] ? `(${productMap[productKey]})` : '';
            return `
            <div class="transaction-card">
                <div class="transaction-header">
                    <span class="transaction-id">Transaction #${transaction.TransactionID}</span>
                    ${getStatusBadge(transaction.Status)}
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
                        <span class="detail-value">${transaction.Product} ${productName}</span>
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
                        <span class="detail-label">Buyer</span>
                        <span class="detail-value">${transaction.Buyer}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Seller</span>
                        <span class="detail-value">${transaction.Seller}</span>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }
}); 