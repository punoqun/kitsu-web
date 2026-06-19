import { lazy } from 'react';
import { Route } from 'react-router';

const PostPage = lazy(() => import('./Post'));

export const pages = (
  <Route path="posts">
    <Route path=":id" element={<PostPage />} />
  </Route>
);
