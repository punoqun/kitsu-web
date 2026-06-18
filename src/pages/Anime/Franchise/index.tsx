import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import { ImageFragment } from '@/components/content/Image';
import { type To } from '@/components/content/Link';
import MediaPosterCard from '@/components/content/MediaPosterCard';
import { graphql, type ResultOf } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import AnimeLayout, { AnimeLayoutFragment } from '@/pages/Anime/Layout';
import { paths as animePaths } from '@/pages/Anime/paths';
import { Path } from '@/utils/routes';

import styles from './styles.module.css';

const RELATIONSHIP_KIND_ORDER = [
  'SEQUEL',
  'PREQUEL',
  'SIDE_STORY',
  'ALTERNATIVE_VERSION',
  'ALTERNATIVE_SETTING',
  'PARENT_STORY',
  'FULL_STORY',
  'SUMMARY',
  'SPINOFF',
  'ADAPTATION',
  'CHARACTER',
  'OTHER',
] as const;

type RelationshipKind = (typeof RELATIONSHIP_KIND_ORDER)[number];

const RELATIONSHIP_KINDS = new Set<string>(RELATIONSHIP_KIND_ORDER);

export const AnimeFranchisePageQuery = graphql(
  `
    query findAnimeFranchise($slug: String!) {
      findAnime: findAnimeBySlug(slug: $slug) {
        ...AnimeLayoutFragment
        slug
        relationships(first: 50) {
          totalCount
          nodes {
            kind
            destination {
              __typename
              ... on Anime {
                id
                slug
                type
                titles {
                  canonical
                  preferred
                }
                posterImage {
                  ...ImageFragment
                }
              }
              ... on Manga {
                id
                slug
                type
                titles {
                  canonical
                  preferred
                }
                posterImage {
                  ...ImageFragment
                }
              }
            }
          }
        }
      }
    }
  `,
  [AnimeLayoutFragment, ImageFragment],
);

type AnimeFranchisePageResult = ResultOf<typeof AnimeFranchisePageQuery>;
type AnimeFranchiseRelationship = NonNullable<
  NonNullable<
    NonNullable<AnimeFranchisePageResult['findAnime']>['relationships']
  >['nodes']
>[number];
type RelatedMedia = NonNullable<
  NonNullable<AnimeFranchiseRelationship>['destination']
>;
type SupportedRelatedMedia = Extract<
  RelatedMedia,
  { __typename: 'Anime' | 'Manga' }
>;

function isRelationshipKind(kind: string): kind is RelationshipKind {
  return RELATIONSHIP_KINDS.has(kind);
}

function isSupportedRelatedMedia(
  media: RelatedMedia,
): media is SupportedRelatedMedia {
  return media.__typename === 'Anime' || media.__typename === 'Manga';
}

function getRelationshipKindLabel(kind: RelationshipKind) {
  switch (kind) {
    case 'SEQUEL':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.SEQUEL"
          defaultMessage="Sequels"
          description="media -> show -> franchise -> relationship kind -> sequels"
        />
      );
    case 'PREQUEL':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.PREQUEL"
          defaultMessage="Prequels"
          description="media -> show -> franchise -> relationship kind -> prequels"
        />
      );
    case 'SIDE_STORY':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.SIDE_STORY"
          defaultMessage="Side Stories"
          description="media -> show -> franchise -> relationship kind -> side stories"
        />
      );
    case 'ALTERNATIVE_VERSION':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.ALTERNATIVE_VERSION"
          defaultMessage="Alternative Versions"
          description="media -> show -> franchise -> relationship kind -> alternative versions"
        />
      );
    case 'ALTERNATIVE_SETTING':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.ALTERNATIVE_SETTING"
          defaultMessage="Alternative Settings"
          description="media -> show -> franchise -> relationship kind -> alternative settings"
        />
      );
    case 'PARENT_STORY':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.PARENT_STORY"
          defaultMessage="Parent Stories"
          description="media -> show -> franchise -> relationship kind -> parent stories"
        />
      );
    case 'FULL_STORY':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.FULL_STORY"
          defaultMessage="Full Stories"
          description="media -> show -> franchise -> relationship kind -> full stories"
        />
      );
    case 'SUMMARY':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.SUMMARY"
          defaultMessage="Summaries"
          description="media -> show -> franchise -> relationship kind -> summaries"
        />
      );
    case 'SPINOFF':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.SPINOFF"
          defaultMessage="Spin-offs"
          description="media -> show -> franchise -> relationship kind -> spin-offs"
        />
      );
    case 'ADAPTATION':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.ADAPTATION"
          defaultMessage="Adaptations"
          description="media -> show -> franchise -> relationship kind -> adaptations"
        />
      );
    case 'CHARACTER':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.CHARACTER"
          defaultMessage="Characters"
          description="media -> show -> franchise -> relationship kind -> characters"
        />
      );
    case 'OTHER':
      return (
        <FormattedMessage
          id="media.show.franchise.kind.OTHER"
          defaultMessage="Other"
          description="media -> show -> franchise -> relationship kind -> other"
        />
      );
  }
}

function getMediaPath(media: SupportedRelatedMedia): To {
  if (media.__typename === 'Anime') return animePaths(media.slug);

  return new Path(`/manga/${media.slug}`);
}

function getMediaTitle(media: SupportedRelatedMedia) {
  return media.titles?.canonical ?? media.titles?.preferred ?? media.slug;
}

function groupRelationships(
  relationships: readonly AnimeFranchiseRelationship[],
) {
  const grouped = new Map<RelationshipKind, SupportedRelatedMedia[]>();

  for (const relationship of relationships) {
    if (
      !relationship ||
      !isRelationshipKind(relationship.kind) ||
      !relationship.destination ||
      !isSupportedRelatedMedia(relationship.destination)
    )
      continue;

    grouped.set(relationship.kind, [
      ...(grouped.get(relationship.kind) ?? []),
      relationship.destination,
    ]);
  }

  return RELATIONSHIP_KIND_ORDER.map((kind) => ({
    kind,
    media: grouped.get(kind) ?? [],
  })).filter(({ media }) => media.length > 0);
}

export default function AnimeFranchisePage() {
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on AnimeFranchise');

  const [result] = useQuery({
    query: AnimeFranchisePageQuery,
    variables: { slug },
  });

  if (!result.data?.findAnime) return null;

  const media = result.data.findAnime;
  const relationshipGroups = groupRelationships(
    media.relationships?.nodes ?? [],
  );

  return (
    <AnimeLayout media={media}>
      <div className={styles.content}>
        {relationshipGroups.length > 0 ? (
          relationshipGroups.map((group) => (
            <section className={styles.section} key={group.kind}>
              <h2 className={styles.sectionTitle}>
                {getRelationshipKindLabel(group.kind)}
              </h2>
              <div className={styles.grid}>
                {group.media.map((item) => (
                  <MediaPosterCard
                    key={`${item.__typename}-${item.id}`}
                    posterImage={item.posterImage}
                    title={getMediaTitle(item)}
                    to={getMediaPath(item)}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className={styles.emptyState}>
            <FormattedMessage
              id="media.show.franchise.empty"
              defaultMessage="No franchise relationships have been added yet."
              description="Empty state shown when an anime has no franchise relationships"
            />
          </p>
        )}
      </div>
    </AnimeLayout>
  );
}
