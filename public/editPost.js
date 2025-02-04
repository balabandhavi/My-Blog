
document.addEventListener('DOMContentLoaded',()=>{

    const postId=getQueryParam('id');
    const postForm=document.getElementById('postForm');
    const saveDraftButton=document.getElementById('saveDraft');
    const publishButton=document.getElementById('publishPost');

    async function fetchPost(){
        try{
            const response=await fetch(`/posts/${postId}`);

            if(!response.ok){
                alert('Failed to fetch post details');
                return ;
            }

            const post=await response.json();

            document.getElementById('title').value=post.title;
            document.getElementById('content').value=post.content;
        }catch(error){

            console.error('Error fetching post: ',error);
        }
    }

    async function updatePost(status){
        const title=document.getElementById('title').value;
        const content=document.getElementById('content').value;
        const imageFile=document.getElementById('image').files[0];

        if(!title || !content){
            alert('Title and content are required!');
            return ;
        }

        let imageUrl='';

        if(imageFile){
            imageUrl=await uploadImage(imageFile,postId);

            if(!imageUrl){
                alert('Image upload failed. Try again.');
                return ;
            }
        }

        const postData={
            title,
            content,
            image: imageUrl,
            status
        };

        try{
            const response=await fetch(`/posts/${postId}`,{
                method: 'PUT',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if(response.ok){
                alert(`Post ${status==='draft'? 'saved as draft': 'published'} successfully!`);
                window.location.href='/home.html';
            }else{
                alert('Failed to update post. Try again.');
            }
        }catch(error){
            console.error('Error updating post: ',error);
        }
    }

    saveDraftButton.addEventListener('click',()=> updatePost('draft'));

    publishButton.addEventListener('click',(e)=>{
        e.preventDefault();
        updatePost('published');
    });

    fetchPost();
});