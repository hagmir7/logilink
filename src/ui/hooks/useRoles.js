import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/** Normalises the different shapes `authContext.roles` can have. */
export default function useRoles() {
  const { user, roles } = useAuth();

  const hasRole = useCallback(
    (names) => {
      const list = Array.isArray(names) ? names : [names];
      if (typeof roles === 'function') return roles(list);
      if (Array.isArray(roles)) return list.some((r) => roles.includes(r));
      if (roles && typeof roles === 'object') return list.some((r) => roles[r] === true);
      return false;
    },
    [roles]
  );

  return { user, hasRole };
}
