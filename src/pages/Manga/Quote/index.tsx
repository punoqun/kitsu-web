import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import QuoteCard, { QuoteCardFragment } from '@/components/content/QuoteCard';
import Card from '@/components/surfaces/Card';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import MangaLayout, { MangaLayoutFragment } from '@/pages/Manga/Layout';

import styles from './styles.module.css';

export const MangaQuotePageQuery = graphql(
  `
    query findMangaQuote($slug: String!) {
      findManga: findMangaBySlug(slug: $slug) {
        ...MangaLayoutFragment
        slug
        quotes(first: 500) {
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

export default function MangaQuotePage() {
  const { slug, id } = useParams<'slug' | 'id'>();
  invariant(slug, 'Missing slug on MangaQuote');
  invariant(id, 'Missing quote id on MangaQuote');

  const [result] = useQuery({
    query: MangaQuotePageQuery,
    variables: { slug },
  });

  if (!result.data?.findManga) return null;

  const media = result.data.findManga;
  const quote = media.quotes.nodes
    ?.filter(isPresent)
    .find((node) => node.id === id);

  return (
    <MangaLayout media={media}>
      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <FormattedMessage
              id="media.show.quotes.detail.title"
              defaultMessage="Quote"
              description="Title for an anime quote detail page"
            />
          </h1>
        </header>

        {quote ? (
          <QuoteCard quote={quote} variant="detail" className={styles.quote} />
        ) : (
          <Card className={styles.notFound}>
            <FormattedMessage
              id="media.show.quotes.notFound"
              defaultMessage="We couldn't find that quote for this anime."
              description="Message shown when a quote id is not found for an anime"
            />
          </Card>
        )}
      </main>
    </MangaLayout>
  );
}
