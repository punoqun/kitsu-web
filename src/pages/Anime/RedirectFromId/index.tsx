import { Navigate, useParams } from 'react-router';

import { useQuery } from '@/graphql';
import { graphql } from '@/graphql/tada';

const FindAnimeSlugByIdQuery = graphql(`
  query FindAnimeSlugById($id: ID!) {
    findAnimeById(id: $id) {
      slug
    }
  }
`);

export default function AnimePageRedirectFromId() {
  const { id } = useParams<{ id: string }>();
  const [{ data }] = useQuery({
    query: FindAnimeSlugByIdQuery,
    variables: { id: id! },
  });

  return <Navigate to={`/anime/${data?.findAnimeById?.slug}`} />;
}
