import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import { ImageFragment } from '@/components/content/Image';
import MediaPersonCard from '@/components/content/MediaPersonCard';
import Section from '@/components/Section';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import MangaLayout, { MangaLayoutFragment } from '@/pages/Manga/Layout';

import styles from './styles.module.css';

export const MangaCharactersPageQuery = graphql(
  `
    query findMangaCharacters($slug: String!) {
      findManga: findMangaBySlug(slug: $slug) {
        ...MangaLayoutFragment
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
  [MangaLayoutFragment, ImageFragment],
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

export default function MangaCharactersPage() {
  const intl = useIntl();
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on MangaCharacters');

  const [result] = useQuery({
    query: MangaCharactersPageQuery,
    variables: { slug },
  });

  if (!result.data?.findManga) return null;

  const media = result.data.findManga;
  const characters = media.characters?.nodes?.filter(isPresent) ?? [];
  const totalCount = media.characters?.totalCount ?? 0;

  return (
    <MangaLayout media={media}>
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
    </MangaLayout>
  );
}

