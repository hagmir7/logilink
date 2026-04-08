import axios from "axios";


const getAuthToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('authToken') || '';
  }
  return '';
};

let baseURL = localStorage.getItem('connection_url') || 'http://192.168.1.113/api/';

// if (import.meta.env.MODE === 'development') {
//   baseURL = 'http://localhost:8000/api/';

// } else {
//   baseURL = 'https://online.intercocina.space/api/' // : 'http://192.168.1.113/api/'
// }


export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// ── Comparatifs ──
export const getComparisons  = (page = 1) => api.get(`/quote-comparisons?page=${page}`);
export const getComparison   = (id) => api.get(`/quote-comparisons/${id}`);
export const createComparison = (data) => api.post('/quote-comparisons', data);
export const updateComparison = (id, data) => api.put(`/quote-comparisons/${id}`, data);
export const deleteComparison = (id) => api.delete(`/quote-comparisons/${id}`);
 
// ── Offres ──
export const createOffer = (compId, data) => api.post(`/quote-comparisons/${compId}/offers`, data);
export const updateOffer = (compId, offerId, data) => api.put(`/quote-comparisons/${compId}/offers/${offerId}`, data);
export const deleteOffer = (compId, offerId) => api.delete(`/quote-comparisons/${compId}/offers/${offerId}`);

export const getPdfUrl = (compId) => `/quote-comparisons/${compId}/pdf`;
 
// ── Évaluations ──
export const saveEvaluation = (compId, data) => api.post(`/quote-comparisons/${compId}/evaluations`, data);