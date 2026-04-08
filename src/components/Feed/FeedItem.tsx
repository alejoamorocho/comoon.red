import type { FeedItem } from '../../types/feed';
import ProductFeedCard from './ProductFeedCard';
import CauseFeedCard from './CauseFeedCard';
import CauseUpdateFeedCard from './CauseUpdateFeedCard';

interface FeedItemProps {
  item: FeedItem;
}

export default function FeedItemComponent({ item }: FeedItemProps) {
  switch (item.type) {
    case 'product':
      return <ProductFeedCard product={item} />;
    case 'cause':
      return <CauseFeedCard cause={item} />;
    case 'cause_update':
      return <CauseUpdateFeedCard update={item} />;
    default:
      return null;
  }
}
