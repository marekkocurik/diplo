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

let postOptions = (body) => {
  let options = {
    json: body,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
  }
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
  changePassword: (currentPassword, newPassword) =>
    client.post('home/profile/change-password', postOptions({ currentPassword, newPassword })).json(),
  getUsername: () => //obtain Username
    client.get('home/username', { ...getOptions(), retry: 0 }).json(),
  getExerciseTree: () => //vylistovanie vsetkych chapters spolu s exercises
    client.get('home/exercise-tree', { ...getOptions(), retry: 0 }).json(),
  getExercise: (exerciseId) => //get konkretnej ulohy
    client.get('home/exercise', { ...getOptions({exerciseId}), retry: 0}).json(),
  getExerciseHistory: (exerciseId) =>
    client.get('home/exercise-history', { ...getOptions({exerciseId}), retry: 0}).json(),
  getUserExerciseSolutions: (exerciseId) =>
  client.get('home/exercise-solutions-user', { ...getOptions({exerciseId}), retry: 0}).json(),
  getQueryExpectedResult: (queryToExecute) =>
    client.get('home/query-expected-result', { ...getOptions({queryToExecute}), retry: 0 }).json(),
  getQueryTestResult: (queryToExecute, solution, exerciseId) => //get vysledku studentovho query
    client.get('home/query-test-result', { ...getOptions({queryToExecute, solution, exerciseId}), retry: 0 }).json(),
  getQuerySubmitResult: (queryToExecute, solution, exerciseId) => //get vysledku studentovho query
    client.get('home/query-submit-result', { ...getOptions({queryToExecute, solution, exerciseId}), retry: 0 }).json(),
  getHelp: (queryToExecute, exerciseId) =>
    client.get('home/get-help', { ...getOptions({queryToExecute, exerciseId}), retry: 0 }).json(),

  getHello: () =>
    client.get('hello'),
};