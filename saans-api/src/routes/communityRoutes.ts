import express, { Router } from 'express';
import communityController from '../controllers/communityController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';

const router: Router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken, isAuthenticated);

// =============== GROUP ROUTES ===============

// Get all community groups
router.get('/groups', (req, res, next) => communityController.getAllGroups(req, res, next));

// Get single group by ID
router.get('/groups/:groupId', (req, res, next) => communityController.getGroup(req, res, next));

// Join a community group
router.post('/groups/:groupId/join', (req, res, next) => communityController.joinGroup(req, res, next));

// Leave a community group
router.post('/groups/:groupId/leave', (req, res, next) => communityController.leaveGroup(req, res, next));

// =============== POST ROUTES ===============

// Get all posts (optionally filtered by category)
router.get('/posts', (req, res, next) => communityController.getAllPosts(req, res, next));

// Get single post
router.get('/posts/:postId', (req, res, next) => communityController.getPost(req, res, next));

// Get posts for a specific group
router.get('/groups/:groupId/posts', (req, res, next) => communityController.getGroupPosts(req, res, next));

// Create a post in a group
router.post('/groups/:groupId/posts', (req, res, next) => communityController.createPost(req, res, next));

// Like/unlike a post
router.post('/posts/:postId/like', (req, res, next) => communityController.toggleLike(req, res, next));

// =============== COMMENT ROUTES ===============

// Get comments for a post
router.get('/posts/:postId/comments', (req, res, next) => communityController.getPostComments(req, res, next));

// Add a comment to a post
router.post('/posts/:postId/comments', (req, res, next) => communityController.addComment(req, res, next));

// Like/unlike a comment
router.post('/comments/:commentId/like', (req, res, next) => communityController.toggleCommentLike(req, res, next));

export default router;
