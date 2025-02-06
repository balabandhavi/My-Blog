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

                <div class="comments-section">
                    <h3>Comments</h3>
                    <ul id="comments-list-${post.id}"></ul>
                    <textarea id="comment-content-${post.id}" placeholder="Write a comment..."></textarea>
                    <button onclick="submitComment(${post.id})">Submit Comment</button>
                </div>
                <hr>`;

                postsContainer.appendChild(postElement);

                fetchComments(post.id);
            });
        } catch (error) {
            console.error('Error fetching posts:', error);
            postsContainer.innerHTML = '<p> Failed to load posts.</p>';
        }
    }

    async function fetchComments(postId) {
        try {
            const response = await fetch(`/posts/${postId}/comments`);
            const comments = await response.json();
            const commentsList = document.getElementById(`comments-list-${postId}`);

            commentsList.innerHTML = '';
            comments.forEach(comment => {
                const li = document.createElement('li');
                li.textContent = `${comment.username}: ${comment.content}`;
                commentsList.appendChild(li);
            });

        } catch (error) {
            console.error('Error fetching comments: ', error);
        }
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

        const data=await response.json();

        if (response.ok) {
            alert('Comment added successfully!');
            textarea.value = '';  
            fetchComments(postId);  
        } else {
            alert(data.error || 'Failed to add comment');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment');
    }
}
