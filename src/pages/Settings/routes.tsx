import { lazy } from 'react';
import { Route } from 'react-router';

export { paths } from './paths';

const SettingsPage = lazy(() => import('./index'));

export const pages = <Route path="settings" element={<SettingsPage />} />;
