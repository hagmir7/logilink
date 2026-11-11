import { api } from "../utils/api";

const unwrap = (response) => response.data?.data ?? response.data;
const segment = (value) => encodeURIComponent(value);

export const rolesApi = {
  list: async () => unwrap(await api.get('roles')),
  get: async (name) => unwrap(await api.get(`roles/${segment(name)}`)),
  create: async (name) => unwrap(await api.post('roles', { name })),
  rename: async (oldName, name) => unwrap(await api.put(`roles/${segment(oldName)}`, { name })),
  remove: async (name) => api.delete(`roles/${segment(name)}`),
  permissions: async () => unwrap(await api.get('permissions')),
  sync: async (name, permissions) => unwrap(await api.put(`roles/${segment(name)}/permissions`, { permissions })),
};

export function apiError(error, fallback = 'Une erreur est survenue.') {
  const errors = error.response?.data?.errors;
  return error.response?.data?.message || (errors ? Object.values(errors).flat()[0] : null) || fallback;
}
