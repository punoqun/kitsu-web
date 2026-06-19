import create from './create';
import deleteEntry from './delete';
import update from './update';

const libraryEntry = () => ({
  __typename: 'LibraryEntryMutations',
  create,
  delete: deleteEntry,
  update,
});

export default libraryEntry;
