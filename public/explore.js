async function fetchComments(postId) {
    try {
        const response = await fetch(`/posts/${postId}/comments`);

        if (!response.ok) {
            throw new Error('Failed to fetch comments. Server responded with an error.');
        }

        const comments = await response.json();
        const commentsList = document.getElementById(`comments-list-${postId}`);

        commentsList.innerHTML = '';  

        comments.forEach(comment => {
            const li = document.createElement('li');
            li.textContent = `${comment.username}: ${comment.content}`;
            commentsList.appendChild(li);
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
        alert('Could not update comments. Please refresh the page.');  
    }
}


async function likePost(postId){
    try{
        const response=await fetch(`/posts/${postId}/like`,{method: 'POST'});
        const data=await response.json();

        if(response.ok){
            document.getElementById(`likes-count-${postId}`).textContent=data.likes;

        }else{
            alert(data.error || 'Failed to like post.');
        }
    }catch(error){
        console.error('Error liking post: ',error);
        alert('Failed to like post.');
    }
}




document.addEventListener('DOMContentLoaded', async () => {
    const postsContainer = document.getElementById('posts-container');

    async function fetchPosts() {
        try {
            const response = await fetch('/posts');
            const posts = await response.json();

            if (posts.length === 0) {
                postsContainer.innerHTML = '<p> No posts available.</p>';
                return;
            }

            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post');

                postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p><strong> By ${post.username}</strong></p>
                <p> ${post.content}</p>
                ${post.image_url ? `<img src="${post.image_url}" alt="Post Image">` : ''}

                <p><strong> Likes: <span id="likes-count-${post.id}"> ${post.likes}</span></strong></p>
                <button onclick="likePost(${post.id})">Like</button>
                <button class="bookmark-btn" data-post-id="${post.id}"> Bookmark</button>
                <div class="comments-section">
                    <h3>Comments</h3>
                    <ul id="comments-list-${post.id}"></ul>
                    <textarea id="comment-content-${post.id}" placeholder="Write a comment..."></textarea>
                    <button onclick="submitComment(${post.id})">Submit Comment</button>
                </div>
                <hr>`;

                postsContainer.appendChild(postElement);

                fetchComments(post.id);
                addBookMarkListeners();
            });
        } catch (error) {
            console.error('Error fetching posts:', error);
            postsContainer.innerHTML = '<p> Failed to load posts.</p>';
        }    
    }

    async function toggleBookMark(postId,button){
        try{
            const isBookmarked=button.classList.contains('bookmarked');

            const response=await fetch(`/bookmarks/${postId}`,{
                method : isBookmarked ? 'DELETE' : 'POST',
                credentials: 'include',
            });

            if(response.ok){
                button.classList.toggle('bookmarked');
                button.textContent=isBookmarked? 'Bookmark' : 'Bookmarked';
            }else{
                alert('Failed to update bookmark status.');
            }
        }catch(error){
            console.error('Error toggling bookmark: ',error);
        }
    }

    function addBookMarkListeners(){
        document.querySelectorAll('.bookmark-btn').forEach(button=>{
            button.addEventListener('click', ()=>{
                const postId=button.getAttribute('data-post-id');
                toggleBookMark(postId,button);
            });
        });
    }

    fetchPosts();  
});


async function submitComment(postId) {
    const textarea = document.getElementById(`comment-content-${postId}`);
    if (!textarea) {
        console.error(`Textarea not found for post ID ${postId}`);
        return;
    }

    const content = textarea.value.trim();
    if (!content) {
        alert('Comment cannot be empty!');
        return;
    }

    try {
        const response = await fetch(`/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });
    
        const data = await response.json();  
    
        if (response.ok) {  
            alert('Comment added successfully!');
            textarea.value = '';  
            fetchComments(postId);  
        } else {
            console.error('Server error:', data);  
            alert(data.error || 'Failed to add comment.');
        }
    } catch (error) {
        console.error('Network error:', error);  
        alert('Failed to add comment. Please try again.');
    }
    
}
