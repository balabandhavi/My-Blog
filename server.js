
require('dotenv').config(); // dotenv is for managing environment variables securely

const express = require('express');

const bcrypt=require('bcryptjs');  // bcryptjs is for hashing passwords securely
const jwt=require('jsonwebtoken'); //jsonwebtoken is to generate JWT tokens for authentication
const cors=require('cors');  // cors it to allow cross-origin requests

const {Pool}=require('pg');//importing pg for PostgreSQL


const app=express();
const PORT=3000;

//Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cors());


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



const pool=new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const SECRET_KEY=process.env.JWT_SECRET;

app.get('/',(req,res)=>{
    res.sendFile(MY-BLOG+'/public/index.html');
});

const messages= [];

app.post('/signup', async(req,res)=>{
    const {email, password}= req.body;

    try{
        const hashedPassword=await bcrypt.hash(password,10);

        const result=await pool.query(
            'INSERT INTO users (email, password) VALUES ($1,$2) RETURNING id,email',
            [email, hashedPassword]
        );

        res.status(201).json({ 
            message: 'User registered successfully',
            user:result.rows[0]
        });

    } catch(error){

        console.error('Signup error: ',error);
        res.status(500).json({
            error: 'Failed to register user'
        });
    }
});

app.post('/login',async(req,res)=>{
    
    const { email ,password}=req.body;

    try{

        const result=await pool.query('SELECT * FROM users WHERE email =$1',
            [email]
        );

        if(result.rows.length === 0){
            return res.status(401).json({
                error: 'Invalid email or password'});
        }

        const user=result.rows[0];

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({error: 'Invalid email or password' });
        }

        const token =jwt.sign({
            userId: user.id,
            email: user.email
        },SECRET_KEY,{
            expiresIn: '1h'
        });

        res.json({
            message: 'Login successful',
            token
        });

    }catch (error){
        console.error('Login error: ', error);
        res.status(500).json({ error: 'Failed to log in'});
    }

});

const authenticateToken=(req,res,next)=>{
    const token = req.headers['authorization'];

    if(!token){
        return res.status(403).json({error: 'Access denied'});
    }

    jwt.verify(token,SECRET_KEY,(err,user)=>{
        if(err) return res.status(403).json({error: 'Invalid token'});
        req.user=user;
        next();
    });
};

app.get('/protected', authenticateToken,(req,res)=>{
    res.json({message: `Welcome, ${req.user.email}! You have access to this route.`});
});


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






















// POOL class creates a connection pool,which is group of resuable connections to the database
//it allows multiple queries to be executed concurrently
//it is bes for applications with multiple simultaneous databse queries or when we need efficient connection management




// const db=new pg.Client({
//     user : "postgres",
//     host : "localhost",
//     database :"world",
//     password:"Radhika@1980",
//     port: 5432,
// });

//We won't be using Client class here.it creates a single connection to the database





// app.post('/process-message',(req,res)=>{
//     const {message}=req.body;
//     const timestamp=new Date().toLocaleString();
//     // console.log(`Received message: ${userMessage}`);

//     messages.push({message,timestamp});

//     const serverReply=`Hello!, you said "${message}"!`;
//     res.json({success:true, serverReply});
// });