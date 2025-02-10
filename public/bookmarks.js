document.addEventListener('DOMContentLoaded',async ()=>{

    const bookmarksContainer=document.getElementById('bookmarked-posts');

    async function fetchBookmarks(){
        try{
            const response=await fetch('/bookmarks');
            const posts=await response.json();

            if(posts.length===0){
                bookmarksContainer.innerHTML='<p> You have no bookmarked posts.</p>';
                return ;
            }

            posts.forEach(post=>{
                const postElement=document.createElement('div');
                postElement.classList.add('post');

                postElement.innerHTML=`
                <h2> ${post.title}</h2>
                <p><strong> By ${post.username}</strong></p>
                <p> ${post.content}</p>
                ${post.image_url ? `<img src-"${post.image_url}" alt="Post Image">` : ''}
                <button class="remove-bookmark" data-post-id="${post.id}"> Remove Bookmark </button>
                <hr>`;

                bookmarksContainer.appendChild(postElement);
            });

            document.querySelectorAll('.remove-bookmark').forEach(button=>{
                button.addEventListener('click',async ()=>{
                    const postId=button.getAttribute('data-post-id');
                    await fetch(`/bookmarks/${postId}`,{method: 'DELETE'});
                    fetchBookmarks();
                });
            });
        }catch(error){
            console.error('Error fetching bookmarks: ',error);
        }
    }

    fetchBookmarks();
});