import { type OptimisticMutationResolver } from '@urql/exchange-graphcache';

import { type GenericDeleteInput } from 'app/graphql/types';

const deleteEntry: OptimisticMutationResolver<{
  input: GenericDeleteInput;
}> = ({ input }) => ({
  __typename: 'LibraryEntryDeletePayload',
  libraryEntry: {
    __typename: 'GenericDelete',
    id: input.id,
  },
  errors: [],
});

export default deleteEntry;
