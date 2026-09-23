import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';

/** Loads data from the API and re-runs whenever `deps` change. */
export function useApi<T>(fetcher: () => Promise<T>, deps: DependencyList = []) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  const reload = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    return fetcher()
      .then((result) => {
        if (id === requestId.current) {
          setData(result);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (id === requestId.current) setError(e.message);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, error, loading, reload };
}
