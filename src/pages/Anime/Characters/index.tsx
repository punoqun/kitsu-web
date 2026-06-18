import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import { ImageFragment } from '@/components/content/Image';
import MediaPersonCard from '@/components/content/MediaPersonCard';
import Section from '@/components/Section';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import AnimeLayout, { AnimeLayoutFragment } from '@/pages/Anime/Layout';

import styles from './styles.module.css';

export const AnimeCharactersPageQuery = graphql(
  `
    query findAnimeCharacters($slug: String!) {
      findAnime: findAnimeBySlug(slug: $slug) {
        ...AnimeLayoutFragment
        slug
        characters(first: 50, sort: [{ on: ROLE, direction: ASCENDING }]) {
          totalCount
          nodes {
            id
            role
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
    }
  `,
  [AnimeLayoutFragment, ImageFragment],
);

function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

function CharacterRoleLabel({
  role,
}: {
  role: 'BACKGROUND' | 'CAMEO' | 'MAIN' | 'RECURRING';
}) {
  switch (role) {
    case 'MAIN':
      return (
        <FormattedMessage
          id="media.show.characters.role.main"
          defaultMessage="Main"
          description="Label for a main anime character role"
        />
      );
    case 'RECURRING':
      return (
        <FormattedMessage
          id="media.show.characters.role.recurring"
          defaultMessage="Supporting"
          description="Label for a recurring or supporting anime character role"
        />
      );
    case 'BACKGROUND':
      return (
        <FormattedMessage
          id="media.show.characters.role.background"
          defaultMessage="Background"
          description="Label for a background anime character role"
        />
      );
    case 'CAMEO':
      return (
        <FormattedMessage
          id="media.show.characters.role.cameo"
          defaultMessage="Cameo"
          description="Label for a cameo anime character role"
        />
      );
  }
}

export default function AnimeCharactersPage() {
  const intl = useIntl();
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on AnimeCharacters');

  const [result] = useQuery({
    query: AnimeCharactersPageQuery,
    variables: { slug },
  });

  if (!result.data?.findAnime) return null;

  const media = result.data.findAnime;
  const characters = media.characters?.nodes?.filter(isPresent) ?? [];
  const totalCount = media.characters?.totalCount ?? 0;

  return (
    <AnimeLayout media={media}>
      <div className={styles.content}>
        <Section
          className={styles.grid}
          title={intl.formatMessage(
            {
              id: 'media.show.characters.title',
              defaultMessage: 'Characters ({count})',
              description: 'Anime characters section title with total count',
            },
            { count: totalCount },
          )}>
          {characters.length > 0 ? (
            characters.map((mediaCharacter) => {
              const character = mediaCharacter.character;

              return (
                <MediaPersonCard
                  key={mediaCharacter.id}
                  image={character.image}
                  name={character.names?.canonical ?? character.slug}
                  role={<CharacterRoleLabel role={mediaCharacter.role} />}
                />
              );
            })
          ) : (
            <p className={styles.emptyState}>
              <FormattedMessage
                id="media.show.characters.empty"
                defaultMessage="No characters have been added yet."
                description="Empty state shown when an anime has no characters"
              />
            </p>
          )}
        </Section>
      </div>
    </AnimeLayout>
  );
}
