import { type Cache } from '@urql/exchange-graphcache';

import {
  LibraryEntryStatusEnum,
  MediaTypeEnum,
  type LibraryEntryCreateInput,
  type LibraryEntryUpdateInput,
} from 'app/graphql/types';

export function mediaTypename(mediaType: MediaTypeEnum) {
  return mediaType === MediaTypeEnum.Anime ? 'Anime' : 'Manga';
}

export function optimisticLibraryEntryId(input: LibraryEntryCreateInput) {
  return `optimistic-library-entry:${input.mediaType}:${input.mediaId}`;
}

export function libraryEntryFromCreateInput(input: LibraryEntryCreateInput) {
  return {
    __typename: 'LibraryEntry',
    id: optimisticLibraryEntryId(input),
    status: input.status,
    progress: input.progress ?? 0,
    rating: input.rating ?? null,
    reconsumeCount: input.reconsumeCount ?? 0,
    reconsuming: input.reconsuming ?? false,
  };
}

function entryEntity(id: string) {
  return { __typename: 'LibraryEntry', id };
}

function readNumber(cache: Cache, id: string, field: string, fallback: number) {
  const value = cache.resolve(entryEntity(id), field);
  return typeof value === 'number' ? value : fallback;
}

function readBoolean(cache: Cache, id: string, field: string, fallback: boolean) {
  const value = cache.resolve(entryEntity(id), field);
  return typeof value === 'boolean' ? value : fallback;
}

function readStatus(cache: Cache, id: string) {
  const value = cache.resolve(entryEntity(id), 'status');
  return typeof value === 'string'
    ? (value as LibraryEntryStatusEnum)
    : LibraryEntryStatusEnum.Current;
}

function readRating(cache: Cache, id: string) {
  const value = cache.resolve(entryEntity(id), 'rating');
  return typeof value === 'number' ? value : null;
}

export function libraryEntryFromUpdateInput(
  input: LibraryEntryUpdateInput,
  cache: Cache,
) {
  return {
    __typename: 'LibraryEntry',
    id: input.id,
    status: input.status ?? readStatus(cache, input.id),
    progress: input.progress ?? readNumber(cache, input.id, 'progress', 0),
    rating: input.rating ?? readRating(cache, input.id),
    reconsumeCount:
      input.reconsumeCount ?? readNumber(cache, input.id, 'reconsumeCount', 0),
    reconsuming:
      input.reconsuming ?? readBoolean(cache, input.id, 'reconsuming', false),
  };
}
