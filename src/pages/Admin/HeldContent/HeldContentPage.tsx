import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Container from '@/components/utils/Container';
import { graphql, useQuery } from '@/graphql';

import HeldComment, { HeldCommentFragment } from './HeldComment';
import HeldMediaReaction, {
  HeldMediaReactionFragment,
} from './HeldMediaReaction';
import HeldPost, { HeldPostFragment } from './HeldPost';
import styles from './styles.module.css';

const HeldContentQuery = graphql(
  `
    query HeldContentQuery($first: Int!, $after: String) {
      heldForModeration(first: $first, after: $after) {
        edges {
          node {
            __typename
            id
            ...HeldPostFragment
            ...HeldCommentFragment
            ...HeldMediaReactionFragment
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
  [HeldPostFragment, HeldCommentFragment, HeldMediaReactionFragment],
);

export default function HeldContentPage() {
  const [after, setAfter] = useState('');

  const [{ data, fetching, error, stale }] = useQuery({
    query: HeldContentQuery,
    variables: { first: 50, after },
    suspense: false,
    requestPolicy: 'network-only',
  });

  const items = data?.heldForModeration;

  return (
    <Container className={styles.HeldItemsList}>
      {stale && <p>Stale data...</p>}

      {error && <p>Oh no... {error.message}</p>}

      {fetching && <p>Loading...</p>}

      {items?.edges && (
        <>
          {items.edges.map((edge) => {
            const node = edge?.node;
            if (!node) return null;

            const key = String(node.id);

            return node.__typename === 'Post' ? (
              <HeldPost post={node} key={key} />
            ) : node.__typename === 'Comment' ? (
              <HeldComment comment={node} key={key} />
            ) : node.__typename === 'MediaReaction' ? (
              <HeldMediaReaction reaction={node} key={key} />
            ) : null;
          })}

          {items.pageInfo.hasNextPage && (
            <button onClick={() => setAfter(items.pageInfo.endCursor ?? '')}>
              <FormattedMessage defaultMessage="load more" />
            </button>
          )}
        </>
      )}
    </Container>
  );
}
