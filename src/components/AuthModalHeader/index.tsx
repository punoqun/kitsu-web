import type React from 'react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router';

import Logo from 'app/assets/logo.svg?react';
import ModalLink from 'app/components/ModalLink';

import styles from './styles.module.css';

const AuthModalHeader: React.FC<{
  email?: string;
  password?: string;
}> = function ({ email, password }) {
  const state = { email, password };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <nav>
        <ul className={styles.navList}>
          <li>
            <ModalLink
              component={NavLink}
              to={{ pathname: '/auth/sign-up' }}
              state={state}
              className={styles.navLink}
            >
              <FormattedMessage defaultMessage="Sign Up" />
            </ModalLink>
          </li>
          <li>
            <ModalLink
              component={NavLink}
              to={{ pathname: '/auth/sign-in' }}
              state={state}
              className={styles.navLink}
            >
              <FormattedMessage defaultMessage="Sign In" />
            </ModalLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default AuthModalHeader;
