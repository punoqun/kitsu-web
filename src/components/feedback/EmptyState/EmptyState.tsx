import { type ReactNode } from 'react';
import { FaRegFolderOpen } from 'react-icons/fa';
import { FormattedMessage } from 'react-intl';

import styles from './styles.module.css';

export type EmptyStateProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
};

export default function EmptyState({
  title = (
    <FormattedMessage
      defaultMessage="Nothing to show yet"
      description="Default heading for an empty content state"
    />
  ),
  description,
  icon = <FaRegFolderOpen />,
  children,
}: EmptyStateProps) {
  return (
    <section className={styles.emptyState}>
      {icon && (
        <div className={styles.icon} aria-hidden>
          {icon}
        </div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </section>
  );
}
