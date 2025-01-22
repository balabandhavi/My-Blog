
document.addEventListener('DOMContentLoaded',async function(){

    const userEmailSpan = document.getElementById('user-email');
    
    try {
        const response = await fetch('/get-user'); 
        const data = await response.json();

        if (data.user) {
            userEmailSpan.textContent = data.user; 
        } else {
            userEmailSpan.textContent = 'Guest'; 
        }
    } catch (error) {
        console.error('Error fetching user:', error);
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