document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission

        const userId = document.getElementById("userId").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token); 
                window.location.href = "/home.html";  

            } else {
                alert(data.error || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again later.");
        }
    });
});