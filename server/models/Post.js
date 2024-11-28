const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Please provide post content'],
        maxlength: [500, 'Post cannot be more than 500 characters']
    },
    image: {
        type: String
    },
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: [true, 'Please provide a comment'],
            maxlength: [200, 'Comment cannot be more than 200 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual field for like count
postSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Add virtual field for comment count
postSchema.virtual('commentCount').get(function() {
    return this.comments.length;
});

module.exports = mongoose.model('Post', postSchema);
