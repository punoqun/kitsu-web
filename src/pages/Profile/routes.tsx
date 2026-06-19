import { lazy } from 'react';
import { Route } from 'react-router';

export { paths } from './paths';

const ProfileSummaryPage = lazy(() => import('./Summary'));

export const pages = (
  <Route path="users">
    <Route path=":slug">
      <Route path="" element={<ProfileSummaryPage />} />
    </Route>
  </Route>
);
