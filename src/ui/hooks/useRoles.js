import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rolesApi } from '../services/rolesApi';

export default function useRoles() {
  const { user, roles: authRoles } = useAuth();

  // ----------------------------------------
  // Authenticated user roles
  // ----------------------------------------

  const hasRole = useCallback(
    (names) => {
      const list = Array.isArray(names) ? names : [names];

      if (typeof authRoles === 'function') {
        return authRoles(list);
      }

      if (Array.isArray(authRoles)) {
        return list.some((role) => authRoles.includes(role));
      }

      if (authRoles && typeof authRoles === 'object') {
        return list.some((role) => authRoles[role] === true);
      }

      return false;
    },
    [authRoles]
  );

  // ----------------------------------------
  // Roles management
  // ----------------------------------------

  const [roles, setRoles] = useState([]);
  const [selectedName, setSelectedName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----------------------------------------
  // Fetch roles
  // ----------------------------------------

  const refresh = useCallback(async (preferredName) => {
    setLoading(true);
    setError(null);

    try {
      const response = await rolesApi.list();

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setRoles(list);

      setSelectedName((previous) => {
        const choice =
          preferredName !== undefined
            ? preferredName
            : previous;

        return list.some((role) => role.name === choice)
          ? choice
          : (list[0]?.name ?? null);
      });

      return list;
    } catch (err) {
      console.error('Error fetching roles:', err);

      setError(
        err.response?.data?.message ||
        'Impossible de charger les rôles.'
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------------------
  // Load roles on mount
  // ----------------------------------------

  useEffect(() => {
    refresh().catch(console.error);
  }, [refresh]);

  // ----------------------------------------
  // Return
  // ----------------------------------------

  return {
    // Auth
    user,
    hasRole,

    // Role management
    roles,
    selectedName,
    setSelectedName,
    loading,
    error,
    refresh,
  };
}