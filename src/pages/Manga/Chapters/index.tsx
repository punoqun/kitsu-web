import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import ChapterCard, {
  ChapterCardFragment,
} from '@/components/content/ChapterCard';
import Button from '@/components/controls/Button';
import Section from '@/components/Section';
import Card from '@/components/surfaces/Card';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import MangaLayout, { MangaLayoutFragment } from '@/pages/Manga/Layout';
import { paths } from '@/pages/Manga/paths';

import styles from './styles.module.css';

const PAGE_SIZE = 30;

export const MangaChaptersPageQuery = graphql(
  `
    query findMangaChapters($slug: String!, $first: Int!) {
      findManga: findMangaBySlug(slug: $slug) {
        ...MangaLayoutFragment
        slug
        chapters(first: $first, sort: [{ on: NUMBER, direction: ASCENDING }]) {
          totalCount
          pageInfo {
            hasNextPage
          }
          nodes {
            id
            number
            ...ChapterCardFragment
          }
        }
      }
    }
  `,
  [MangaLayoutFragment, ChapterCardFragment],
);

function isPresent<T>(value: T | null | undefined): value is NonNullable<T> {
  return value != null;
}

export default function MangaChaptersPage() {
  const { formatMessage } = useIntl();
  const { slug } = useParams<'slug'>();
  const [count, setCount] = useState(PAGE_SIZE);
  invariant(slug, 'Missing slug on MangaChapters');

  const [result] = useQuery({
    query: MangaChaptersPageQuery,
    variables: { slug, first: count },
  });

  if (!result.data?.findManga) return null;

  const media = result.data.findManga;
  const route = paths(media.slug);
  const chaptersConnection = media.chapters;
  const chapters = chaptersConnection?.nodes?.filter(isPresent) ?? [];
  const title = formatMessage(
    {
      id: 'media.show.chapters.heading',
      defaultMessage: 'Chapters ({totalCount, number})',
      description: 'Header for the manga chapters list with total count',
    },
    { totalCount: chaptersConnection?.totalCount ?? 0 },
  );

  return (
    <MangaLayout media={media}>
      <div className={styles.content}>
        <Section title={title}>
          {chapters.length ? (
            <div className={styles.episodeGrid}>
              {chapters.map((chapter) => (
                <ChapterCard
                  chapter={chapter}
                  key={chapter.id}
                  to={route.chapter(String(chapter.number))}
                />
              ))}
            </div>
          ) : (
            <Card className={styles.emptyState}>
              <FormattedMessage
                id="media.show.chapters.empty"
                defaultMessage="No chapters have been added yet."
                description="Empty state message for a manga with no chapters"
              />
            </Card>
          )}
          {chaptersConnection?.pageInfo.hasNextPage ? (
            <Button
              type="button"
              kind="outline"
              color="kitsu-purple"
              className={styles.loadMore}
              loading={result.fetching}
              onClick={() => setCount((current) => current + PAGE_SIZE)}>
              <FormattedMessage
                id="media.show.chapters.loadMore"
                defaultMessage="Load more chapters"
                description="Button label to load more manga chapters"
              />
            </Button>
          ) : null}
        </Section>
      </div>
    </MangaLayout>
  );
}
