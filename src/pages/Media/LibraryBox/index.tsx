import { captureException } from '@sentry/react';
import { useState, type ChangeEvent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Button, {
  ButtonColor,
  ButtonKind,
  ButtonSize,
} from '@/components/controls/Button';
import GroupBox from '@/components/GroupBox';
import { graphql, readFragment, useMutation, type FragmentOf } from '@/graphql';

import styles from './styles.module.css';

const LibraryEntryBoxFragment = graphql(`
  fragment LibraryEntryBoxFragment on LibraryEntry {
    id
    status
    progress
    rating
    reconsumeCount
    reconsuming
  }
`);

export const LibraryBoxFragment = graphql(
  `
    fragment LibraryBoxFragment on Media {
      type
      id
      myLibraryEntry {
        ...LibraryEntryBoxFragment
        media {
          __typename
          id
        }
      }
    }
  `,
  [LibraryEntryBoxFragment],
);

const CreateLibraryEntryMutation = graphql(
  `
    mutation createLibraryEntry(
      $mediaId: ID!
      $mediaType: MediaTypeEnum!
      $status: LibraryEntryStatusEnum!
    ) {
      libraryEntry {
        create(
          input: { mediaId: $mediaId, mediaType: $mediaType, status: $status }
        ) {
          libraryEntry {
            ...LibraryEntryBoxFragment
            media {
              __typename
              id
              myLibraryEntry {
                ...LibraryEntryBoxFragment
              }
            }
          }
          errors {
            message
          }
        }
      }
    }
  `,
  [LibraryEntryBoxFragment],
);

const UpdateLibraryEntryStatusMutation = graphql(
  `
    mutation updateLibraryEntryStatus(
      $id: ID!
      $status: LibraryEntryStatusEnum!
    ) {
      libraryEntry {
        update(input: { id: $id, status: $status }) {
          libraryEntry {
            ...LibraryEntryBoxFragment
          }
          errors {
            message
          }
        }
      }
    }
  `,
  [LibraryEntryBoxFragment],
);

const UpdateLibraryEntryProgressMutation = graphql(
  `
    mutation updateLibraryEntryProgress($id: ID!, $progress: Int!) {
      libraryEntry {
        update(input: { id: $id, progress: $progress }) {
          libraryEntry {
            ...LibraryEntryBoxFragment
          }
          errors {
            message
          }
        }
      }
    }
  `,
  [LibraryEntryBoxFragment],
);

const UpdateLibraryEntryRatingMutation = graphql(
  `
    mutation updateLibraryEntryRating($id: ID!, $rating: Int!) {
      libraryEntry {
        update(input: { id: $id, rating: $rating }) {
          libraryEntry {
            ...LibraryEntryBoxFragment
          }
          errors {
            message
          }
        }
      }
    }
  `,
  [LibraryEntryBoxFragment],
);

const DeleteLibraryEntryMutation = graphql(`
  mutation deleteLibraryEntry($id: ID!) {
    libraryEntry {
      delete(input: { id: $id }) {
        libraryEntry {
          id
        }
        errors {
          message
        }
      }
    }
  }
`);

const LIBRARY_STATUSES = [
  'CURRENT',
  'PLANNED',
  'COMPLETED',
  'ON_HOLD',
  'DROPPED',
] as const;
const RATING_VALUES = Array.from({ length: 19 }, (_, index) => index + 2);

type LibraryEntryStatus = (typeof LIBRARY_STATUSES)[number];
type MediaType = 'ANIME' | 'MANGA';
type PayloadErrors = readonly { message: string }[] | null | undefined;

function toMediaType(mediaType: string): MediaType {
  return mediaType === 'MANGA' ? 'MANGA' : 'ANIME';
}

function getPayloadErrorMessage(errors: PayloadErrors) {
  if (!errors?.length) return null;
  return errors.map((error) => error.message).join('\n');
}

function capturePayloadErrors(errors: PayloadErrors) {
  errors?.forEach((error) => captureException(new Error(error.message)));
}

function formatRating(rating: number) {
  return `${rating / 2}/10`;
}

function formatStatus(
  status: LibraryEntryStatus,
  mediaType: MediaType,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
) {
  switch (status) {
    case 'COMPLETED':
      return formatMessage({
        defaultMessage: 'Completed',
        description: 'Completed library status label',
      });
    case 'CURRENT':
      return mediaType === 'ANIME'
        ? formatMessage({
            defaultMessage: 'Watching',
            description: 'Current anime library status label',
          })
        : formatMessage({
            defaultMessage: 'Reading',
            description: 'Current manga library status label',
          });
    case 'DROPPED':
      return formatMessage({
        defaultMessage: 'Dropped',
        description: 'Dropped library status label',
      });
    case 'ON_HOLD':
      return formatMessage({
        defaultMessage: 'On Hold',
        description: 'On hold library status label',
      });
    case 'PLANNED':
      return mediaType === 'ANIME'
        ? formatMessage({
            defaultMessage: 'Want to Watch',
            description: 'Planned anime library status label',
          })
        : formatMessage({
            defaultMessage: 'Want to Read',
            description: 'Planned manga library status label',
          });
  }
}

export type LibraryBoxParams = { media: FragmentOf<typeof LibraryBoxFragment> };

function AddToLibraryBox(props: LibraryBoxParams) {
  const media = readFragment(LibraryBoxFragment, props.media);
  const mediaType = toMediaType(media.type);
  const { formatMessage } = useIntl();
  const [createResult, createLibraryEntry] = useMutation(
    CreateLibraryEntryMutation,
  );
  const [pendingStatus, setPendingStatus] =
    useState<LibraryEntryStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addToLibrary = async (status: LibraryEntryStatus) => {
    setPendingStatus(status);
    const result = await createLibraryEntry({
      mediaId: media.id,
      mediaType,
      status,
    });
    const payloadErrors = result.data?.libraryEntry.create?.errors;
    const payloadErrorMessage = getPayloadErrorMessage(payloadErrors);

    if (result.error) {
      captureException(result.error);
      setError(result.error.message);
    } else if (payloadErrorMessage) {
      capturePayloadErrors(payloadErrors);
      setError(payloadErrorMessage);
    } else {
      setError(null);
    }
    setPendingStatus(null);
  };

  const isCreating = createResult.fetching || pendingStatus !== null;

  return (
    <GroupBox
      title={formatMessage({
        defaultMessage: 'Add to Library',
        description: 'Header for add to library sidebar',
      })}
      className={styles.libraryGroupBox}>
      {error ? (
        <p role="alert" className={styles.errorMessage}>
          {error}
        </p>
      ) : null}
      <Button
        kind={ButtonKind.SOLID}
        size={ButtonSize.MEDIUM}
        color={ButtonColor.GREEN}
        onClick={() => void addToLibrary('COMPLETED')}
        loading={pendingStatus === 'COMPLETED'}
        disabled={isCreating}
        className={styles.libraryButton}>
        <FormattedMessage
          defaultMessage="Completed"
          description="Action button to mark show as seen"
        />
      </Button>
      <Button
        kind={ButtonKind.SOLID}
        size={ButtonSize.MEDIUM}
        color={ButtonColor.BLUE}
        onClick={() => void addToLibrary('PLANNED')}
        loading={pendingStatus === 'PLANNED'}
        disabled={isCreating}
        className={styles.libraryButton}>
        {mediaType === 'ANIME' ? (
          <FormattedMessage
            defaultMessage="Want to Watch"
            description="Action button to mark show as want to watch"
          />
        ) : (
          <FormattedMessage
            defaultMessage="Want to Read"
            description="Action button to mark book as want to read"
          />
        )}
      </Button>
      <Button
        kind={ButtonKind.SOLID}
        size={ButtonSize.MEDIUM}
        color={ButtonColor.PURPLE}
        onClick={() => void addToLibrary('CURRENT')}
        loading={pendingStatus === 'CURRENT'}
        disabled={isCreating}
        className={styles.libraryButton}>
        {mediaType === 'ANIME' ? (
          <FormattedMessage
            defaultMessage="Started Watching"
            description="Action button to mark show as started"
          />
        ) : (
          <FormattedMessage
            defaultMessage="Started Reading"
            description="Action button to mark book as started"
          />
        )}
      </Button>
    </GroupBox>
  );
}

function EditLibraryBox(props: LibraryBoxParams) {
  const media = readFragment(LibraryBoxFragment, props.media);
  const entry = media.myLibraryEntry;
  const mediaType = toMediaType(media.type);
  const { formatMessage } = useIntl();
  const [statusResult, updateStatus] = useMutation(
    UpdateLibraryEntryStatusMutation,
  );
  const [progressResult, updateProgress] = useMutation(
    UpdateLibraryEntryProgressMutation,
  );
  const [ratingResult, updateRating] = useMutation(
    UpdateLibraryEntryRatingMutation,
  );
  const [deleteResult, deleteLibraryEntry] = useMutation(
    DeleteLibraryEntryMutation,
  );
  const [error, setError] = useState<string | null>(null);

  if (!entry) return null;

  const libraryEntry = readFragment(LibraryEntryBoxFragment, entry);

  const handlePayload = (payloadErrors: PayloadErrors) => {
    const payloadErrorMessage = getPayloadErrorMessage(payloadErrors);
    if (!payloadErrorMessage) {
      setError(null);
      return;
    }
    capturePayloadErrors(payloadErrors);
    setError(payloadErrorMessage);
  };

  const onStatusChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value as LibraryEntryStatus;
    const result = await updateStatus({ id: libraryEntry.id, status });
    if (result.error) {
      captureException(result.error);
      setError(result.error.message);
      return;
    }
    handlePayload(result.data?.libraryEntry.update?.errors);
  };

  const onProgressIncrement = async () => {
    const result = await updateProgress({
      id: libraryEntry.id,
      progress: libraryEntry.progress + 1,
    });
    if (result.error) {
      captureException(result.error);
      setError(result.error.message);
      return;
    }
    handlePayload(result.data?.libraryEntry.update?.errors);
  };

  const onRatingChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) return;
    const result = await updateRating({
      id: libraryEntry.id,
      rating: Number(event.target.value),
    });
    if (result.error) {
      captureException(result.error);
      setError(result.error.message);
      return;
    }
    handlePayload(result.data?.libraryEntry.update?.errors);
  };

  const onDelete = async () => {
    const result = await deleteLibraryEntry({ id: libraryEntry.id });
    if (result.error) {
      captureException(result.error);
      setError(result.error.message);
      return;
    }
    handlePayload(result.data?.libraryEntry.delete?.errors);
  };

  const isMutating =
    statusResult.fetching ||
    progressResult.fetching ||
    ratingResult.fetching ||
    deleteResult.fetching;

  return (
    <GroupBox
      title={formatMessage({
        defaultMessage: 'Edit Library',
        description: 'Header for library entry edit sidebar',
      })}
      className={styles.libraryGroupBox}>
      {error ? (
        <p role="alert" className={styles.errorMessage}>
          {error}
        </p>
      ) : null}
      <p className={styles.libraryMeta}>
        <FormattedMessage
          defaultMessage="Current status: {status}"
          description="Text showing the current library entry status"
          values={{
            status: formatStatus(
              libraryEntry.status,
              mediaType,
              formatMessage,
            ),
          }}
        />
      </p>
      <label className={styles.libraryField}>
        <span className={styles.libraryLabel}>
          <FormattedMessage
            defaultMessage="Status"
            description="Label for changing library entry status"
          />
        </span>
        <select
          className={styles.librarySelect}
          value={libraryEntry.status}
          onChange={(event) => void onStatusChange(event)}
          disabled={isMutating}>
          {LIBRARY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status, mediaType, formatMessage)}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.libraryActions}>
        <p className={styles.libraryMeta}>
          <FormattedMessage
            defaultMessage="Progress: {progress}"
            description="Text showing the current library entry progress"
            values={{ progress: libraryEntry.progress }}
          />
        </p>
        <Button
          kind={ButtonKind.OUTLINE}
          size={ButtonSize.SMALL}
          color={ButtonColor.PURPLE}
          onClick={() => void onProgressIncrement()}
          loading={progressResult.fetching}
          disabled={isMutating}
          className={styles.libraryButton}>
          <FormattedMessage
            defaultMessage="Increase Progress"
            description="Button to increment library entry progress"
          />
        </Button>
      </div>
      <label className={styles.libraryField}>
        <span className={styles.libraryLabel}>
          <FormattedMessage
            defaultMessage="Rating"
            description="Label for changing library entry rating"
          />
        </span>
        <select
          className={styles.librarySelect}
          value={libraryEntry.rating ?? ''}
          onChange={(event) => void onRatingChange(event)}
          disabled={isMutating}>
          <option value="">
            <FormattedMessage
              defaultMessage="Not Rated"
              description="Placeholder for an unrated library entry"
            />
          </option>
          {RATING_VALUES.map((rating) => (
            <option key={rating} value={rating}>
              {formatRating(rating)}
            </option>
          ))}
        </select>
      </label>
      <Button
        kind={ButtonKind.OUTLINE}
        size={ButtonSize.SMALL}
        color={ButtonColor.RED}
        onClick={() => void onDelete()}
        loading={deleteResult.fetching}
        disabled={isMutating}
        className={styles.libraryButton}>
        <FormattedMessage
          defaultMessage="Remove from Library"
          description="Button to remove an entry from the user's library"
        />
      </Button>
    </GroupBox>
  );
}

export default function LibraryBox(props: LibraryBoxParams) {
  const media = readFragment(LibraryBoxFragment, props.media);

  if (!media.myLibraryEntry) {
    return <AddToLibraryBox {...props} />;
  } else {
    return <EditLibraryBox {...props} />;
  }
}
