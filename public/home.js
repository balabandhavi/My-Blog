
document.addEventListener('DOMContentLoaded',function(){

    try {
        const response = fetch('/get-user');
        const data =  response.json();

        if (data.user && data.user.email) {
            document.getElementById('user-email').textContent = data.user.email;
        } else {
            document.getElementById('user-email').textContent = 'Guest'; 
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    logoutButton.addEventListener('click',async ()=>{

        try{
            await fetch('/logout',{method:'POST'});
            window.location.href='/index.html';
        }catch(error){
            console.log('Logout failed: ',error);
        }
    });
});