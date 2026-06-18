import { lazy } from 'react';
import { Route } from 'react-router';

export { paths } from './paths';

const MangaSummaryPage = lazy(() => import('./Summary'));
const MangaChaptersPage = lazy(() => import('./Chapters'));
const MangaChapterPage = lazy(() => import('./Chapter'));
const MangaCharactersPage = lazy(() => import('./Characters'));
const MangaStaffPage = lazy(() => import('./Staff'));
const MangaReactionsPage = lazy(() => import('./Reactions'));
const MangaFranchisePage = lazy(() => import('./Franchise'));
const MangaQuotesPage = lazy(() => import('./Quotes'));
const MangaQuotePage = lazy(() => import('./Quote'));

export const pages = (
  <Route path="manga">
    <Route path=":slug">
      <Route path="" element={<MangaSummaryPage />} />
      <Route path="chapters" element={<MangaChaptersPage />} />
      <Route path="chapters/:number" element={<MangaChapterPage />} />
      <Route path="characters" element={<MangaCharactersPage />} />
      <Route path="staff" element={<MangaStaffPage />} />
      <Route path="reactions" element={<MangaReactionsPage />} />
      <Route path="franchise" element={<MangaFranchisePage />} />
      <Route path="quotes" element={<MangaQuotesPage />} />
      <Route path="quotes/:id" element={<MangaQuotePage />} />
    </Route>
  </Route>
);
