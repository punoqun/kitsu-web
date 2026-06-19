import { type ReactNode } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/controls/Button';

import styles from './styles.module.css';

const retryButtonKind = 'solid';
const retryButtonColor = 'red';
const retryButtonType = 'button';

export type ErrorStateProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  error?: Error;
  onRetry?: () => void;
};

export default function ErrorState({
  title = (
    <FormattedMessage
      defaultMessage="Something went wrong"
      description="Default heading for an error state"
    />
  ),
  description = (
    <FormattedMessage
      defaultMessage="Please try again in a few minutes."
      description="Default description for an error state"
    />
  ),
  icon = <FaExclamationTriangle />,
  children,
  error,
  onRetry,
}: ErrorStateProps) {
  return (
    <section className={styles.errorState} role="alert">
      {icon && (
        <div className={styles.icon} aria-hidden>
          {icon}
        </div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {error?.message && <p className={styles.details}>{error.message}</p>}
      {(onRetry || children) && (
        <div className={styles.actions}>
          {onRetry && (
            <Button
              kind={retryButtonKind}
              color={retryButtonColor}
              type={retryButtonType}
              onClick={onRetry}>
              <FormattedMessage
                defaultMessage="Try again"
                description="Button label for retrying after an error"
              />
            </Button>
          )}
          {children}
        </div>
      )}
    </section>
  );
}
