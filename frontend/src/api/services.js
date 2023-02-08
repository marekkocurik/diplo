import client from './client';

const options = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
}

export const services = {
  login: (email, password) => //overenie emailu, hesla, vratenie JWT tokenu a prihlasenie
    client.post('auth/login', { json: { email, password } }).json(),
  register: (name, surname, email, password) => //registracia noveho uctu v DB, vratenie JWT tokenu a prihlasenie
    client.post('auth/register', { json: { name, surname, email, password } }).json(),
  forgotPassword: (email) => //overenie emailu a poslanie emailu s linkom na reset hesla (tu bude treba nejaky token na overenie ze kto meni heslo)
    client.post('auth/forgot-password', { json: { email } }).json(),
  resetPassword: (password) => //overenie tokenu ktory sa vytvoril pri forgot-password, zapisanie hesla v DB a nasledne prihlasenie
    client.post('auth/reset-password', { json: { password } }).json(),
  listExercises: () =>
    client.get('home/exercises', options).json(),
};