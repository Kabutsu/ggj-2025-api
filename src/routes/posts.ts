import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

export type User = {
  id: number;
  name: string;
  username: string;
  sentiment: number;
};

export type Comment = {
  id: number;
  postId: number;
  body: string;
};

export type Post = {
  id: number;
  user: User;
  body: string;
  likes: number;
  dislikes: number;
  comments: Array<Comment>;
};

// In-memory data store
const users: Array<User> = [
  {
    id: 1,
    name: 'John Doe',
    username: 'john_doe',
    sentiment: 0,
  },
  {
    id: 2,
    name: 'Jane Doe',
    username: 'jane_doe',
    sentiment: 0,
  },
];

const comments: Array<Comment> = [
  {
    id: 1,
    postId: 1,
    body: 'This is a comment',
  },
  {
    id: 2,
    postId: 1,
    body: 'This is another comment',
  },
];

const posts: Array<Post> = [
  {
    id: 1,
    user: users[0],
    body: 'This is a post',
    likes: 0,
    dislikes: 0,
    comments: [comments[0], comments[1]],
  },
];

/* GET posts listing. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.json(posts);
});

/* GET post by ID. */
router.get('/:id', function(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((post) => post.id === id);

  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

/* POST create a new post. */
router.post('/', function(req: Request, res: Response, next: NextFunction) {
  const { user, body } = req.body;
  const post: Post = {
    id: posts.length + 1,
    user,
    body,
    likes: 0,
    dislikes: 0,
    comments: [],
  };

  posts.push(post);

  res.status(201).json(post);
});

/* PUT update a post by ID. */
router.put('/:id', function(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((post) => post.id === id);

  if (post) {
    const { body } = req.body;

    post.body = body;

    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

/* DELETE delete a post by ID. */
router.delete('/:id', function(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id, 10);
  const index = posts.findIndex((post) => post.id === id);

  if (index !== -1) {
    posts.splice(index, 1);

    res.json({ message: 'Post deleted' });
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

/* POST like a post by ID. */
router.post('/:id/like', function(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((post) => post.id === id);

  if (post) {
    post.likes += 1;

    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

/* POST unlike a post by ID. */
router.post('/:id/unlike', function(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((post) => post.id === id);

  if (post) {
    post.likes -= 1;

    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

/* POST dislike a post by ID. */
router.post('/:id/dislike', function(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((post) => post.id === id);

  if (post) {
    post.dislikes += 1;

    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

/* POST undislike a post by ID. */
router.post('/:id/undislike', function(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((post) => post.id === id);

  if (post) {
    post.dislikes -= 1;

    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

/* POST create a new comment for a post by ID. */
router.post('/:id/comments', function(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((post) => post.id === id);

  if (post) {
    const { body } = req.body;
    const comment: Comment = {
      id: comments.length + 1,
      postId: id,
      body,
    };

    comments.push(comment);
    post.comments.push(comment);

    res.status(201).json(comment);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

/* DELETE delete a comment by ID. */
router.delete('/:postId/comments/:commentId', function(req: Request, res: Response, next: NextFunction) {
  const postId = parseInt(req.params.postId, 10);
  const commentId = parseInt(req.params.commentId, 10);
  const post = posts.find((post) => post.id === postId);
  const index = comments.findIndex((comment) => comment.id === commentId);

  if (post && index !== -1) {
    comments.splice(index, 1);
    post.comments = post.comments.filter((comment) => comment.id !== commentId);

    res.json({ message: 'Comment deleted' });
  } else {
    res.status(404).json({ message: 'Comment not found' });
  }
});


export default router;