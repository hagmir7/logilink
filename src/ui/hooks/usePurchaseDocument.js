import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import { api } from '../utils/api';

/** Loads lookups (services, users, units) and, when `id` is set, the document. */
export default function usePurchaseDocument(id) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ doc: null, services: [], users: [], units: [] });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [services, users, units, doc] = await Promise.all([
        api.get('services'),
        api.get('users/role/chef_service'),
        api.get('units'),
        id ? api.get(`purchase-documents/${id}`) : Promise.resolve(null),
      ]);
      setData({
        services: services.data || [],
        users: users.data || [],
        units: units.data || [],
        doc: doc?.data ?? null,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error(error?.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, loading, reload: load };
}
