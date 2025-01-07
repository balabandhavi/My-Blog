
document.addEventListener('DOMContentLoaded',()=>{
    //for calendar
    const button=document.getElementById('showDateButton');
    const dateDisplay=document.getElementById('dateDisplay');

    button.addEventListener('click',()=>{
        const today=new Date();
        const formattedDate=today.toDateString();
        dateDisplay.textContent=`${formattedDate}`;
    });

    
    //for form
    const form=document.getElementById('userForm');
    const input=document.getElementById('userInput');
    const displayMessage=document.getElementById('displayMessage');


    form.addEventListener('submit',async(e)=>{
        e.preventDefault(); // to prevent page reload
        
        const userMessage=input.value.trim();
        if(userMessage){
            try{
                const response=await fetch('/process-message',{
                    method: 'POST',
                    headers:{'Content-Type': 'application/json'},
                    body: JSON.stringify({message:userMessage}),
                });

                const data=await response.json();
                displayMessage.textContent=`Server says: ${data.reply}`;
                input.value='';
            }catch(error){
                displayMessage.textContent='Error communicating with the server.';
                console.error('Error:',error);
            }
        }else{
            displayMessage.textContent=`Please enter something`;
        }
    });

});
