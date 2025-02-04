document.addEventListener('DOMContentLoaded',()=>{
    const postForm=document.getElementById('postForm');
    const saveDraftButton=document.getElementById('saveDraft');
    const publishButton=document.getElementById('publishPost');

    async function uploadImage(file,postId){
        const formData=new FormData();
        formData.append('image',file);

        try{
            const response=await fetch(`/posts/${postId}/image`,{
                method: 'POST',
                body: formData
            });

            if(!response.ok){
                throw new Error('Image upload failed');
            }

            const data=await response.json();
            return data.image.image_url;
        }catch(error){
            console.error('Error uploading image: ',error);
            return null;
        }
    }

    async function submitPost(status){
        const title=document.getElementById('title').value;
        const content=document.getElementById('content').value;
        const imageFile=document.getElementById('image').files[0];

        if(!title || !content){

            alert('Title and content are required!');

            return;
        }


        try{
            const response=await fetch('/posts',{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({title,content,status})
            });

            if(!response.ok){

                alert('Failed to save post.Try again. ');
                return;
            }

            const postData=await response.json();

            const postId=postData.post.id;

            let imageUrl='';

            if(imageFile){

                imageUrl=await uploadImage(imageFile,postId);

                if(!imageUrl){
                    alert('Image upload failed.Try again.');
                    return;
                }
            }

            alert(`Post ${status === 'draft' ? 'saved as draft': 'published'} successfully!`);
            window.location.href='/home.html';
            
        }catch(error){
            console.error('Error saving post: ',error);
        }
        
    }

    saveDraftButton.addEventListener('click',()=>submitPost('draft'));
    publishButton.addEventListener('click',(e)=>{
        e.preventDefault();
        submitPost('published');
    });
});