import React, { Suspense } from 'react';

import { SpinnerBlock } from 'app/components/feedback/Spinner';

import styles from './styles.module.css';

const LoadingPage = () => <SpinnerBlock className={styles.pageSpinner} />;

const Page = function ({
  loading = false,
  children,
}: React.PropsWithChildren<{ loading: boolean }>) {
  return (
    <Suspense fallback={<LoadingPage />}>
      {loading ? <LoadingPage /> : children}
    </Suspense>
  );
};

export default Page;
