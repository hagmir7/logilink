import axios from "axios";


const getAuthToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('authToken') || '';
  }
  return '';
};

// let baseURL;


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
