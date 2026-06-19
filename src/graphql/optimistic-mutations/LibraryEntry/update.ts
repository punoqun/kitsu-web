import { type OptimisticMutationResolver } from '@urql/exchange-graphcache';

import { type LibraryEntryUpdateInput } from 'app/graphql/types';

import { libraryEntryFromUpdateInput } from './helpers';

const update: OptimisticMutationResolver<{
  input: LibraryEntryUpdateInput;
}> = ({ input }, cache) => ({
  __typename: 'LibraryEntryUpdatePayload',
  libraryEntry: libraryEntryFromUpdateInput(input, cache),
  errors: [],
});

export default update;
