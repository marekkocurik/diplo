import client from './client';

let getOptions = (params) => {
  let options = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    searchParams: params
  };
  return options;
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
  getExerciseTree: () => //vylistovanie vsetkych chapters spolu s exercises
    client.get('home/exercise-tree', getOptions()).json(),
  getExercise: (exercise_id) => //get konkretnej ulohy
    client.get('home/exercise', getOptions({exercise_id})).json(),
  getQueryResult: (queryToExecute) => //get vysledku studentovho query
    client.get('home/query-result', getOptions({queryToExecute})).json(),
  getExpectedResult: (exercise_id) => //get vysledku studentovho query
    client.get('home/expected-result', getOptions({exercise_id})).json(),
};