// src/features/appointments/hooks/useClientSearch.ts
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { listClientsForSelect } from '@/features/appointments';

export function useClientSearch() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const result = useQuery({
    queryKey: ['appointments', 'clients', 'search', debounced],
    queryFn: () => listClientsForSelect({ data: { q: debounced } }),
    staleTime: 60_000,
  });

  return { query, setQuery, ...result };
}