import { useCallback, useEffect, useRef, useState } from 'react';

import { loadHomepage, type HomepageResult } from '../services/homepage/loadHomepage';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; result: HomepageResult };

export function useHomepage() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  const run = useCallback(async (force: boolean) => {
    try {
      const result = await loadHomepage({ force });
      if (mounted.current) setState({ status: 'ready', result });
    } catch (err) {
      if (!mounted.current) return;
      const message = err instanceof Error ? err.message : String(err);
      setState((prev) => (prev.status === 'ready' && force ? prev : { status: 'error', message }));
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    run(false);
    return () => {
      mounted.current = false;
    };
  }, [run]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await run(true);
    if (mounted.current) setRefreshing(false);
  }, [run]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    run(true);
  }, [run]);

  return { state, refreshing, refresh, retry };
}
