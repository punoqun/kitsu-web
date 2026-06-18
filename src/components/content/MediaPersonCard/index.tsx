import type React from 'react';

import Avatar from '@/components/content/Avatar';
import { type ImageSource } from '@/components/content/Image';
import { Link, type To } from '@/components/content/Link';
import Card from '@/components/surfaces/Card';

import styles from './styles.module.css';

export type MediaPersonCardProps = {
  image?: ImageSource | null;
  name: string;
  role?: React.ReactNode;
  to?: To;
  size?: number;
};

export default function MediaPersonCard({
  image,
  name,
  role,
  to,
  size = 56,
}: MediaPersonCardProps) {
  const card = (
    <Card className={styles.card}>
      <Avatar source={image} size={size} alt={name} className={styles.image} />
      <div className={styles.content}>
        <div className={styles.name}>{name}</div>
        {role ? <div className={styles.role}>{role}</div> : null}
      </div>
    </Card>
  );

  if (!to) return card;

  return (
    <Link to={to} className={styles.link}>
      {card}
    </Link>
  );
}
