import React from 'react';
import { useParams } from 'react-router-dom';
import invariant from 'tiny-invariant';
import { useQuery } from 'urql';

import CategoryList, {
  CategoryListFragment,
} from '@/components/content/CategoryList';
import { Description } from '@/components/content/Description';
import Reaction, { ReactionCardFragment } from '@/components/content/Reaction';
import Section from '@/components/Section';
import Card from '@/components/surfaces/Card';
import { useLocale } from '@/contexts/IntlContext';
import { graphql } from '@/graphql/tada';
import AnimeLayout, { AnimeLayoutFragment } from '@/pages/Anime/Layout';

import styles from './styles.module.css';

export const AnimeSummaryPageQuery = graphql(
  `
    query findAnimeBySlug($slug: String!) {
      findAnime: findAnimeBySlug(slug: $slug) {
        ...AnimeLayoutFragment
        ...CategoryListFragment
        slug
        description
        categories(first: 50, sort: [{ on: ANCESTRY, direction: ASCENDING }]) {
          nodes {
            id
            slug
            title
            root {
              id
              slug
            }
            parent {
              id
              slug
            }
          }
        }
        reactions(
          sort: [
            { on: UP_VOTES_COUNT, direction: DESCENDING }
            { on: CREATED_AT, direction: DESCENDING }
          ]
          first: 6
        ) {
          nodes {
            id
            ...ReactionCardFragment
          }
        }
      }
    }
  `,
  [ReactionCardFragment, AnimeLayoutFragment, CategoryListFragment],
);

export default function AnimeSummaryPage() {
  const { locale } = useLocale();
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on AnimeSummary');

  const results = useQuery({
    query: AnimeSummaryPageQuery,
    variables: { slug, locale },
  });

  if (!results[0].data?.findAnime) return null;

  const media = results[0].data.findAnime;
  const description = media.description['en'];

  return (
    <AnimeLayout media={media}>
      <div className={styles.content} style={{ minWidth: 0 }}>
        <Card className={styles.descriptionCard}>
          <Description
            text={typeof description === 'string' ? description : ''}
          />
          <CategoryList media={media} />
        </Card>
      </div>
      <div className={styles.communitySidebar}>
        <Section
          className={styles.reactionList}
          title="Reactions"
          link="View All"
          linkTo={`/anime/${media.slug}/reactions`}>
          {media.reactions?.nodes?.map(
            (reaction) =>
              reaction && <Reaction reaction={reaction} key={reaction.id} />,
          )}
        </Section>
      </div>
    </AnimeLayout>
  );
}

export { default as AnimeById } from '../RedirectFromId';
