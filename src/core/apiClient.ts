import axios from 'axios';

export const apiClient = axios.create({
  withCredentials: true,
  headers: { sourceapp: 'sampark' },
});

export function configureApiClient(csrfToken: string) {
  apiClient.defaults.headers.common['X-CSRF-Token'] = csrfToken;
}
