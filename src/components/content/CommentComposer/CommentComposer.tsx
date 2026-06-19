import { useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@/components/controls/Button';
import Card from '@/components/surfaces/Card';
import {
  graphql,
  useMutation,
  type ResultOf,
  type VariablesOf,
} from '@/graphql';

import styles from './styles.module.css';

const CreateCommentMutation = graphql(`
  mutation CreateCommentMutation(
    $content: String!
    $postId: ID!
    $parentId: ID
  ) {
    comment {
      create(
        input: { content: $content, postId: $postId, parentId: $parentId }
      ) {
        result {
          id
        }
        errors {
          __typename
        }
      }
    }
  }
`);

type CreateCommentResult = ResultOf<typeof CreateCommentMutation>;
type CreateCommentVariables = VariablesOf<typeof CreateCommentMutation>;

export default function CommentComposer({
  postId,
  parentId,
  onCommented,
}: {
  postId: string;
  parentId?: string;
  onCommented?: () => void;
}) {
  const textareaId = useId();
  const { formatMessage } = useIntl();
  const [content, setContent] = useState('');
  const [hasError, setHasError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, createComment] = useMutation<
    CreateCommentResult,
    CreateCommentVariables
  >(CreateCommentMutation);

  const trimmedContent = content.trim();
  const isSubmitting = submitting || result.fetching;

  const submitComment = async () => {
    if (!trimmedContent || isSubmitting) return;

    setHasError(false);
    setSubmitting(true);

    const variables: CreateCommentVariables = parentId
      ? { content: trimmedContent, postId, parentId }
      : { content: trimmedContent, postId };

    const mutationResult = await createComment(variables);
    const payload = mutationResult.data?.comment.create;

    setSubmitting(false);

    if (mutationResult.error || !payload || payload.errors?.length) {
      setHasError(true);
      return;
    }

    setContent('');
    onCommented?.();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitComment();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) return;

    event.preventDefault();
    void submitComment();
  };

  return (
    <Card className={styles.card}>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label} htmlFor={textareaId}>
          <FormattedMessage
            defaultMessage="Add a comment"
            description="Label for the comment composer text field."
          />
        </label>
        <textarea
          id={textareaId}
          className={styles.textarea}
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            if (hasError) setHasError(false);
          }}
          onKeyDown={onKeyDown}
          placeholder={formatMessage({
            defaultMessage: 'Write a comment…',
            description: 'Placeholder text for the comment composer.',
          })}
          aria-label={formatMessage({
            defaultMessage: 'Add a comment',
            description: 'Accessible label for the comment composer text area.',
          })}
          disabled={isSubmitting}
        />
        {hasError ? (
          <p role="alert" className={styles.error}>
            <FormattedMessage
              defaultMessage="We could not post your comment. Please try again."
              description="Generic error shown when creating a comment fails."
            />
          </p>
        ) : null}
        <div className={styles.actions}>
          <Button
            type="submit"
            kind="solid"
            color="green"
            loading={isSubmitting}
            disabled={!trimmedContent || isSubmitting}>
            <FormattedMessage
              defaultMessage="Post comment"
              description="Submit button label for the comment composer."
            />
          </Button>
        </div>
      </form>
    </Card>
  );
}
