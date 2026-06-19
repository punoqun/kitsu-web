import { lazy } from 'react';
import { Route } from 'react-router';

const HomePage = lazy(() => import('./index'));

export const pages = <Route index element={<HomePage />} />;
