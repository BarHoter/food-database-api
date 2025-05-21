document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const transactionsContainer = document.getElementById('transactionsContainer');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const backButton = document.getElementById('backButton');
    const logoutBtn = document.getElementById('logoutBtn');

    let allTransactions = [];
    let filteredTransactions = [];
    let productMap = {};

    // Handle logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Handle back button
    backButton.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

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
        const response = await fetch('../data/transactions.json');
        allTransactions = await response.json();
        
        // If user is foodgod, show all transactions
        if (currentUser === 'foodgod') {
            filteredTransactions = [...allTransactions];
        } else {
            // For regular users, show only their transactions
            filteredTransactions = allTransactions.filter(t => 
                t.Buyer === currentUser || t.Seller === currentUser
            );
        }
        
        displayTransactions(filteredTransactions);
        
        // Set up search and filter handlers
        searchInput.addEventListener('input', filterTransactions);
        statusFilter.addEventListener('change', filterTransactions);
        dateFilter.addEventListener('change', filterTransactions);
        
    } catch (error) {
        console.error('Error loading transactions or products:', error);
        transactionsContainer.innerHTML = '<div class="no-results">Error loading transactions. Please try again later.</div>';
    }

    function filterTransactions() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const dateValue = dateFilter.value;

        filteredTransactions = allTransactions.filter(transaction => {
            const productKey = String(transaction.Product).replace(/\D/g, '');
            const matchesSearch = 
                transaction.TransactionID.toLowerCase().includes(searchTerm) ||
                productKey.toLowerCase().includes(searchTerm) ||
                (productMap[productKey] && productMap[productKey].toLowerCase().includes(searchTerm)) ||
                transaction.Buyer.toLowerCase().includes(searchTerm) ||
                transaction.Seller.toLowerCase().includes(searchTerm);

            const matchesStatus = !statusValue || transaction.Status === statusValue;

            let matchesDate = true;
            if (dateValue) {
                const transactionDate = new Date(transaction.DT);
                const today = new Date();
                const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

                switch (dateValue) {
                    case 'today':
                        matchesDate = transactionDate.toDateString() === today.toDateString();
                        break;
                    case 'week':
                        matchesDate = transactionDate >= lastWeek;
                        break;
                    case 'month':
                        matchesDate = transactionDate >= lastMonth;
                        break;
                }
            }

            // For regular users, only show their transactions
            const isUserTransaction = currentUser === 'foodgod' || 
                transaction.Buyer === currentUser || 
                transaction.Seller === currentUser;

            return matchesSearch && matchesStatus && matchesDate && isUserTransaction;
        });

        displayTransactions(filteredTransactions);
    }

    function getStatusBadge(status) {
        return `<span class="status-badge status-${status.toLowerCase()}">${status}</span>`;
    }

    function displayTransactions(transactions) {
        if (transactions.length === 0) {
            transactionsContainer.innerHTML = '<div class="no-results">No transactions found</div>';
            return;
        }

        transactionsContainer.innerHTML = transactions.map(transaction => {
            // Extract only digits from the product code to match the Code in productMap
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