document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Load seller data to check if current user is a seller
    try {
        const response = await fetch('../data/generated_data_itemssellers.json');
        const sellerData = await response.json();
        
        // Check if current user is a seller
        const isSeller = sellerData.some(item => item.AgentID === currentUser);
        
        // Show seller section if user is a seller
        const sellerSection = document.getElementById('sellerSection');
        if (isSeller) {
            sellerSection.style.display = 'block';
        }

        // Add logout button
        const container = document.querySelector('.container');
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'logout-btn';
        logoutBtn.onclick = () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        };
        container.appendChild(logoutBtn);

    } catch (error) {
        console.error('Error loading seller data:', error);
    }
}); 