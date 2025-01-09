
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

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});