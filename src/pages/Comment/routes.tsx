import { lazy } from 'react';
import { Route } from 'react-router';

const CommentPage = lazy(() => import('./index'));

export const pages = (
  <Route path="comments">
    <Route path=":id" element={<CommentPage />} />
  </Route>
);
