import { lazy } from 'react';
import { Route } from 'react-router';

export { paths } from './paths';

const ProfileSummaryPage = lazy(() => import('./Summary'));
const ProfileLibraryPage = lazy(() => import('./Library'));
const ProfileReactionsPage = lazy(() => import('./Reactions'));
const ProfileReviewsPage = lazy(() => import('./Reviews'));
const ProfileFollowersPage = lazy(() => import('./Followers'));
const ProfileFollowingPage = lazy(() => import('./Following'));

export const pages = (
  <Route path="users">
    <Route path=":slug">
      <Route path="" element={<ProfileSummaryPage />} />
      <Route path="library/:type" element={<ProfileLibraryPage />} />
      <Route path="reactions" element={<ProfileReactionsPage />} />
      <Route path="reviews" element={<ProfileReviewsPage />} />
      <Route path="followers" element={<ProfileFollowersPage />} />
      <Route path="following" element={<ProfileFollowingPage />} />
    </Route>
  </Route>
);
