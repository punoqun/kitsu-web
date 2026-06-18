import { type ImageSource } from '@/components/content/Image';
import { Link, type To } from '@/components/content/Link';
import PosterImage from '@/components/content/PosterImage';

import styles from './styles.module.css';

export type MediaPosterCardProps = {
  posterImage?: ImageSource | null;
  title: string;
  to: To;
};

export default function MediaPosterCard({
  posterImage,
  title,
  to,
}: MediaPosterCardProps) {
  return (
    <Link className={styles.card} to={to}>
      <PosterImage
        alt={title}
        className={styles.poster}
        source={posterImage}
        width={120}
      />
      <span className={styles.title}>{title}</span>
    </Link>
  );
}
