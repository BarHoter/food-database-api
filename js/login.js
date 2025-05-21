document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userId = document.getElementById('userId').value.trim();
        
        if (!userId) {
            alert('נא להזין מזהה משתמש');
            return;
        }
        
        try {
            // Load agents data to validate user
            const response = await fetch('../data/generated_data_agents.json');
            const agents = await response.json();
            
            // Check if user exists
            const userExists = agents.some(agent => agent.AgentID === userId);
            
            if (!userExists) {
                alert('מזהה משתמש לא קיים במערכת');
                return;
            }
            
            // Store user ID in localStorage
            localStorage.setItem('currentUser', userId);
            
            // Redirect based on user type
            if (userId === 'foodgod') {
                window.location.href = 'management.html';
            } else {
                window.location.href = 'dashboard.html';
            }
            
        } catch (error) {
            console.error('Error during login:', error);
            alert('אירעה שגיאה בתהליך הכניסה למערכת');
        }
    });
}); 