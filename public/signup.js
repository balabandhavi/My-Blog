document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signup-form');

    signupForm.addEventListener('submit', async function (event) {
        event.preventDefault(); 

        const email = document.getElementById('email');
        const password = document.getElementById('password');

        if (!email.value || !password.value) {  // Fix: Check values instead of elements
            alert('All fields are required.');
            return;
        }

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.value, password: password.value }) // Fix: Send values
            });

            const data = await response.json();

            if (response.ok) {
                alert('Signup successful! Redirecting to login page...');
                window.location.href = '/login.html'; 
            } else {
                alert(data.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('Something went wrong. Please try again later.');
        }
    });
});
