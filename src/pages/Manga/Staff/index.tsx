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

export const MangaStaffPageQuery = graphql(
  `
    query findMangaStaff($slug: String!) {
      findManga: findMangaBySlug(slug: $slug) {
        ...MangaLayoutFragment
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
  [MangaLayoutFragment, ImageFragment],
);

function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

export default function MangaStaffPage() {
  const intl = useIntl();
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on MangaStaff');

  const [result] = useQuery({
    query: MangaStaffPageQuery,
    variables: { slug },
  });

  if (!result.data?.findManga) return null;

  const media = result.data.findManga;
  const staff = media.staff?.nodes?.filter(isPresent) ?? [];
  const totalCount = media.staff?.totalCount ?? 0;

  return (
    <MangaLayout media={media}>
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
    </MangaLayout>
  );
}

