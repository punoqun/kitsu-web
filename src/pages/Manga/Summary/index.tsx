import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import CategoryList, {
  CategoryListFragment,
} from '@/components/content/CategoryList';
import { Description } from '@/components/content/Description';
import Reaction, { ReactionCardFragment } from '@/components/content/Reaction';
import Section from '@/components/Section';
import Card from '@/components/surfaces/Card';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import MangaLayout, { MangaLayoutFragment } from '@/pages/Manga/Layout';

import styles from './styles.module.css';

export const MangaSummaryPageQuery = graphql(
  `
    query findMangaBySlug($slug: String!) {
      findManga: findMangaBySlug(slug: $slug) {
        ...MangaLayoutFragment
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
  [ReactionCardFragment, MangaLayoutFragment, CategoryListFragment],
);

export default function MangaSummaryPage() {
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on MangaSummary');

  const [result] = useQuery({
    query: MangaSummaryPageQuery,
    variables: { slug },
  });

  if (!result.data?.findManga) return null;

  const media = result.data.findManga;
  const description = media.description['en'];

  return (
    <MangaLayout media={media}>
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
          linkTo={`/manga/${media.slug}/reactions`}>
          {media.reactions?.nodes?.map(
            (reaction) =>
              reaction && <Reaction reaction={reaction} key={reaction.id} />,
          )}
        </Section>
      </div>
    </MangaLayout>
  );
}

export { default as MangaById } from '../RedirectFromId';
