import { ErrorBoundary } from '@sentry/react';
import { Suspense } from 'react';
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  type Location,
} from 'react-router';

import 'app/styles/index.css';

import { SpinnerBlock } from './components/feedback/Spinner';
import GeneralErrorPage from './pages/Errors/General';
import NotFoundPage from './pages/Errors/NotFound';
import { modals, pages } from './pages/routes';

export default function Router() {
  // If the location has a background page set, we render the modal over it
  // Otherwise, we render the modal as the page itself
  const location = useLocation() as Location & {
    state: { background: Location };
  };
  const background = location.state?.background;

  return (
    <ErrorBoundary fallback={<GeneralErrorPage />}>
      <Suspense fallback={<SpinnerBlock style={{ minBlockSize: '60vh' }} />}>
        <Routes location={background || location}>
          {pages}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      {/* The modal fades in and slides up */}
      {background && (
        <Suspense fallback={null}>
          <Routes>
            {modals}
            {/* Ignore any non-modal stuff */}
            <Route path="*" element={<Outlet />} />
          </Routes>
        </Suspense>
      )}
    </ErrorBoundary>
  );
}
