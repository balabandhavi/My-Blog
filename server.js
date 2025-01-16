
const express = require('express');
const {Pool}=require('pg');//importing pg for PostgreSQL
const app=express();
const PORT=3000;

//Middleware
app.use(express.static('public'));
app.use(express.json());


const logger =(req,res,next)=>{
    console.log(`${req.method} request made to: ${req.url}`);
    next();
};

app.use(logger);

const errorHandler=(err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send({ error: 'something went wrong!'});
};

app.use(errorHandler);

// POOL class creates a connection pool,which is group of resuable connections to the database
//it allows multiple queries to be executed concurrently
//it is bes for applications with multiple simultaneous databse queries or when we need efficient connection management


const pool=new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'messages_app',
    password: 'Radhika@1980',
    port: 5432,
});

// const db=new pg.Client({
//     user : "postgres",
//     host : "localhost",
//     database :"world",
//     password:"Radhika@1980",
//     port: 5432,
// });

//We won't be using Client class here.it creates a single connection to the database

app.get('/',(req,res)=>{
    res.sendFile(MY-BLOG+'/public/index.html');
});

const messages= [];

// app.post('/process-message',(req,res)=>{
//     const {message}=req.body;
//     const timestamp=new Date().toLocaleString();
//     // console.log(`Received message: ${userMessage}`);

//     messages.push({message,timestamp});

//     const serverReply=`Hello!, you said "${message}"!`;
//     res.json({success:true, serverReply});
// });

app.get('/messages',async(req,res)=>{
    try{
        const query='SELECT * FROM messages ORDER BY timestamp DESC';
        const result=await pool.query(query);
        res.json(result.rows);
    }catch(error){
        console.error('Error fetching messages: ',error);
        res.status(500).json({
            error:'Failed to fetch messages.'
        });
    }
});


app.post('/process-message',async(req,res)=>{
    const {message}=req.body;
    if(!message){
        return res.status(400).json({error:'Message is required!'});
    }
    try{
        const query='Insert into messages (message) VALUES ($1) RETURNING *';
        const result=await pool.query(query,[message]);
        res.json({
            success:true,
            serverReply:`${message}`,
            data:result.rows[0]
        });
    }catch(error){
        console.error('Error inserting message: ',error);
        res.status(500).json({
            error: 'Failed to save message'
        });
    }
});


app.put('/messages/:id',async(req,res)=>{

    const {id}=req.params;
    const {message}=req.body;

    if(!message || message.trim()===''){
        return res.status(400).json({
            error: 'Message cannot be empty.'
        });
    }

    try{
        const result=await pool.query(
            'UPDATE messages SET message = $1 WHERE id = $2 RETURNING *',
            [message, id]
        );

        if(result.rowCount === 0){
            return res.status(404).json({
                error: 'Message not found.'
            });
        }

        res.json({
            success:true, 
            updatedMessage: result.rows[0]
        });
    }catch(error){
        console.error('Error updating message: ',error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


app.delete('/messages/:id', async(req,res)=>{

    const {id}=req.params;

    try{
        const result=await pool.query(
            'DELETE FROM messages WHERE id = $1 RETURNING *',
            [id]
        );

        if(result.rowCount ===0){
            return res.status(404).json({
                error: 'Message not found.'
            });
        }

        res.json({
            success:true,
            deletedMessage: result.rows[0]
        });

    }catch(error){

        console.error('Error deleting message: ',error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

app.post('/process-message',async(req,res)=>{

    const {message}=req.body;

    if(!message || message.trim()===''){
        return res.status(400).json({error: 'Message cannot be empty.'});
    }

    try{
        const result=await pool.query(
            'INSERT INTO messages (message) VALUES ($1) RETRNING *',
            [message]
        );

        res.json({
            success:true,
            newMessage: result.rows[0]
        });
    }catch(error) {
        console.error('Error adding message: ',error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
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