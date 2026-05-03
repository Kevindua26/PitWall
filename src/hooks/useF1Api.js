import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useF1Api(endpoint, params = {}, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(endpoint, { params });
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error ?? e.message ?? 'Network error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, ...deps]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
