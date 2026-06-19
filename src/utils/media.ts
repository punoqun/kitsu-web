import { type To } from '@/components/content/Link';
import { paths as animePaths } from '@/pages/Anime/paths';
import { Path } from '@/utils/routes';

/**
 * The minimal shape needed to build a link to a media's detail page. Query
 * `__typename` and `slug` on any `Media` interface node to satisfy this.
 */
export type MediaLinkTarget = {
  __typename?: string | null;
  slug: string;
};

/**
 * Builds the route to a media's detail page, dispatching on its concrete type.
 * Works for both `Anime` and `Manga` nodes returned from a `Media` interface.
 */
export function getMediaPath(media: MediaLinkTarget): To {
  if (media.__typename === 'Anime') return animePaths(media.slug);

  return new Path(`/manga/${media.slug}`);
}

/**
 * The minimal title shape on a `Media` node. Prefer `titles.preferred`, falling
 * back to the canonical title and finally the slug.
 */
export type MediaTitleTarget = {
  slug: string;
  titles?: {
    preferred?: string | null;
    canonical?: string | null;
  } | null;
};

/**
 * Returns the best human-readable title for a media node.
 */
export function getMediaTitle(media: MediaTitleTarget): string {
  return (
    media.titles?.preferred ?? media.titles?.canonical ?? media.slug
  );
}
