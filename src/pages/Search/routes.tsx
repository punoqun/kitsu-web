import { lazy } from 'react';
import { Route } from 'react-router';

export { paths } from './paths';

const SearchPage = lazy(() => import('./index'));

export const pages = <Route path="search" element={<SearchPage />} />;
