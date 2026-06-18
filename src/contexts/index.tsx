import type React from 'react';

import { ToasterContextProvider } from 'app/components/Toaster/Context';

import { AccountContextProvider } from './AccountContext';
import IntlProvider from './IntlContext';
import { SessionContextProvider } from './SessionContext';
import UrqlContextProvider from './UrqlContext';

const ApplicationContext = function ({ children }: React.PropsWithChildren) {
  return (
    <SessionContextProvider>
      <UrqlContextProvider>
        <IntlProvider>
          <AccountContextProvider>
            <ToasterContextProvider>{children}</ToasterContextProvider>
          </AccountContextProvider>
        </IntlProvider>
      </UrqlContextProvider>
    </SessionContextProvider>
  );
};
export default ApplicationContext;
