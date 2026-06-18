import React, { useContext } from 'react';

import Header from 'app/components/Header';
import Toaster from 'app/components/Toaster/Toaster';
import { LayoutSettingsContext } from 'app/contexts/LayoutSettingsContext';

const Layout = function ({ children }: React.PropsWithChildren) {
  const { layoutSettings } = useContext(LayoutSettingsContext);

  return (
    <>
      <Header {...layoutSettings.header} />
      <Toaster />
      {children}
    </>
  );
};

export default Layout;
