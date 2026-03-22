import type { D1Database } from '@cloudflare/workers-types';
import { UserRepository } from '../repositories/user.repository';
import { LeaderRepository } from '../repositories/leader.repository';
import { EntrepreneurRepository } from '../repositories/entrepreneur.repository';
import { CauseRepository } from '../repositories/cause.repository';
import { ProductRepository } from '../repositories/product.repository';
import { CauseUpdateRepository } from '../repositories/cause-update.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { FeedRepository } from '../repositories/feed.repository';
import { PostRepository } from '../repositories/post.repository';
import { AuthService } from '../services/auth.service';
import { FeedService } from '../services/feed.service';
import { LeaderService } from '../services/leader.service';
import { ProductService } from '../services/product.service';
import { CauseUpdateService } from '../services/cause-update.service';
import { CauseService } from '../services/cause.service';
import { EntrepreneurService } from '../services/entrepreneur.service';
import { PostService } from '../services/post.service';

export interface Services {
  auth: AuthService;
  feed: FeedService;
  leader: LeaderService;
  product: ProductService;
  causeUpdate: CauseUpdateService;
  cause: CauseService;
  entrepreneur: EntrepreneurService;
  post: PostService;
}

export interface Repositories {
  user: UserRepository;
  leader: LeaderRepository;
  entrepreneur: EntrepreneurRepository;
  cause: CauseRepository;
  product: ProductRepository;
  causeUpdate: CauseUpdateRepository;
  transaction: TransactionRepository;
  feed: FeedRepository;
  post: PostRepository;
}

export function createRepositories(db: D1Database): Repositories {
  return {
    user: new UserRepository(db),
    leader: new LeaderRepository(db),
    entrepreneur: new EntrepreneurRepository(db),
    cause: new CauseRepository(db),
    product: new ProductRepository(db),
    causeUpdate: new CauseUpdateRepository(db),
    transaction: new TransactionRepository(db),
    feed: new FeedRepository(db),
    post: new PostRepository(db),
  };
}

export function createServices(env: { DB: D1Database; JWT_SECRET: string }): Services {
  const repos = createRepositories(env.DB);

  const auth = new AuthService(repos.user, repos.leader, repos.entrepreneur, env.JWT_SECRET);
  const feed = new FeedService(repos.feed);
  const leader = new LeaderService(repos.leader);
  const product = new ProductService(repos.product);
  const causeUpdate = new CauseUpdateService(repos.causeUpdate, repos.cause, repos.leader);
  const cause = new CauseService(repos.cause, repos.leader);
  const entrepreneur = new EntrepreneurService(repos.entrepreneur);
  const post = new PostService(repos.post);

  return { auth, feed, leader, product, causeUpdate, cause, entrepreneur, post };
}
