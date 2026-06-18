import { isEqual, merge } from 'lodash-es';
import type React from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type PartialDeep } from 'type-fest';

import { type HeaderProps } from '@/components/Header/Header';

type LayoutSettings = {
  header: HeaderProps;
};

const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  header: {},
};

type LayoutSettingsContextType = {
  layoutSettings: LayoutSettings;
  setLayoutSettings: (newLayoutSettings: LayoutSettings) => void;
};

export const LayoutSettingsContext =
  createContext<LayoutSettingsContextType>({
    layoutSettings: DEFAULT_LAYOUT_SETTINGS,

    setLayoutSettings: () => {},
  });

export const LayoutSettingsContextProvider = function ({
  children,
}: React.PropsWithChildren) {
  const [layoutSettings, setLayoutSettings] = useState(DEFAULT_LAYOUT_SETTINGS);

  return (
    <LayoutSettingsContext.Provider
      value={{
        layoutSettings,
        setLayoutSettings,
      }}>
      {children}
    </LayoutSettingsContext.Provider>
  );
};

export const useLayoutSettings = function (
  settings: PartialDeep<LayoutSettings>,
): void {
  const { layoutSettings, setLayoutSettings } = useContext(
    LayoutSettingsContext,
  );

  // Ensure the settings are actually being changed before updating
  const mergedLayoutSettings = useMemo(
    () => merge({}, DEFAULT_LAYOUT_SETTINGS, layoutSettings, settings),
    [layoutSettings, settings],
  );

  useEffect(() => {
    if (!isEqual(layoutSettings, mergedLayoutSettings)) {
      return setLayoutSettings(mergedLayoutSettings);
    }
  }, [layoutSettings, mergedLayoutSettings, setLayoutSettings]);
};

export const HeaderSettings = function ({
  background,
  scrollBackground,
}: HeaderProps) {
  useLayoutSettings(
    useMemo(
      () => ({ header: { background, scrollBackground } }),
      [background, scrollBackground],
    ),
  );

  return <></>;
};
