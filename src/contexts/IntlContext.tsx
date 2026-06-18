import { type Locale as DateFnsLocale } from 'date-fns';
import { preferredLocale } from 'preferred-locale';
import React, { createContext, useContext, useReducer } from 'react';
import { IntlProvider, type IntlConfig } from 'react-intl';
import { useAsync, useCookie, useEvent } from 'react-use';

import translations from 'app/locales';

type LocaleState = {
  locale: string;
  setLocale: (locale: string) => void;
  unsetLocale: () => void;
};
type OnErrorFn = NonNullable<IntlConfig['onError']>;

function useLocaleState(locale?: string): LocaleState {
  const [cookie, setCookie, unsetCookie] = useCookie('chosenLocale');
  const availableLocales = Object.keys(translations);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Listen for language change
  useEvent('languagechange', forceUpdate, window);

  if (locale) {
    return { locale, setLocale: setCookie, unsetLocale: unsetCookie };
  } else if (cookie) {
    // If the user has chosen an invalid locale, delete it
    if (cookie && availableLocales.indexOf(cookie) === -1) {
      unsetCookie();
    }

    return { locale: cookie, setLocale: setCookie, unsetLocale: unsetCookie };
  } else {
    const availableLocales = Object.keys(translations);
    return {
      locale: preferredLocale('en', availableLocales),
      setLocale: setCookie,
      unsetLocale: unsetCookie,
    };
  }
}

export const LocaleContext = createContext<{
  locale: string;
  setLocale: (locale: string) => void;
  unsetLocale: () => void;
}>({
  locale: 'en',
  setLocale: () => null,
  unsetLocale: () => null,
});

// @ts-ignore We guarantee that this is actually never null
export const DateFnsLocaleContext = createContext<DateFnsLocale>(null);

const IntlContext = function ({
  children,
  locale,
}: React.PropsWithChildren<{ locale?: string }>) {
  const value = useLocaleState(locale);
  const { value: localeData } = useAsync(
    translations[value.locale].bundles.main,
  );

  const onError: OnErrorFn | undefined = import.meta.env.DEV
    ? (err: Parameters<OnErrorFn>[0]) => {
        if (err.code === 'MISSING_TRANSLATION') return;
        throw err;
      }
    : undefined;

  return localeData ? (
    <LocaleContext.Provider value={value}>
      <DateFnsLocaleContext.Provider value={localeData.dateFns}>
        <IntlProvider
          onError={onError}
          locale={value.locale}
          messages={localeData.kitsu}
          key={value.locale}
          defaultRichTextElements={{
            b: (children) => <b>{children}</b>,
          }}>
          {children}
        </IntlProvider>
      </DateFnsLocaleContext.Provider>
    </LocaleContext.Provider>
  ) : null;
};

export default IntlContext;

export function useLocale(): LocaleState {
  return useContext(LocaleContext);
}

export function useDateFnsLocale(): DateFnsLocale {
  return useContext(DateFnsLocaleContext);
}
