
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

    const viewMessagesBtn=document.getElementById('view-messages');
    const messagesList=document.getElementById('messages-list');

    if(viewMessagesBtn){
        viewMessagesBtn.addEventListener('click',async function(){
            try{
                const response=await fetch('/messages');
                const data =await response.json();

                if(response.ok){
                    messagesList.innerHTML='';

                    data.forEach(msg=>{
                        const li=document.createElement('li');
                        li.textContent=`${msg.message}`;
                        messagesList.appendChild(li);
                    });
                }else{
                    alert('Failed to load messages');
                }
            }catch(error){
                console.error('Error fecting messages: ',error);
                alert('Something went wrong');
            }
        });
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