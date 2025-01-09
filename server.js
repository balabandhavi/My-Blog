
const express = require('express');
const app=express();
const PORT=3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/',(req,res)=>{
    res.sendFile(MY-BLOG+'/public/index.html');
});

const messages= [];

app.post('/process-message',(req,res)=>{
    const {message}=req.body;
    const timestamp=new Date().toLocaleString();
    // console.log(`Received message: ${userMessage}`);

    messages.push({message,timestamp});

    const serverReply=`Hello!, you said "${message}"!`;
    res.json({success:true, serverReply});
});

app.get('/messages',(req,res)=>{
    res.json(messages );
});

app.delete('/messages',(req,res)=>{
    messages.length=0;
    res.json({success:true, message: 'All mssages deleted successfully!'});
});

app.delete('/messages/:timestamp',(req,res)=>{
    const {timestamp}=req.params;
    const index=messages.findIndex(msg=> msg.timestamp===timestamp);

    if(index!== -1){
        messages.splice(index,1);
        res.json({success:true});
    }else{
        res.status(404).json({success:false,error: 'Message not found'});
    }
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});