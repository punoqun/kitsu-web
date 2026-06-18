import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import QuoteCard, { QuoteCardFragment } from '@/components/content/QuoteCard';
import Card from '@/components/surfaces/Card';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import MangaLayout, { MangaLayoutFragment } from '@/pages/Manga/Layout';

import styles from './styles.module.css';

export const MangaQuotesPageQuery = graphql(
  `
    query findMangaQuotes($slug: String!) {
      findManga: findMangaBySlug(slug: $slug) {
        ...MangaLayoutFragment
        slug
        quotes(first: 30) {
          totalCount
          nodes {
            id
            ...QuoteCardFragment
          }
        }
      }
    }
  `,
  [MangaLayoutFragment, QuoteCardFragment],
);

function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

export default function MangaQuotesPage() {
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on MangaQuotes');

  const [result] = useQuery({
    query: MangaQuotesPageQuery,
    variables: { slug },
  });

  if (!result.data?.findManga) return null;

  const media = result.data.findManga;
  const quotes = media.quotes.nodes?.filter(isPresent) ?? [];

  return (
    <MangaLayout media={media}>
      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <FormattedMessage
              id="media.show.quotes.title"
              defaultMessage="Quotes"
              description="Title for the anime quotes tab"
            />
          </h1>
          <p className={styles.count}>
            <FormattedMessage
              id="media.show.quotes.count"
              defaultMessage="{count, plural, =0 {No quotes} one {# quote} other {# quotes}}"
              description="Number of anime quotes shown on the quotes tab"
              values={{ count: media.quotes.totalCount }}
            />
          </p>
        </header>

        {quotes.length > 0 ? (
          <div className={styles.grid}>
            {quotes.map((quote) => (
              <QuoteCard
                quote={quote}
                to={`/manga/${media.slug}/quotes/${quote.id}`}
                key={quote.id}
              />
            ))}
          </div>
        ) : (
          <Card className={styles.empty}>
            <FormattedMessage
              id="media.show.quotes.empty"
              defaultMessage="No quotes have been added for this anime yet."
              description="Empty state shown when an anime has no quotes"
            />
          </Card>
        )}
      </main>
    </MangaLayout>
  );
}
