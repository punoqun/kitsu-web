import { lazy } from 'react';
import { Route } from 'react-router';

export { paths } from './paths';

const AnimeSummaryPage = lazy(() => import('./Summary'));
const AnimeEpisodesPage = lazy(() => import('./Episodes'));
const AnimeEpisodePage = lazy(() => import('./Episode'));
const AnimeCharactersPage = lazy(() => import('./Characters'));
const AnimeStaffPage = lazy(() => import('./Staff'));
const AnimeReactionsPage = lazy(() => import('./Reactions'));
const AnimeFranchisePage = lazy(() => import('./Franchise'));
const AnimeQuotesPage = lazy(() => import('./Quotes'));
const AnimeQuotePage = lazy(() => import('./Quote'));

export const pages = (
  <Route path="anime">
    <Route path=":slug">
      <Route path="" element={<AnimeSummaryPage />} />
      <Route path="episodes" element={<AnimeEpisodesPage />} />
      <Route path="episodes/:number" element={<AnimeEpisodePage />} />
      <Route path="characters" element={<AnimeCharactersPage />} />
      <Route path="staff" element={<AnimeStaffPage />} />
      <Route path="reactions" element={<AnimeReactionsPage />} />
      <Route path="franchise" element={<AnimeFranchisePage />} />
      <Route path="quotes" element={<AnimeQuotesPage />} />
      <Route path="quotes/:id" element={<AnimeQuotePage />} />
    </Route>
  </Route>
);
