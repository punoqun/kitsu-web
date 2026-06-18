import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from 'app/components/controls/Button';
import TextInput from 'app/components/controls/TextInput';

import { useAuthModalContext } from '../Layout';
import styles from './styles.module.css';

export default function ForgotPasswordModal() {
  const { email, setEmail } = useAuthModalContext();

  return (
    <form className={styles.authForm}>
      <TextInput
        type="email"
        autoComplete="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" kind="solid" color="green">
        <FormattedMessage defaultMessage="Send password reset" />
      </Button>
    </form>
  );
}
