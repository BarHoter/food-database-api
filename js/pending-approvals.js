document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    loadPendingTransactions();
});

function loadPendingTransactions() {
    // Get all transactions
    const transactions = JSON.parse(localStorage.getItem('allTransactions') || '[]');
    
    // Get current user
    const currentUser = localStorage.getItem('currentUser');
    
    // Filter pending transactions where current user is the buyer
    const pendingTransactions = transactions.filter(t => 
        t.BuyerID === currentUser && t.Status === 'Pending'
    );

    const container = document.getElementById('pendingTransactions');
    
    if (pendingTransactions.length === 0) {
        container.innerHTML = '<p class="no-data">No pending transactions to approve</p>';
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
                <th>Seller</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');
    
    pendingTransactions.forEach(transaction => {
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
            <td>${transaction.SellerID}</td>
            <td>
                <button onclick="approveTransaction('${transaction.TransactionID}')" class="approve-btn">Approve</button>
                <button onclick="rejectTransaction('${transaction.TransactionID}')" class="reject-btn">Reject</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    container.appendChild(table);
}

function approveTransaction(transactionId) {
    let transactions = JSON.parse(localStorage.getItem('allTransactions') || '[]');
    const transactionIndex = transactions.findIndex(t => t.TransactionID === transactionId);
    
    if (transactionIndex !== -1) {
        // Update status to Approved
        transactions[transactionIndex].Status = 'Approved';
        localStorage.setItem('allTransactions', JSON.stringify(transactions));
        
        // Update approved transactions list
        let approvedTransactions = JSON.parse(localStorage.getItem('approvedTransactions') || '[]');
        approvedTransactions.push(transactions[transactionIndex]);
        localStorage.setItem('approvedTransactions', JSON.stringify(approvedTransactions));
        
        // Remove from pending
        let pendingTransactions = JSON.parse(localStorage.getItem('pendingTransactions') || '[]');
        pendingTransactions = pendingTransactions.filter(t => t.TransactionID !== transactionId);
        localStorage.setItem('pendingTransactions', JSON.stringify(pendingTransactions));
        
        alert('Transaction approved successfully!');
        loadPendingTransactions(); // Refresh the list
    }
}

function rejectTransaction(transactionId) {
    let transactions = JSON.parse(localStorage.getItem('allTransactions') || '[]');
    const transactionIndex = transactions.findIndex(t => t.TransactionID === transactionId);
    
    if (transactionIndex !== -1) {
        // Update status to Rejected
        transactions[transactionIndex].Status = 'Rejected';
        localStorage.setItem('allTransactions', JSON.stringify(transactions));
        
        // Update rejected transactions list
        let rejectedTransactions = JSON.parse(localStorage.getItem('rejectedTransactions') || '[]');
        rejectedTransactions.push(transactions[transactionIndex]);
        localStorage.setItem('rejectedTransactions', JSON.stringify(rejectedTransactions));
        
        // Remove from pending
        let pendingTransactions = JSON.parse(localStorage.getItem('pendingTransactions') || '[]');
        pendingTransactions = pendingTransactions.filter(t => t.TransactionID !== transactionId);
        localStorage.setItem('pendingTransactions', JSON.stringify(pendingTransactions));
        
        alert('Transaction rejected successfully!');
        loadPendingTransactions(); // Refresh the list
    }
} 