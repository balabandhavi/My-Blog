My-Blog

A full-stack blogging platform where users can sign up, log in, create posts, upload images, view others' posts, comment, and log out. Built using Node.js, Express, PostgreSQL, and Vanilla JavaScript.

Features

1. User Authentication (Sign up, Log in, Log out)

2. Create, Edit, Delete Posts

3. Save Posts as Drafts

4. Upload Images for Posts

5. View All Published Posts

6. Comment on Posts

7. Secure API with JWT Authentication

Tech Stack

1. Frontend: HTML, CSS, JavaScript

2. Backend: Node.js, Express.js

3. Database: PostgreSQL

4. Authentication: JWT (JSON Web Tokens)

5. File Uploads: Multer

Project Structure

my-blog/
 node_modules
 public/          # Frontend Files (HTML, CSS, JS)
 
   deletePost.js  #delete post functionality
   editPost.js    #edit post functionality
   explore.html   # View All Posts
   explore.js     # Fetch & Display Posts
   home.html      # User Dashboard
   home.js        # Home Page Logic
   index.html     # Landing Page
   login.html     # Login Page
   login.js       # login page logic
   logout.js      # Logout Functionality
   post.html      #post page
   posts.js       # Posts Handling
   script.js      # Main JS Functions
   signup.html    # Signup Page
   signup.js      #signup functionality
   styles.css     # Global Styles   
   
 uploads/         # Uploaded Images
 .gitignore       # Contains environment variables ans password
 bash.exe.stackdump 
 package-lock.json # Dependencies & Scripts
 package.json     # Dependencies & Scripts
 server.js        # Express Server & API
 README.md        # Project Documentation

 Setup Instructions

1. Clone the Repository

gh repo clone balabandhavi/My-Blog
cd my-blog

2. Install Dependencies

npm install

3. Set Up PostgreSQL Database

Create Database

CREATE DATABASE my_blog;

Manually Create Tables
Use a PostgreSQL client (like pgAdmin or psql CLI) and create necessary tables like users,posts, images, comments using SQL commands.

4. Configure .env File

Create a .env file in the root directory:

DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=my_blog
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_secret_key

5. Start the Server

npm start

or

nodemon server.js  # If using Nodemon

6. Access the App

Frontend: http://localhost:3000

API Endpoints: http://localhost:3000/api/...

API Endpoints

User Authentication

Method       Endpoint                Description

POST        /signup                  register a user
POST        /login                   user login 
POST        /logout                  logout user


Posts API

Method       Endpoint                Description

GET          /posts                  fetch all published posts
POST         /posts                  create and publish a post 
POST         /posts/draft            save post as draft
PUT          /posts/:id              edit a post
DELETE       /posts/:id              delete a post


Comments API

Method       Endpoint                Description

GET          /posts/:id/comments     get all comments
POST         /posts/:id/comments     add a comment


Screenshots

Landing Page
![image](https://github.com/user-attachments/assets/cf6b72ae-3684-4be9-a8b4-fc15e9cfdc8a)


Login Page
![image](https://github.com/user-attachments/assets/db90ffd4-196a-4563-ad57-613b1455eb29)



Signup Page
![image](https://github.com/user-attachments/assets/e40a11c1-9ba4-4a43-a8ea-32342067cfbb)

Home Page
![image](https://github.com/user-attachments/assets/787eb5ca-a394-4bb3-8955-c222485bdfeb)


Explore page
![image](https://github.com/user-attachments/assets/92fcf114-6faa-4bea-883d-0b3e8375593f)

![image](https://github.com/user-attachments/assets/f4f5b2f7-ebc3-4611-bfee-fcc3e93677da)



Future Improvements

1. Like & Share Posts

2. Rich Text Editor for Posts

3. Profile Page for Users

4. Admin Dashboard for Moderation

Contributors

Bala Bhandhavi Gajula

Open to contributions! Feel free to submit a pull request.





