import { Path, type PathBuilder } from 'app/utils/routes';

export type ExploreType = 'anime' | 'manga';

export const paths = ((type: ExploreType) => {
  return new Path(`/explore/${type}`);
}) satisfies PathBuilder;
