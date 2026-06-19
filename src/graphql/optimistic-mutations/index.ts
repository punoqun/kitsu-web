import { type OptimisticMutationConfig } from '@urql/exchange-graphcache';

import libraryEntry from './LibraryEntry';
import mediaReaction from './MediaReaction';

export default {
  libraryEntry,
  mediaReaction,
} satisfies OptimisticMutationConfig;
