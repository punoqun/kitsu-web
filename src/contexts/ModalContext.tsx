import React, { createContext } from 'react';

export const IsModalContext = createContext<boolean>(false);

export const IsModalContextProvider = function ({
  children,
}: React.PropsWithChildren) {
  return (
    <IsModalContext.Provider value={true}>{children}</IsModalContext.Provider>
  );
};
