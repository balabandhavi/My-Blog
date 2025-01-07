
const express = require('express');
const app=express();
const PORT=3000;

app.use(express.static('public'));

app.get('/',(req,res)=>{
    res.sendFile(MY-BLOG+'/public/index.html');
});

app.post('/process-message',express.json(),(req,res)=>{
    const userMessage=req.body.message;
    console.log(`Received message: ${userMessage}`);

    const serverReply=`Hello, you said "${userMessage}"!`;
    res.json({reply:serverReply});
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});