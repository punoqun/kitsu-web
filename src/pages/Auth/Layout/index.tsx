import type React from 'react';
import { createContext, useContext, useState } from 'react';
import { useLocation, useOutlet } from 'react-router';

import AuthModalHeader from 'app/components/AuthModalHeader';
import Modal from 'app/components/Modal';

import styles from './styles.module.css';

const AuthModalContext = createContext<{
  email?: string;
  setEmail: (email: string) => void;
}>({
  setEmail: () => null,
});

export function useAuthModalContext() {
  return useContext(AuthModalContext);
}

const AuthModal = function ({
  displayMode,
}: React.ComponentProps<typeof Modal>) {
  const { state } = useLocation() as {
    state: { email?: string } | undefined;
  };
  const [email, setEmail] = useState(state?.email ?? '');
  const outlet = useOutlet();

  return (
    <AuthModalContext.Provider value={{ email, setEmail }}>
      <Modal className={styles.modal} displayMode={displayMode}>
        <AuthModalHeader email={email} />
        {outlet}
      </Modal>
    </AuthModalContext.Provider>
  );
};

export default AuthModal;
