import { Navigate, useParams } from 'react-router';

import { useQuery } from '@/graphql';
import { graphql } from '@/graphql/tada';

const FindMangaSlugByIdQuery = graphql(`
  query FindMangaSlugById($id: ID!) {
    findMangaById(id: $id) {
      slug
    }
  }
`);

export default function MangaPageRedirectFromId() {
  const { id } = useParams<{ id: string }>();
  const [{ data }] = useQuery({
    query: FindMangaSlugByIdQuery,
    variables: { id: id! },
  });

  return <Navigate to={`/manga/${data?.findMangaById?.slug}`} />;
}
