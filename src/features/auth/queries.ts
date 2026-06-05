import { queryOptions } from '@tanstack/react-query';
import { getSession } from '@/server/auth/getSession';

export const authKeys = {
  session: ['auth', 'session'] as const,
};

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.session,
    queryFn: () => getSession(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
