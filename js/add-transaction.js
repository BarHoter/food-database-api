document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Check if user is foodgod
    if (currentUser === 'foodgod') {
        window.location.href = 'management.html';
        return;
    }

    // Get form elements
    const form = document.querySelector('form');
    const productCodeSelect = document.getElementById('productCode');
    const productNameSelect = document.getElementById('productName');
    const buyerSelect = document.getElementById('buyer');
    const deliveryDateInput = document.getElementById('deliveryDate');
    const quantityInput = document.getElementById('quantity');
    const pricePerUnitInput = document.getElementById('pricePerUnit');
    const shippingPriceInput = document.getElementById('shippingPrice');

    // Set minimum delivery date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    deliveryDateInput.min = tomorrow.toISOString().split('T')[0];

    // Load items data first
    let itemsData;
    try {
        const response = await fetch('../data/random_records.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        itemsData = await response.json();
    } catch (error) {
        console.error('Error loading items data:', error);
        alert('Error loading items data: ' + error.message);
        return;
    }

    // Load itemssellers data
    let userProducts;
    try {
        const response = await fetch('../data/generated_data_itemssellers.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const itemssellersData = await response.json();
        
        // Filter items for current seller
        userProducts = itemssellersData
            .filter(item => item.AgentID === currentUser)
            .map(item => {
                const itemDetails = itemsData.find(i => i.Code === item.Code);
                return {
                    Code: item.Code,
                    Name: itemDetails?.english_name || 'Unknown Item',
                    Price: itemDetails?.Price || 0
                };
            });
    } catch (error) {
        console.error('Error loading seller items:', error);
        alert('Error loading seller items: ' + error.message);
        return;
    }

    // Load products into dropdowns
    loadProducts(userProducts);
    // Load buyers
    loadBuyers();

    // Add event listeners for product dropdowns
    productCodeSelect.addEventListener('change', () => syncProductSelection('code'));
    productNameSelect.addEventListener('change', () => syncProductSelection('name'));

    // Function to load products into both dropdowns
    function loadProducts(products) {
        try {
            // Clear existing options except the first one
            productCodeSelect.innerHTML = '<option value="">Select a product code</option>';
            productNameSelect.innerHTML = '<option value="">Select a product name</option>';

            // Add products to both dropdowns
            products.forEach(product => {
                // Add to product code dropdown
                const codeOption = document.createElement('option');
                codeOption.value = product.Code;
                codeOption.textContent = product.Code;
                productCodeSelect.appendChild(codeOption);

                // Add to product name dropdown
                const nameOption = document.createElement('option');
                nameOption.value = product.Code;
                nameOption.textContent = product.Name;
                productNameSelect.appendChild(nameOption);
            });
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Error loading products: ' + error.message);
        }
    }

    // Function to load buyers
    async function loadBuyers() {
        try {
            const response = await fetch('../data/generated_data_agents.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const agents = await response.json();
            
            // Filter out the current user and add other agents as buyers
            const buyers = agents.filter(agent => agent.AgentID !== currentUser);
            
            buyerSelect.innerHTML = '<option value="">Select a buyer</option>';
            buyers.forEach(buyer => {
                const option = document.createElement('option');
                option.value = buyer.AgentID;
                option.textContent = `${buyer.Name} (${buyer.AgentID})`;
                buyerSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading buyers:', error);
            alert('Error loading buyers: ' + error.message);
        }
    }

    // Function to sync product selection between dropdowns
    function syncProductSelection(source) {
        const selectedValue = source === 'code' ? 
            productCodeSelect.value : 
            productNameSelect.value;

        if (source === 'code') {
            productNameSelect.value = selectedValue;
        } else {
            productCodeSelect.value = selectedValue;
        }

        // If a product is selected, set its price
        if (selectedValue) {
            const product = userProducts.find(p => p.Code === selectedValue);
            if (product) {
                pricePerUnitInput.value = product.Price;
            }
        }
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Create transaction object
        const transaction = {
            TransactionID: generateTransactionID(),
            Created_at: new Date().toISOString(),
            DT: deliveryDateInput.value,
            Code: productCodeSelect.value,
            Quantity: parseInt(quantityInput.value),
            Price_Per_Unit: parseFloat(pricePerUnitInput.value),
            Shipping_Price: parseFloat(shippingPriceInput.value),
            SellerID: currentUser,
            BuyerID: buyerSelect.value,
            Status: "Pending"
        };

        try {
            // Get existing transactions
            const response = await fetch('../data/generated_data_transactions.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const transactions = await response.json();
            
            // Add new transaction
            transactions.push(transaction);
            
            // Save updated transactions
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            alert('Transaction created successfully!');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error saving transaction: ' + error.message);
        }
    });

    // Helper function to generate transaction ID
    function generateTransactionID() {
        return 'TRX_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}); 