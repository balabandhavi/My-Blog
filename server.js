require('dotenv').config(); // dotenv is for managing environment variables securely

const express = require('express');
const multer=require('multer');
const bodyParser=require('body-parser');

const bcrypt=require('bcryptjs');  // bcryptjs is for hashing passwords securely
const jwt=require('jsonwebtoken'); //jsonwebtoken is to generate JWT tokens for authentication
const cors=require('cors');  // cors it to allow cross-origin requests

const {Pool}=require('pg');//importing pg for PostgreSQL


const app=express();
const PORT=3000;

const upload=multer({dest: 'uploads/'});

//Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.use('/uploads',express.static('uploads'));

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

const session=require('express-session');

app.use(session({
    secret:SECRET_KEY,
    resave:false,
    saveUninitialized:false,
    cookie: {secure:false}
}));

const path = require("path");

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post('/signup', async (req, res) => {
    const { firstName, middleName, lastName, userId, email, password } = req.body;

    try {
        
        const userExists = await pool.query(
            'SELECT * FROM users WHERE userId = $1 OR email = $2',
            [userId, email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'User ID or Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (firstName, middleName, lastName, userId, email, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email',
            [firstName, middleName, lastName, userId, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                userId: result.rows[0].userId,
                email: result.rows[0].email
            }
        });

    } catch (error) {
        console.error('Signup error: ', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.post('/login', async (req, res) => {
    const { userId, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE userId = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid userId or password' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid userId or password' });
        }

        req.session.user = { userId: user.userid};
        const token = jwt.sign({ userId: user.userid}, SECRET_KEY, { expiresIn: '1h' });

        res.json({ success: true, message: 'Login successful', token });


    } catch (error) {
        console.error('Login error: ', error);
        res.status(500).json({ error: 'Failed to log in' });
    }
});

app.get('/get-user', (req,res)=>{
    console.log("Session user: ", req.session.user);
    if (req.session.user.userId) {
        return res.json({ user: req.session.user.userId });
    }else{
        res.json({
            user: null
        });
    }
});

app.get('/home',(req,res)=>{
    
    if(req.session.user){
        res.sendFile(path.join(__dirname, "public", "home.html"));    
    }else{
        res.redirect('./public/login.html');
    }
});



app.post('/logout', (req, res) => {
    req.session.destroy((err) => {  
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        
        res.clearCookie('connect.sid'); 
        res.json({ message: 'Logout successful' }); 
    });
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

app.get('/posts',async(req,res)=>{

    try{
        const result=await pool.query(`
            select posts.id, posts.title,posts.content,posts.created_at,users.userid as username,
            COALESCE(images.image_url,'') AS image_url
            FROM posts JOIN users ON posts.userid=users.userid
            LEFT JOIN images ON posts.id=images.post_id
            WHERE posts.status='published' ORDER BY posts.created_at DESC`
        );

        res.json(result.rows);
    }catch(error){

        console.error('Error fetching posts: ',error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

app.post('/posts/draft',async(req,res)=>{
    const {title,content}=req.body;
    // const user_id=req.session.user.userId;

    const result=await pool.query(
        'INSERT INTO posts (title,content,status,userid) VALUES ($1,$2,$3,$4) RETURNING *',
        [title,content,'draft',req.session.user.userId]
    );

    res.json({
        message: 'Draft saved successfully',
        post: result.rows[0],
    });
});

// app.post('/posts',async(req,res)=>{
//     const{title,content}=req.body;
//     const result=await pool.query(
//         'INSERT INTO POSTS (title,content,status,userid) VALUES ($1,$2,$3,$4) RETURNING id',
//         [title,content,'published',req.session.user.userId]
//     );

//     res.json({
//         message: 'Post published successfully',
//         post: result.rows[0],
//     });
// });

app.post('/posts',async(req,res)=>{

    const {title,content,status}=req.body;

    const userId=req.session?.user?.userId;
    

    if(!userId){
        return res.status(401).json({
            error: 'Unauthorized : Please log in first'
        });
    }

    try{
        const result=await pool.query(
            'INSERT INTO posts (title,content,status,userid) VALUES ($1,$2,$3,$4) RETURNING id',
            [title,content,status,userId]
        );

        res.json({
            message:'Post created successfully',
            post: result.rows[0]
        });
    }catch(error){
        console.error('Error creating post: ',error);
        res.status(500).json({error: 'Failed to create post'});
    }
});


app.put('/posts/:id', async(req,res)=>{
    const{title, content}=req.body;
    const result=await pool.query(
        'UPDATE posts SET title = $1, content= $2, updated_at= CURRENT_TIMESTAMP WHERE id= $3 RETURNING *',
        [title,content,req.params.id]
    );

    res.json({
        message: 'Post updated successfully',
        post: result.rows[0],
    });
});

app.delete('/posts/:id', async (req,res)=>{
    await pool.query('DELETE FROM posts WHERE id= $1',[req.params.id]);
    res.json({message: 'Post deleted successfully'});
});

app.post('/posts/:id/image',upload.single('image'), async(req,res)=>{
    const imageUrl=`/uploads/${req.file.filename}`;

    const result=await pool.query(
        'INSERT INTO images (post_id,image_url) VALUES ($1, $2) RETURNING *',
        [req.params.id,imageUrl]
    );

    res.json({
        message: 'Image uploaded successfully',
        image: result.rows[0],
    });
});

app.post('/posts/:id/comments',async (req,res)=>{
    const {id}=req.params;

    const {content}=req.body;

    const userId=req.session?.user?.userId;

    if(!userId){
        return res.status(401).json({error:'Unauthorized: Please log in first'});
    }

    if(!content || content.trim()===''){
        return req.status(400).json({error:'Comment content cannot be empty'});
    }

    try{
        const result=await pool.query(
            'Insert INTO comments (post_id,user_id,content) VALUES ($1,$2,$3) returning *',
            [id,userId,content]
        );

        res.json({
            message: 'Comment added successfully',
            comment: result.rows[0]
        });

    }catch(error){
        console.error('Error adding comment1: ',error);
        res.status(500).json({error: 'Failed to add comment'});
    }
});

app.get('/posts/:id/comments',async (req,res)=>{
    const {id}=req.params;

    try{
        // const result=await pool.query(
        //     `SELECT comments.content, comments.created_at, users.userid as username from comments from comments
        //     JOIN users ON comments.user_id=users.userid WHERE comments.post_id=$1 ORDER BY comments.created_at ASC`,
        //     [id]
        // );

        const result = await pool.query(`
            SELECT comments.content, comments.created_at, users.userid AS username 
            FROM comments 
            JOIN users ON comments.user_id = users.userid  -- Check if this is correct
            WHERE comments.post_id = $1 
            ORDER BY comments.created_at ASC
        `, [id]);
        
        res.json(result.rows);

    }catch(error){
        console.error('Error fetching comments: ',error);
        res.status(500).json({error: 'Failed to fetch comments'});
    }
});


const messages= [];

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
    if(!message || message.trim()===''){
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

app.delete('/messages',(req,res)=>{
    messages.length=0;
    res.json({success:true, message: 'All mssages deleted successfully!'});
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