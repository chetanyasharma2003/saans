import express, { Router } from 'express';
import communityController from '../controllers/communityController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';

const router: Router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken, isAuthenticated);

/**
 * @swagger
 * /api/community/groups:
 *   get:
 *     summary: Get all community groups
 *     description: Get list of available community groups for joining
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Groups retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/groups', (req, res, next) => communityController.getAllGroups(req, res, next));

/**
 * @swagger
 * /api/community/groups/{groupId}:
 *   get:
 *     summary: Get group details
 *     description: Get detailed information about a community group
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Group details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CommunityGroup'
 *       404:
 *         description: Group not found
 */
router.get('/groups/:groupId', (req, res, next) => communityController.getGroup(req, res, next));

/**
 * @swagger
 * /api/community/groups/{groupId}/join:
 *   post:
 *     summary: Join a community group
 *     description: Join an existing community group
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Successfully joined group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/groups/:groupId/join', (req, res, next) => communityController.joinGroup(req, res, next));

/**
 * @swagger
 * /api/community/groups/{groupId}/leave:
 *   post:
 *     summary: Leave a community group
 *     description: Leave a community group you've joined
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Successfully left group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/groups/:groupId/leave', (req, res, next) => communityController.leaveGroup(req, res, next));

/**
 * @swagger
 * /api/community/posts:
 *   get:
 *     summary: Get all community posts
 *     description: Get feed of all community posts with optional filtering
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Posts retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/posts', (req, res, next) => communityController.getAllPosts(req, res, next));

/**
 * @swagger
 * /api/community/posts/{postId}:
 *   get:
 *     summary: Get post details
 *     description: Get detailed information about a community post
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CommunityPost'
 */
router.get('/posts/:postId', (req, res, next) => communityController.getPost(req, res, next));

/**
 * @swagger
 * /api/community/groups/{groupId}/posts:
 *   get:
 *     summary: Get posts in a group
 *     description: Get all posts in a specific community group
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Group posts retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/groups/:groupId/posts', (req, res, next) => communityController.getGroupPosts(req, res, next));

/**
 * @swagger
 * /api/community/groups/{groupId}/posts:
 *   post:
 *     summary: Create a post in group
 *     description: Create a new post in a community group
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CommunityPost'
 */
router.post('/groups/:groupId/posts', (req, res, next) => communityController.createPost(req, res, next));

/**
 * @swagger
 * /api/community/posts/{postId}/like:
 *   post:
 *     summary: Toggle like on post
 *     description: Like or unlike a community post
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                     likeCount:
 *                       type: integer
 */
router.post('/posts/:postId/like', (req, res, next) => communityController.toggleLike(req, res, next));

/**
 * @swagger
 * /api/community/posts/{postId}/comments:
 *   get:
 *     summary: Get post comments
 *     description: Get all comments on a community post
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Comments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/posts/:postId/comments', (req, res, next) => communityController.getPostComments(req, res, next));

/**
 * @swagger
 * /api/community/posts/{postId}/comments:
 *   post:
 *     summary: Add comment to post
 *     description: Add a comment to a community post
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 */
router.post('/posts/:postId/comments', (req, res, next) => communityController.addComment(req, res, next));

/**
 * @swagger
 * /api/community/comments/{commentId}/like:
 *   post:
 *     summary: Toggle like on comment
 *     description: Like or unlike a comment
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                     likeCount:
 *                       type: integer
 */
router.post('/comments/:commentId/like', (req, res, next) => communityController.toggleCommentLike(req, res, next));

export default router;
