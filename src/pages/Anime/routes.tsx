import { Route } from 'react-router';

import AnimeCharactersPage from './Characters';
import AnimeEpisodePage from './Episode';
import AnimeEpisodesPage from './Episodes';
import AnimeFranchisePage from './Franchise';
import AnimeQuotePage from './Quote';
import AnimeQuotesPage from './Quotes';
import AnimeReactionsPage from './Reactions';
import AnimeStaffPage from './Staff';
import AnimeSummaryPage from './Summary';

export { paths } from './paths';

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
