// API endpoints
const API_URL = 'https://example.com/api';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Get all posts
async function getPosts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.posts;
        } else {
            console.error('Failed to fetch posts:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

// Create a new post
async function createPost(content, image = null) {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }
        
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.post;
        } else {
            throw new Error(data.message || 'Failed to create post');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

// Like a post
async function likePost(postId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to like post');
        }
        
        return data.likes;
    } catch (error) {
        console.error('Error liking post:', error);
        throw error;
    }
}

// Add comment to a post
async function addComment(postId, content) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to add comment');
        }
        
        return data.comment;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
}

// Delete a post
async function deletePost(postId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete post');
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
}

// Create post HTML element
function createPostElement(post) {
    const currentUserId = localStorage.getItem('userId');
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.id = `post-${post._id}`;
    
    const postContent = `
        <div class="post-header">
            <img src="${post.user.avatar || '/images/default-avatar.png'}" alt="Profile" class="profile-pic">
            <div class="post-info">
                <h3>${post.user.name}</h3>
                <span class="timestamp">${new Date(post.createdAt).toLocaleString()}</span>
            </div>
            ${post.user._id === currentUserId ? 
                `<button class="delete-btn" onclick="handleDeletePost('${post._id}')">Delete</button>` : 
                ''
            }
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
        </div>
        <div class="post-actions">
            <button class="like-btn ${post.likes.includes(currentUserId) ? 'liked' : ''}" 
                    onclick="handleLikePost('${post._id}')">
                <i class="fas fa-heart"></i> ${post.likes.length}
            </button>
            <button class="comment-btn" onclick="toggleCommentForm('${post._id}')">
                <i class="fas fa-comment"></i> ${post.comments.length}
            </button>
        </div>
        <div class="comments" id="comments-${post._id}">
            ${post.comments.map(comment => `
                <div class="comment">
                    <img src="${comment.user.avatar || '/images/default-avatar.png'}" alt="Profile" class="comment-profile-pic">
                    <div class="comment-content">
                        <h4>${comment.user.name}</h4>
                        <p>${comment.content}</p>
                        <span class="timestamp">${new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="comment-form" id="comment-form-${post._id}" style="display: none;">
            <textarea placeholder="Write a comment..." id="comment-input-${post._id}"></textarea>
            <button onclick="handleAddComment('${post._id}')">Comment</button>
        </div>
    `;
    
    postElement.innerHTML = postContent;
    return postElement;
}

// Handle form submission for creating a post
async function handleCreatePost(event) {
    event.preventDefault();
    
    const content = document.getElementById('post-content').value;
    const imageInput = document.getElementById('post-image');
    const image = imageInput.files[0];
    
    try {
        const post = await createPost(content, image);
        const postElement = createPostElement(post);
        const postsContainer = document.getElementById('posts-container');
        postsContainer.insertBefore(postElement, postsContainer.firstChild);
        
        // Clear form
        document.getElementById('post-content').value = '';
        imageInput.value = '';
        document.getElementById('image-preview').style.display = 'none';
    } catch (error) {
        alert(error.message || 'Failed to create post');
    }
}

// Handle like button click
async function handleLikePost(postId) {
    try {
        const likes = await likePost(postId);
        const likeBtn = document.querySelector(`#post-${postId} .like-btn`);
        const currentUserId = localStorage.getItem('userId');
        
        likeBtn.innerHTML = `<i class="fas fa-heart"></i> ${likes.length}`;
        if (likes.includes(currentUserId)) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
    } catch (error) {
        alert(error.message || 'Failed to like post');
    }
}

// Handle comment form submission
async function handleAddComment(postId) {
    const content = document.getElementById(`comment-input-${postId}`).value;
    
    try {
        const comment = await addComment(postId, content);
        const commentsContainer = document.getElementById(`comments-${postId}`);
        
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <img src="${comment.user.avatar || '/images/default-avatar.png'}" alt="Profile" class="comment-profile-pic">
            <div class="comment-content">
                <h4>${comment.user.name}</h4>
                <p>${comment.content}</p>
                <span class="timestamp">${new Date(comment.createdAt).toLocaleString()}</span>
            </div>
        `;
        
        commentsContainer.appendChild(commentElement);
        document.getElementById(`comment-input-${postId}`).value = '';
        
        // Update comment count
        const commentBtn = document.querySelector(`#post-${postId} .comment-btn`);
        const currentCount = parseInt(commentBtn.textContent.trim());
        commentBtn.innerHTML = `<i class="fas fa-comment"></i> ${currentCount + 1}`;
    } catch (error) {
        alert(error.message || 'Failed to add comment');
    }
}

// Handle delete post
async function handleDeletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        try {
            await deletePost(postId);
            const postElement = document.getElementById(`post-${postId}`);
            postElement.remove();
        } catch (error) {
            alert(error.message || 'Failed to delete post');
        }
    }
}

// Toggle comment form visibility
function toggleCommentForm(postId) {
    const commentForm = document.getElementById(`comment-form-${postId}`);
    commentForm.style.display = commentForm.style.display === 'none' ? 'block' : 'none';
}

// Preview image before upload
function previewImage(input) {
    const preview = document.getElementById('image-preview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.style.display = 'none';
    }
}

// Initialize posts on page load
async function initializePosts() {
    const posts = await getPosts();
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', handleCreatePost);
    }
    
    const imageInput = document.getElementById('post-image');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            previewImage(this);
        });
    }
    
    initializePosts();
});
