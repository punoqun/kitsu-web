import { FormattedMessage } from 'react-intl';

import Avatar from '@/components/content/Avatar';
import { ImageFragment } from '@/components/content/Image';
import { Link, type To } from '@/components/content/Link';
import Card from '@/components/surfaces/Card';
import { graphql, readFragment, type FragmentOf } from '@/graphql/tada';

import styles from './styles.module.css';

export const QuoteCardFragment = graphql(
  `
    fragment QuoteCardFragment on Quote {
      id
      lines(first: 10) {
        nodes {
          id
          content
          character {
            id
            slug
            names {
              canonical
            }
            image {
              ...ImageFragment
            }
          }
        }
      }
    }
  `,
  [ImageFragment],
);

export type QuoteCardProps = {
  quote: FragmentOf<typeof QuoteCardFragment>;
  to?: To;
  variant?: 'default' | 'detail';
  className?: string;
};

function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

export default function QuoteCard({
  quote: quoteProp,
  to,
  variant = 'default',
  className,
}: QuoteCardProps) {
  const quote = readFragment(QuoteCardFragment, quoteProp);
  const lines = quote.lines.nodes?.filter(isPresent) ?? [];

  const card = (
    <Card
      className={[
        styles.card,
        variant === 'detail' ? styles.detail : styles.standard,
        className,
      ]
        .filter(Boolean)
        .join(' ')}>
      <div className={styles.lines}>
        {lines.length > 0 ? (
          lines.map((line) => {
            const speakerName =
              line.character.names?.canonical ?? line.character.slug;

            return (
              <div className={styles.line} key={line.id}>
                <Avatar
                  source={line.character.image}
                  size={variant === 'detail' ? 48 : 40}
                  alt={speakerName}
                  className={styles.avatar}
                />
                <div className={styles.bubble}>
                  <div className={styles.speaker}>{speakerName}</div>
                  <p className={styles.quoteText}>{line.content}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className={styles.empty}>
            <FormattedMessage
              id="media.show.quotes.card.empty"
              defaultMessage="No lines are available for this quote."
              description="Empty message shown inside a quote card without quote lines"
            />
          </p>
        )}
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
