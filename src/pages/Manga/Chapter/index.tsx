import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import { Description } from '@/components/content/Description';
import Image, { ImageFragment } from '@/components/content/Image';
import { Link } from '@/components/content/Link';
import Card from '@/components/surfaces/Card';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import MangaLayout, { MangaLayoutFragment } from '@/pages/Manga/Layout';
import { paths } from '@/pages/Manga/paths';

import styles from './styles.module.css';

export const MangaChapterPageQuery = graphql(
  `
    query findMangaChapter($slug: String!) {
      findManga: findMangaBySlug(slug: $slug) {
        ...MangaLayoutFragment
        slug
        chapters(first: 2000, sort: [{ on: NUMBER, direction: ASCENDING }]) {
          nodes {
            id
            number
            titles {
              canonical
            }
            releasedAt
            length
            description
            thumbnail {
              ...ImageFragment
            }
          }
        }
      }
    }
  `,
  [MangaLayoutFragment, ImageFragment],
);

function isPresent<T>(value: T | null | undefined): value is NonNullable<T> {
  return value != null;
}

export default function MangaChapterPage() {
  const { formatMessage } = useIntl();
  const { slug, number: chapterNumberParam } = useParams<'slug' | 'number'>();
  invariant(slug, 'Missing slug on MangaChapter');
  invariant(chapterNumberParam, 'Missing number on MangaChapter');

  const [result] = useQuery({
    query: MangaChapterPageQuery,
    variables: { slug },
  });

  if (!result.data?.findManga) return null;

  const media = result.data.findManga;
  const route = paths(media.slug);
  const chapterNumber = Number(chapterNumberParam);
  const chapters = media.chapters?.nodes?.filter(isPresent) ?? [];
  const chapterIndex = Number.isFinite(chapterNumber)
    ? chapters.findIndex((chapter) => chapter.number === chapterNumber)
    : -1;
  const chapter = chapterIndex >= 0 ? chapters[chapterIndex] : null;
  const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex >= 0 && chapterIndex < chapters.length - 1
      ? chapters[chapterIndex + 1]
      : null;

  return (
    <MangaLayout media={media}>
      <div className={styles.content}>
        {chapter ? (
          <>
            <Card className={styles.card}>
              <div className={styles.hero}>
                {chapter.thumbnail ? (
                  <Image
                    source={chapter.thumbnail}
                    alt={formatMessage(
                      {
                        id: 'media.show.chapter.thumbnailAlt',
                        defaultMessage: 'Thumbnail for {title}',
                        description: 'Alt text for a chapter detail image',
                      },
                      { title: chapter.titles.canonical },
                    )}
                    className={styles.heroImage}
                  />
                ) : (
                  <div className={styles.heroFallback}>
                    <FormattedMessage
                      id="media.show.chapter.noThumbnail"
                      defaultMessage="No thumbnail"
                      description="Fallback text shown when a chapter detail page has no thumbnail"
                    />
                  </div>
                )}
              </div>
              <div className={styles.kicker}>
                <FormattedMessage
                  id="media.show.chapter.number"
                  defaultMessage="Chapter {number}"
                  description="Chapter number label on the chapter detail page"
                  values={{ number: chapter.number }}
                />
              </div>
              <h1 className={styles.title}>{chapter.titles.canonical}</h1>
              <div className={styles.meta}>
                {chapter.releasedAt ? (
                  <span>
                    <FormattedDate
                      value={chapter.releasedAt}
                      year="numeric"
                      month="long"
                      day="numeric"
                    />
                  </span>
                ) : null}
                {chapter.length ? (
                  <span>
                    <FormattedMessage
                      id="media.show.chapter.length"
                      defaultMessage="{length, number} pages"
                      description="Chapter length in pages on the detail page"
                      values={{ length: chapter.length }}
                    />
                  </span>
                ) : null}
              </div>
              {typeof chapter.description['en'] === 'string' &&
              chapter.description['en'] ? (
                <Description
                  text={chapter.description['en']}
                  className={styles.description}
                />
              ) : (
                <p className={styles.descriptionEmpty}>
                  <FormattedMessage
                    id="media.show.chapter.noDescription"
                    defaultMessage="No description is available for this chapter."
                    description="Fallback text when a chapter has no description"
                  />
                </p>
              )}
            </Card>
            {previousChapter || nextChapter ? (
              <nav
                className={styles.navigation}
                aria-label={formatMessage({
                  id: 'media.show.chapter.navigationLabel',
                  defaultMessage: 'Chapter navigation',
                  description: 'Accessible label for chapter detail navigation',
                })}>
                {previousChapter ? (
                  <Link
                    to={route.chapter(String(previousChapter.number))}
                    className={styles.navLink}>
                    <span className={styles.navDirection}>
                      <FormattedMessage
                        id="media.show.chapter.previous"
                        defaultMessage="Previous chapter"
                        description="Link label for the previous chapter"
                      />
                    </span>
                    <span>{previousChapter.titles.canonical}</span>
                  </Link>
                ) : null}
                {nextChapter ? (
                  <Link
                    to={route.chapter(String(nextChapter.number))}
                    className={[styles.navLink, styles.nextLink].join(' ')}>
                    <span className={styles.navDirection}>
                      <FormattedMessage
                        id="media.show.chapter.next"
                        defaultMessage="Next chapter"
                        description="Link label for the next chapter"
                      />
                    </span>
                    <span>{nextChapter.titles.canonical}</span>
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        ) : (
          <Card className={styles.notFound}>
            <h1 className={styles.notFoundTitle}>
              <FormattedMessage
                id="media.show.chapter.notFoundTitle"
                defaultMessage="Chapter not found"
                description="Title shown when a manga chapter number does not exist"
              />
            </h1>
            <p className={styles.notFoundText}>
              <FormattedMessage
                id="media.show.chapter.notFoundMessage"
                defaultMessage="We could not find chapter {number} for this manga."
                description="Message shown when a manga chapter number does not exist"
                values={{ number: chapterNumberParam }}
              />
            </p>
          </Card>
        )}
      </div>
    </MangaLayout>
  );
}
