import client from './client';

export const services = {
  login: (email, password) =>
    client.post('auth/login', { json: { email, password } }).json(),
};