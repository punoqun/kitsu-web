import { useAsyncFn } from 'react-use';
import { type AsyncState } from 'react-use/lib/useAsyncFn';

import { useRawSession } from 'app/contexts/SessionContext';
import useReturnToFn from 'app/hooks/useReturnToFn';
import { type LoggedInSession } from 'app/utils/session';

export default function useLoginFn<params = unknown>(
  loginFn: (params: params) => Promise<LoggedInSession>,
  params: params,
): [AsyncState<void>, () => void] {
  const returnTo = useReturnToFn('/');
  const { setSession } = useRawSession();

  return useAsyncFn(async () => {
    setSession(await loginFn(params));
    returnTo();
  }, [params]);
}
