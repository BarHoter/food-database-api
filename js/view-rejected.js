document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const transactionsContainer = document.getElementById('transactionsContainer');

    let allTransactions = [];
    let productMap = {};

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

        // Filter only rejected transactions for the current user
        const rejectedTransactions = allTransactions.filter(t => t.Status === 'Rejected' && (t.Buyer === currentUser || t.Seller === currentUser));

        displayTransactions(rejectedTransactions);
    } catch (error) {
        console.error('Error loading transactions or products:', error);
        if (transactionsContainer) transactionsContainer.innerHTML = '<div class="no-results">Error loading transactions. Please try again later.</div>';
    }

    function displayTransactions(transactions) {
        if (!transactionsContainer) return;
        if (transactions.length === 0) {
            transactionsContainer.innerHTML = '<div class="no-results">No rejected transactions found</div>';
            return;
        }

        transactionsContainer.innerHTML = transactions.map(transaction => {
            const productKey = String(transaction.Product);
            const productName = productMap[productKey] ? `(${productMap[productKey]})` : '';
            return `
            <div class="transaction-card">
                <div class="transaction-header">
                    <span class="transaction-id">Transaction #${transaction.TransactionID}</span>
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
                        <span class="detail-value">${productKey} ${productName}</span>
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