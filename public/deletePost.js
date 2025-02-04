
document.addEventListener('DOMContentLoaded',()=>{
    const postId=getQueryParam('id');

    async function deletePost(){
        try{
            const reponse =await fetch(`/posts/${postId}`,{
                method: 'DELETE'
            });

            if(response.ok){
                alert('Post deleted successfully');
                window.location.href='/home.html';
            }else{
                alert('Failed to delete post.TRy again.');
            }
        }catch(error){
            console.error('Error deleting post: ',error);
        }
    }

    document.getElementById('deletePostButton').addEventListener('click',deletePost);
});