import { useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import { ImageFragment } from '@/components/content/Image';
import MediaPersonCard from '@/components/content/MediaPersonCard';
import MediaPosterCard from '@/components/content/MediaPosterCard';
import Button, { ButtonColor, ButtonKind } from '@/components/controls/Button';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import ProfileLayout, { ProfileLayoutFragment } from '@/pages/Profile/Layout';
import { getMediaPath, getMediaTitle } from '@/utils/media';

import styles from './styles.module.css';

const FAVORITES_INCREMENT = 30;

export const ProfileFavoritesPageQuery = graphql(
  `
    query findProfileFavorites($slug: String!, $first: Int!) {
      findProfile: findProfileBySlug(slug: $slug) {
        ...ProfileLayoutFragment
        favorites(first: $first) {
          totalCount
          nodes {
            id
            createdAt
            item {
              __typename
              ... on Anime {
                id
                slug
                titles {
                  preferred
                  canonical
                }
                posterImage {
                  ...ImageFragment
                }
              }
              ... on Manga {
                id
                slug
                titles {
                  preferred
                  canonical
                }
                posterImage {
                  ...ImageFragment
                }
              }
              ... on Character {
                id
                slug
                names {
                  canonical
                }
                image {
                  ...ImageFragment
                }
              }
              ... on Person {
                id
                slug
                name
                image {
                  ...ImageFragment
                }
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  `,
  [ProfileLayoutFragment, ImageFragment],
);

function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

export default function ProfileFavoritesPage() {
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on ProfileFavorites');

  const [count, setCount] = useState(FAVORITES_INCREMENT);
  const [result] = useQuery({
    query: ProfileFavoritesPageQuery,
    variables: { slug, first: count },
  });

  if (!result.data?.findProfile) return null;

  const profile = result.data.findProfile;
  const favorites = profile.favorites.nodes?.filter(isPresent) ?? [];
  const totalCount = profile.favorites.totalCount;
  const hasMore =
    profile.favorites.pageInfo.hasNextPage || favorites.length < totalCount;

  return (
    <ProfileLayout profile={profile}>
      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <FormattedMessage
              defaultMessage="Favorites ({count})"
              description="Header for the profile favorites page with the total favorite count."
              values={{ count: <FormattedNumber value={totalCount} /> }}
            />
          </h1>
        </header>

        {totalCount === 0 ? (
          <p className={styles.empty}>
            <FormattedMessage
              defaultMessage="No favorites yet"
              description="Empty state shown when a profile has no favorite items."
            />
          </p>
        ) : (
          <div className={styles.grid}>
            {favorites.map((favorite) => {
              const item = favorite.item;

              switch (item.__typename) {
                case 'Anime':
                case 'Manga':
                  return (
                    <MediaPosterCard
                      key={favorite.id}
                      posterImage={item.posterImage}
                      title={getMediaTitle(item)}
                      to={getMediaPath(item)}
                    />
                  );
                case 'Character':
                  return (
                    <MediaPersonCard
                      key={favorite.id}
                      image={item.image}
                      name={item.names?.canonical ?? item.slug}
                    />
                  );
                case 'Person':
                  return (
                    <MediaPersonCard
                      key={favorite.id}
                      image={item.image}
                      name={item.name}
                    />
                  );
              }
            })}
          </div>
        )}

        {hasMore ? (
          <Button
            kind={ButtonKind.SOLID}
            color={ButtonColor.GREEN}
            loading={result.fetching}
            disabled={result.fetching}
            className={styles.loadMore}
            onClick={() =>
              setCount((currentCount) => currentCount + FAVORITES_INCREMENT)
            }>
            <FormattedMessage
              defaultMessage="Load more"
              description="Button label to load more profile favorites."
            />
          </Button>
        ) : null}
      </main>
    </ProfileLayout>
  );
}
