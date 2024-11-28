// Post data structure
class Post {
    constructor(id, author, content, imageUrl, timestamp) {
        this.id = id;
        this.author = author;
        this.content = content;
        this.imageUrl = imageUrl;
        this.timestamp = timestamp;
        this.likes = 0;
        this.comments = [];
    }
}

// Store posts in localStorage for now (later can be moved to backend)
const POSTS_STORAGE_KEY = 'specyf_posts';

// Post management functions
const PostManager = {
    getPosts() {
        const posts = localStorage.getItem(POSTS_STORAGE_KEY);
        return posts ? JSON.parse(posts) : [];
    },

    savePost(post) {
        const posts = this.getPosts();
        posts.unshift(post); // Add new post at the beginning
        localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
        return post;
    },

    likePost(postId) {
        const posts = this.getPosts();
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.likes++;
            localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
        }
        return post?.likes || 0;
    },

    addComment(postId, comment) {
        const posts = this.getPosts();
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments.push({
                id: Date.now(),
                author: JSON.parse(localStorage.getItem('currentUser')),
                content: comment,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
        }
        return post?.comments || [];
    }
};

// UI Functions
function createPostElement(post) {
    const timeAgo = moment(post.timestamp).fromNow();
    
    return `
        <div class="post" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${post.author.picture || 'assets/default-avatar.png'}" alt="${post.author.name}" class="post-avatar">
                <div class="post-info">
                    <h3 class="post-author">${post.author.name}</h3>
                    <span class="post-time">${timeAgo}</span>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" class="post-image">` : ''}
            </div>
            <div class="post-actions">
                <button onclick="handleLike('${post.id}')" class="action-btn">
                    <i class="far fa-heart"></i>
                    <span class="likes-count">${post.likes}</span>
                </button>
                <button onclick="toggleComments('${post.id}')" class="action-btn">
                    <i class="far fa-comment"></i>
                    <span class="comments-count">${post.comments.length}</span>
                </button>
            </div>
            <div class="comments-section" id="comments-${post.id}" style="display: none;">
                <div class="comments-list">
                    ${post.comments.map(comment => `
                        <div class="comment">
                            <img src="${comment.author.picture || 'assets/default-avatar.png'}" alt="${comment.author.name}" class="comment-avatar">
                            <div class="comment-content">
                                <h4>${comment.author.name}</h4>
                                <p>${comment.content}</p>
                                <span class="comment-time">${moment(comment.timestamp).fromNow()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="comment-input">
                    <input type="text" placeholder="Write a comment..." id="comment-input-${post.id}">
                    <button onclick="submitComment('${post.id}')">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Event Handlers
function handlePostSubmit(event) {
    event.preventDefault();
    
    const content = document.getElementById('post-content').value;
    const imageInput = document.getElementById('post-image');
    const imageFile = imageInput.files[0];
    
    if (!content && !imageFile) {
        showError('Please add some content or an image to post');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (imageFile) {
        // Convert image to base64 for storage
        const reader = new FileReader();
        reader.onload = function(e) {
            const post = new Post(
                Date.now(),
                currentUser,
                content,
                e.target.result,
                new Date().toISOString()
            );
            
            PostManager.savePost(post);
            refreshFeed();
            resetPostForm();
        };
        reader.readAsDataURL(imageFile);
    } else {
        const post = new Post(
            Date.now(),
            currentUser,
            content,
            null,
            new Date().toISOString()
        );
        
        PostManager.savePost(post);
        refreshFeed();
        resetPostForm();
    }
}

function handleLike(postId) {
    const newLikes = PostManager.likePost(postId);
    const likesCount = document.querySelector(`[data-post-id="${postId}"] .likes-count`);
    if (likesCount) {
        likesCount.textContent = newLikes;
    }
}

function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    }
}

function submitComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const comment = input.value.trim();
    
    if (comment) {
        PostManager.addComment(postId, comment);
        refreshFeed();
        input.value = '';
    }
}

function refreshFeed() {
    const feed = document.getElementById('post-feed');
    const posts = PostManager.getPosts();
    feed.innerHTML = posts.map(post => createPostElement(post)).join('');
}

function resetPostForm() {
    document.getElementById('post-content').value = '';
    document.getElementById('post-image').value = '';
    document.getElementById('image-preview').style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    refreshFeed();
});
