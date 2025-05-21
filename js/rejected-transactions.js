document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Get role from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');

    // Update role indicator
    const roleIndicator = document.getElementById('roleIndicator');
    roleIndicator.textContent = role === 'buyer' ? 'Transactions as Buyer' : 'Transactions as Seller';

    loadRejectedTransactions(role);
});

function loadRejectedTransactions(role) {
    // Get all transactions
    const transactions = JSON.parse(localStorage.getItem('allTransactions') || '[]');
    
    // Get current user
    const currentUser = localStorage.getItem('currentUser');
    
    // Filter rejected transactions based on role
    const rejectedTransactions = transactions.filter(t => {
        if (role === 'buyer') {
            return t.BuyerID === currentUser && t.Status === 'Rejected';
        } else {
            return t.SellerID === currentUser && t.Status === 'Rejected';
        }
    });

    const container = document.getElementById('rejectedTransactions');
    
    if (rejectedTransactions.length === 0) {
        container.innerHTML = '<p class="no-data">No rejected transactions found</p>';
        return;
    }

    // Create table for transactions
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Transaction ID</th>
                <th>Created At</th>
                <th>Delivery Date</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price Per Unit</th>
                <th>Shipping</th>
                <th>Total Price</th>
                <th>${role === 'buyer' ? 'Seller' : 'Buyer'}</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');
    
    rejectedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.TransactionID}</td>
            <td>${new Date(transaction.Created_at).toLocaleDateString()}</td>
            <td>${new Date(transaction.DT).toLocaleDateString()}</td>
            <td>${transaction.Code} - ${transaction.ProductName}</td>
            <td>${transaction.Quantity}</td>
            <td>₪${transaction.PricePerUnit}</td>
            <td>₪${transaction.ShippingPrice}</td>
            <td>₪${transaction.TotalPrice}</td>
            <td>${role === 'buyer' ? transaction.SellerID : transaction.BuyerID}</td>
        `;
        tbody.appendChild(row);
    });

    container.appendChild(table);
} 