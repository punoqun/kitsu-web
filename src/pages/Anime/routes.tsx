import React from 'react';
import { Route } from 'react-router-dom';

import AnimeSummaryPage from './Summary';
export { paths } from './paths';

export const pages = (
  <Route path="anime">
    <Route path=":slug">
      <Route path="" element={<AnimeSummaryPage />} />
    </Route>
  </Route>
);
