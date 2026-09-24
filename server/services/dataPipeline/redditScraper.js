const axios = require('axios');
const logger = require('../../utils/logger');
const CommunityPost = require('../../models/CommunityPost');

const REDDIT_API_URL = 'https://www.reddit.com';
const MENTAL_HEALTH_SUBREDDITS = [
  'mentalhealth',
  'depression',
  'anxiety',
  'CPTSD',
  'ptsd',
  'selfhelp',
  'Psychology',
  'therapy',
  'CasualConversation',
  'offmychest',
  'TrueOffMyChest'
];

class RedditScraper {
  constructor() {
    this.userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  async fetchMentalHealthPosts() {
    logger.info('Starting Reddit scrape for mental health posts');
    const allPosts = [];

    for (const subreddit of MENTAL_HEALTH_SUBREDDITS) {
      try {
        const posts = await this.fetchSubredditPosts(subreddit);
        allPosts.push(...posts);
        logger.info(`Fetched ${posts.length} posts from r/${subreddit}`);
      } catch (error) {
        logger.error(`Error fetching r/${subreddit}:`, { error: error.message });
      }
    }

    return allPosts;
  }

  async fetchSubredditPosts(subreddit) {
    const url = `${REDDIT_API_URL}/r/${subreddit}/new.json?limit=50`;

    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const posts = response.data.data.children.map((child) => {
        const post = child.data;
        return {
          title: post.title,
          content: post.selftext,
          author: post.author,
          externalId: post.id,
          subreddit: post.subreddit,
          upvotes: post.ups,
          comments: post.num_comments,
          url: `https://reddit.com${post.permalink}`,
          createdAt: new Date(post.created_utc * 1000),
          category: this.categorizePost(post.title, post.selftext),
          tags: this.extractTags(post.title),
          source: 'reddit'
        };
      });

      return posts;
    } catch (error) {
      logger.error(`Failed to fetch from r/${subreddit}:`, { error: error.message });
      throw error;
    }
  }

  categorizePost(title, content) {
    const text = (title + ' ' + content).toLowerCase();

    if (text.match(/depression|depressed|depressive|bipolar/i)) return 'depression';
    if (text.match(/anxiety|anxious|panic|phobia/i)) return 'anxiety';
    if (text.match(/sleep|insomnia|insomniac|nightmare/i)) return 'sleep';
    if (text.match(/relationship|love|breakup|divorce|marriage/i)) return 'relationships';
    if (text.match(/work|job|career|boss|workplace/i)) return 'work';
    if (text.match(/trauma|ptsd|abuse|assault/i)) return 'trauma';
    if (text.match(/grief|loss|death|mourning/i)) return 'grief';
    if (text.match(/addiction|substance|alcohol|drug/i)) return 'addiction';
    if (text.match(/eat|food|body|weight|anorexia|bulimia/i)) return 'eating-disorders';
    if (text.match(/stress|anxious|overwhelm|pressure/i)) return 'stress';
    if (text.match(/self.esteem|confidence|worth|insecurity/i)) return 'self-esteem';
    if (text.match(/parent|child|kid|family/i)) return 'parenting';

    return 'general';
  }

  extractTags(title) {
    return title
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 5);
  }

  async syncPostsToDB(posts) {
    logger.info(`Syncing ${posts.length} posts to database`);
    let created = 0;
    let updated = 0;

    for (const post of posts) {
      try {
        const existingPost = await CommunityPost.findOne({
          'externalSource.postId': post.externalId
        });

        if (existingPost) {
          await CommunityPost.findByIdAndUpdate(existingPost._id, {
            'engagement.upvotes': post.upvotes,
            'engagement.comments': post.comments,
            updatedAt: new Date()
          });
          updated++;
        } else {
          const newPost = new CommunityPost({
            title: post.title,
            content: post.content,
            category: post.category,
            tags: post.tags,
            source: 'reddit',
            externalSource: {
              platform: 'reddit',
              postId: post.externalId,
              url: post.url,
              author: post.author
            },
            engagement: {
              upvotes: post.upvotes,
              comments: post.comments
            },
            createdAt: post.createdAt,
            status: 'published',
            isVerified: false
          });

          // Find a related user ID (or leave empty for Reddit posts)
          newPost.userId = null; // Will be handled by separate logic

          await newPost.save();
          created++;
        }
      } catch (error) {
        logger.error('Error syncing post to DB:', { error: error.message, postId: post.externalId });
      }
    }

    logger.info(`Sync complete: Created ${created}, Updated ${updated}`);
    return { created, updated };
  }

  async runFullSync() {
    try {
      logger.info('Starting full Reddit sync');
      const posts = await this.fetchMentalHealthPosts();
      const result = await this.syncPostsToDB(posts);
      logger.info('Reddit sync completed successfully', result);
      return result;
    } catch (error) {
      logger.error('Reddit sync failed:', { error: error.message });
      throw error;
    }
  }
}

module.exports = new RedditScraper();
