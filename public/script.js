
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
                displayMessage.textContent=`${data.serverReply}`;
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

//document.addEventListener('DOMContentLoaded',async()=>{
    //const displayMessage=document.getElementById('displayMessage');

    // try{
    //     const response=await fetch('/messages');
    //     const data = await response.json();

    //     if(data.messages.length >0){
    //         displayMessage.textContent=`Previous messages: ${data.messages.join(', ')}`;
    //     }else{
    //         displayMessage.textContent='No messages yet.';
    //     }
    // }catch(error){
    //     displayMessage.textContent='Error fetching messages.';
    //     console.error('Error: ',error);        
    // }

   
//});

async function fetchMessages(){
    try{
        const response=await fetch('/messages');
        const data = await response.json();

        const messagesList=document.getElementById('messages-list');
        messagesList.innerHTML='';

        data.forEach(msg=>{
            const listItem=document.createElement('li');
            listItem.textContent= `${msg.message} \t\t ${msg.timestamp}`;
            messagesList.appendChild(listItem);
        });
    }catch(error){
        console.error('Error fetching messages:',error);
    }
}

async function deleteAllMessages(){
    try{
        const response=await fetch('/messages',
            {method: 'DELETE'});
        
        const data=await response.json();

        if(data.success){
            const messagesList=document.getElementById('messages-list');
            messagesList.innerHTML='';
            alert(data.message);
        }
    }catch(error){
        console.error('Error deleting messages:',error);
        alert('Failed to delete messages. Please try again.');
    }
}
