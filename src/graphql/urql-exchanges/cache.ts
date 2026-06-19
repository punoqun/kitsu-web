import {
  cacheExchange as graphcacheExchange,
  type UpdateResolver,
} from '@urql/exchange-graphcache';

import resolvers from '@/graphql/resolvers';
import schema from '@/graphql/schema.urql.json';
import {
  MediaTypeEnum,
  type GenericDeleteInput,
  type LibraryEntryCreateInput,
  type LibraryEntryCreatePayload,
  type LibraryEntryDeletePayload,
} from '@/graphql/types';

import optimistic from '../optimistic-mutations';

function mediaEntity(
  input: Pick<LibraryEntryCreateInput, 'mediaId' | 'mediaType'>,
) {
  return {
    __typename: input.mediaType === MediaTypeEnum.Anime ? 'Anime' : 'Manga',
    id: input.mediaId,
  };
}

const linkCreatedLibraryEntry: UpdateResolver<
  LibraryEntryCreatePayload,
  { input: LibraryEntryCreateInput }
> = (result, args, cache) => {
  if (!result.libraryEntry) return;

  cache.link(mediaEntity(args.input), 'myLibraryEntry', {
    __typename: 'LibraryEntry',
    id: result.libraryEntry.id,
  });
};

const unlinkDeletedLibraryEntry: UpdateResolver<
  LibraryEntryDeletePayload,
  { input: GenericDeleteInput }
> = (_result, args, cache) => {
  const entry = { __typename: 'LibraryEntry', id: args.input.id };
  const media = cache.resolve(entry, 'media');

  if (typeof media === 'string') {
    cache.link(media, 'myLibraryEntry', null);
  }

  cache.invalidate(entry);
};

export default function cacheExchange() {
  return graphcacheExchange({
    optimistic,
    updates: {
      LibraryEntryMutations: {
        create: linkCreatedLibraryEntry,
        delete: unlinkDeletedLibraryEntry,
      },
    },
    schema,
    keys: {
      Image: () => null,
      ImageView: () => null,
      TitlesList: () => null,
    },
    resolvers,
  });
}
