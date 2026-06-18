import { Route } from 'react-router';

import MangaChapterPage from './Chapter';
import MangaChaptersPage from './Chapters';
import MangaCharactersPage from './Characters';
import MangaFranchisePage from './Franchise';
import MangaQuotePage from './Quote';
import MangaQuotesPage from './Quotes';
import MangaReactionsPage from './Reactions';
import MangaStaffPage from './Staff';
import MangaSummaryPage from './Summary';

export { paths } from './paths';

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
