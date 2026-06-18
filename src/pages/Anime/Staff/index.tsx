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

export const AnimeStaffPageQuery = graphql(
  `
    query findAnimeStaff($slug: String!) {
      findAnime: findAnimeBySlug(slug: $slug) {
        ...AnimeLayoutFragment
        slug
        staff(first: 50) {
          totalCount
          nodes {
            id
            role
            person {
              id
              slug
              name
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

export default function AnimeStaffPage() {
  const intl = useIntl();
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on AnimeStaff');

  const [result] = useQuery({
    query: AnimeStaffPageQuery,
    variables: { slug },
  });

  if (!result.data?.findAnime) return null;

  const media = result.data.findAnime;
  const staff = media.staff?.nodes?.filter(isPresent) ?? [];
  const totalCount = media.staff?.totalCount ?? 0;

  return (
    <AnimeLayout media={media}>
      <div className={styles.content}>
        <Section
          className={styles.grid}
          title={intl.formatMessage(
            {
              id: 'media.show.staff.title',
              defaultMessage: 'Staff ({count})',
              description: 'Anime staff section title with total count',
            },
            { count: totalCount },
          )}>
          {staff.length > 0 ? (
            staff.map((staffMember) => {
              const person = staffMember.person;

              return (
                <MediaPersonCard
                  key={staffMember.id}
                  image={person.image}
                  name={person.name || person.names.canonical}
                  role={staffMember.role}
                />
              );
            })
          ) : (
            <p className={styles.emptyState}>
              <FormattedMessage
                id="media.show.staff.empty"
                defaultMessage="No staff have been added yet."
                description="Empty state shown when an anime has no staff"
              />
            </p>
          )}
        </Section>
      </div>
    </AnimeLayout>
  );
}
