import { lazy } from 'react';
import { Route } from 'react-router';

import { Path, type PathBuilder } from 'app/utils/routes';

import HeldContent from './HeldContent/HeldContentPage';

const AdminReportsPage = lazy(() => import('./Reports'));

export const pages = (
  <Route path="admin">
    <Route path="held" element={<HeldContent />} />
    <Route path="reports" element={<AdminReportsPage />} />
  </Route>
);

export const paths = {
  held: new Path('/admin/held'),
  reports: new Path('/admin/reports'),
} satisfies PathBuilder;
