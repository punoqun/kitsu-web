import { Path, pathTree, type PathBuilder } from 'app/utils/routes';

export const paths = ((slug: string) => {
  const path = new Path(`/manga/${slug}`);

  return pathTree(path, {
    chapters: () => new Path(`${path}/chapters`),
    chapter: (number: string) => new Path(`${path}/chapters/${number}`),
    characters: () => new Path(`${path}/characters`),
    staff: () => new Path(`${path}/staff`),
    reactions: () => new Path(`${path}/reactions`),
    franchise: () => new Path(`${path}/franchise`),
    quotes: () => new Path(`${path}/quotes`),
    quote: (id: string) => new Path(`${path}/quotes/${id}`),
  });
}) satisfies PathBuilder;
