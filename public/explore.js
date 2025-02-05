
document.addEventListener('DOMContentLoaded',async()=>{

    const postsContainer=document.getElementById('posts-container');

    async function fetchPosts(){
        try{
            const response=await fetch('/posts');
            const posts =await response.json();

            if(posts.length===0){
                postsContainer.innerHTML='<p> No posts available.</p>';
                return;
            }

            posts.forEach(post=>{
                const postElement=document.createElement('div');
                postElement.classList.add('post');

                postElement.innerHTML=`
                <h2>${post.title}</h2>
                <p><strong> By ${post.username}</strong></p>
                <p> ${post.content}</p>
                ${post.image_url? `<img src="${post.image_url}" alt="Post Image">`: ''}
                <hr>`;

                postsContainer.appendChild(postElement);
            });
        }catch(error){
            console.error('Error fetching posts:',error);
            postsContainer.innerHTML='<p> Failed to load posts.</p>';
        }
    }

    fetchPosts();
});