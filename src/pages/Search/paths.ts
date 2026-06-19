import { Path, type PathBuilder } from 'app/utils/routes';

export type SearchType = 'anime' | 'manga' | 'users';

export const paths = (({ query, type }: { query: string; type: SearchType }) =>
  new Path('/search', { query, type })) satisfies PathBuilder;
