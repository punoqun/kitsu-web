import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import Card from '@/components/surfaces/Card';

import styles from './styles.module.css';

export default function CommentPage() {
  const { id } = useParams<'id'>();
  invariant(id, 'Missing id on CommentPage');

  return (
    <main className={styles.page}>
      <Card className={styles.card}>
        <h1 className={styles.title}>
          <FormattedMessage
            defaultMessage="Comment details are unavailable"
            description="Heading shown when the comment detail page cannot query a comment by ID."
          />
        </h1>
        <p className={styles.message}>
          <FormattedMessage
            defaultMessage="Comment {id} cannot be loaded because the GraphQL schema does not expose a single-comment lookup yet."
            description="Explanation shown when the comment detail page has no GraphQL query root available."
            values={{ id }}
          />
        </p>
      </Card>
    </main>
  );
}
