import { Path, type PathBuilder, pathTree } from 'app/utils/routes';

export const paths = (({ slug, id }: { slug?: string | null; id?: string }) => {
  const path = new Path(`/users/${slug ?? id}`);

  return pathTree(path, {
    reactions: () => new Path(`${path}/reactions`),
    reviews: () => new Path(`${path}/reviews`),
    followers: () => new Path(`${path}/followers`),
    following: () => new Path(`${path}/following`),
    library: (type: string) => new Path(`${path}/library/${type}`),
  });
}) satisfies PathBuilder;
