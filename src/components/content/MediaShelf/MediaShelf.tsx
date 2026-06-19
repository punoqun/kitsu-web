import { Children, useId, type ReactNode } from 'react';

import styles from './styles.module.css';

export default function MediaShelf({
  title,
  children,
  empty,
}: {
  title: ReactNode;
  children?: ReactNode;
  empty?: ReactNode;
}) {
  const headingId = useId();
  const items = Children.toArray(children).filter(Boolean);

  return (
    <section className={styles.shelf} aria-labelledby={headingId}>
      <h2 className={styles.title} id={headingId}>
        {title}
      </h2>

      {items.length > 0 ? (
        <ul className={styles.scroller} tabIndex={0}>
          {items.map((child, index) => (
            <li className={styles.item} key={index}>
              {child}
            </li>
          ))}
        </ul>
      ) : empty ? (
        <p className={styles.empty}>{empty}</p>
      ) : null}
    </section>
  );
}
