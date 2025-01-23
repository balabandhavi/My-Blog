document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signup-form');

    signupForm.addEventListener('submit', async function (event) {
        event.preventDefault(); 

        const firstName=document.getElementById('first-name');
        const middleName=document.getElementById('middle-name');
        const lastName=document.getElementById('last-name');
        const userId=document.getElementById('userId');
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
                body: JSON.stringify({
                    firstName:firstName.value,
                    lastName:lastName.value,
                    middleName:middleName ? middleName.value : '',
                    userId:userId.value,
                    email: email.value,
                    password: password.value 
                }) 
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
