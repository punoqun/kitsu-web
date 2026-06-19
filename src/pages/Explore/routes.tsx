import { lazy } from 'react';
import { Route } from 'react-router';

export { paths } from './paths';

const ExplorePage = lazy(() => import('./index'));

export const pages = (
  <Route path="explore">
    <Route path=":type" element={<ExplorePage />} />
  </Route>
);
