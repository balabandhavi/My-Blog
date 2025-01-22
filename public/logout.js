
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logoutButton');

    if (logoutButton) {
        logoutButton.addEventListener('click', async function () {
            try {
                const response = await fetch('/logout', { method: 'POST' });

                if (response.ok) {
                    alert('Logged out successfully!');
                    window.location.href = '/index.html';  
                } else {
                    alert('Logout failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during logout:', error);
                alert('Something went wrong. Try again.');
            }
        });
    }
});
