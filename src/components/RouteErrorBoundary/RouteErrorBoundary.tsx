import {
  ErrorBoundary as SentryErrorBoundary,
  type ErrorBoundaryProps as SentryErrorBoundaryProps,
} from '@sentry/react';
import { type ReactNode } from 'react';

import { ErrorState } from '@/components/feedback/ErrorState';

export type RouteErrorBoundaryProps = {
  children: ReactNode;
  fallback?: SentryErrorBoundaryProps['fallback'];
};

function normalizeError(error: unknown) {
  return error instanceof Error ? error : undefined;
}

export default function RouteErrorBoundary({
  children,
  fallback,
}: RouteErrorBoundaryProps) {
  return (
    <SentryErrorBoundary
      fallback={
        fallback ??
        (({ error, resetError }) => (
          <ErrorState error={normalizeError(error)} onRetry={resetError} />
        ))
      }>
      {children}
    </SentryErrorBoundary>
  );
}
