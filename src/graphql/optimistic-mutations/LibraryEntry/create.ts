import { type OptimisticMutationResolver } from '@urql/exchange-graphcache';

import { type LibraryEntryCreateInput } from 'app/graphql/types';

import { libraryEntryFromCreateInput, mediaTypename } from './helpers';

const create: OptimisticMutationResolver<{
  input: LibraryEntryCreateInput;
}> = ({ input }) => {
  const libraryEntry = libraryEntryFromCreateInput(input);

  return {
    __typename: 'LibraryEntryCreatePayload',
    libraryEntry: {
      ...libraryEntry,
      media: {
        __typename: mediaTypename(input.mediaType),
        id: input.mediaId,
        myLibraryEntry: () => libraryEntry,
      },
    },
    errors: [],
  };
};

export default create;
