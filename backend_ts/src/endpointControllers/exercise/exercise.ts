import { Exercise, TreeExercise } from '../../databaseControllers/exercisesController';
import { queryToUpperCase } from '../ast/lexicalAnalysis/analyzer';
import {
  GeneralResponse,
  LeaderboardAttemptItem,
  LeaderboardExecTimeItem,
} from '../../databaseControllers/databaseController';
import { Solution_ID_OriginalQuery } from '../../databaseControllers/solutionsController';
import { TreeChapter } from '../../databaseControllers/chaptersController';
import { ExerciseFinished, ExerciseStartedOrSolved } from '../../databaseControllers/usersToExercisesController';
import {
  exercisesController,
  solutionsController,
  answersController,
  chaptersController,
  usersToExercisesController,
  executeQuery,
  QueryTestResponse,
  testQueries,
  editQueryToSecondScheme,
  proccessNewSolution,
  processNewAnswerReturningId,
  getUsersToExercisesId,
  updateUsersToExerciseToSolved,
  databaseController,
} from './exerciseFunctions';
import { LeaderboardAttempts, LeaderboardExecTime } from '../../databaseControllers/answersController';
import { userController } from '../auth/auth';

type ExerciseTreeResponse =
  | [GeneralResponse, TreeChapter[]]
  | [GeneralResponse, TreeExercise[]]
  | [GeneralResponse, ExerciseStartedOrSolved[]]
  | [GeneralResponse, ExerciseFinished[]];

type ExerciseResponse = [GeneralResponse, Exercise] | [GeneralResponse, Solution_ID_OriginalQuery];

type QueryTestResultResponse =
  | [GeneralResponse, QueryTestResponse]
  | [GeneralResponse, number | undefined]
  | GeneralResponse;

type QuerySubmitResultResponse = [GeneralResponse, QueryTestResponse] | [GeneralResponse, number] | GeneralResponse;

type OverallLeaderboardResponse =
  | [GeneralResponse, LeaderboardAttemptItem[]]
  | [GeneralResponse, LeaderboardExecTimeItem[]];

export const getExerciseTree = async (request: any, reply: any) => {
  const user_id = request.query.id;
  let response: ExerciseTreeResponse;
  try {
    response = await chaptersController.getAllChapters();
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    let chapters = response[1] as TreeChapter[];
    let i = 1;
    for (let chapter of chapters) {
      response = await exercisesController.getTreeExercisesByChapterId(chapter.id);
      if (response[0].code !== 200) {
        reply.code(response[0].code).send({ message: response[0].message });
        return;
      }
      let exercises = response[1] as TreeExercise[];
      let j = 1;
      for (let exercise of exercises) exercise._id = j++;
      chapter._id = i++;
      chapter.exercises = exercises;
    }
    response = await usersToExercisesController.getSolvedExercisesByUserId(user_id);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    let exercises_solved = response[1] as ExerciseStartedOrSolved[];
    for (let c of chapters) {
      c.solved = true;
      for (let e of c.exercises) {
        let o = exercises_solved.find((item) => item.exercise_id === e.id);
        e.solved = o === undefined ? false : true;
        if (c.solved && !e.solved) c.solved = false;
      }
    }
    response = await usersToExercisesController.getStartedExercisesByUserId(user_id);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    let exercises_started = response[1] as ExerciseStartedOrSolved[];
    for (let c of chapters) {
      for (let e of c.exercises) {
        let o = exercises_started.find((item) => item.exercise_id === e.id);
        e.started = o === undefined ? false : true;
      }
    }
    response = await usersToExercisesController.getFinishedExercisesByUserId(user_id);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    let exercises_finished = response[1] as ExerciseFinished[];
    for (let c of chapters) {
      for (let e of c.exercises) {
        let o = exercises_finished.find((item) => item.exercise_id === e.id);
        e.finished = o === undefined ? null : o.finished;
      }
    }
    reply.code(200).send({ message: 'OK', tree: chapters });
    return;
  } catch (error) {
    reply.code(500).send({ message: 'Unknown error occured while trying to receive exercise tree' });
    return;
  }
};

export const getExercise = async (request: any, reply: any) => {
  const { exerciseId } = request.query;
  let response: ExerciseResponse;
  try {
    response = await exercisesController.getExerciseById(exerciseId);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    let exercise = response[1] as Exercise;
    response = await solutionsController.getExerciseExpectedSolutionOriginalQueryByExerciseId(exerciseId);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    let resp = {
      ...exercise,
      solution: response[1].original_query,
    };
    reply.code(200).send({ message: 'OK', exercise: resp });
    return;
  } catch (error) {
    reply.code(500).send({ message: 'Unknown error occured while trying to receive exercise info' });
    return;
  }
};

export const getExerciseHistory = async (request: any, reply: any) => {
  const { exerciseId } = request.query;
  const user_id = request.query.id;
  try {
    let response = await answersController.getAllUserExerciseAnswersByExerciseIdAndUserId(exerciseId, user_id);
    reply.code(response[0].code).send({ message: response[0].message, answers: response[1] });
    return;
  } catch (error) {
    reply.code(500).send({
      message: "Unknown error occured while trying to obtain user's query history for Exercise: " + exerciseId,
    });
    return;
  }
};

export const getUserExerciseSolutions = async (request: any, reply: any) => {
  const { exerciseId } = request.query;
  const user_id = request.query.id;
  try {
    let response = await answersController.getAllUserExerciseSolutionAnswersByUserIdAndExerciseId(user_id, exerciseId);
    reply.code(response[0].code).send({ message: response[0].message, solutions: response[1] });
    return;
  } catch (error) {
    reply.code(500).send({
      message: "Unknown error occured while trying to obtain user's solution Answers for Exercise id: " + exerciseId,
    });
    return;
  }
};

export const getQueryExpectedResult = async (request: any, reply: any) => {
  const { role, queryToExecute } = request.query;
  let response = await executeQuery(role, queryToExecute, 'get', 'expected');
  reply.code(response[0].code).send({ message: response[0].message, queryResultInfo: response[1] });
  return;
};

/**
 * Funkcia getQueryTestResult je volana v pripade ze pouzivatel testuje svoj dopyt. 
 * Najskor sa pomocou funkcie testQueries otestuje pouzivatelov dopyt a dopyt vzrovoreho riesenia. 
 * Ak je pouzivatelov dopyt prazdny alebo nastala chyba v pripojeni na databazu, pouzivatel je na to upozorneny.
 * Ak sa vsak podari vykonat oba dopyty, v ramci testQueries sa kontroluje typ dopytu. Ak ide o iny dopyt ako SELECT,
 * vykona sa tiez SELECT * nad tabulkou, ktorej sa dopyt tyka, cim sa ziska vysledny stav danej tabulky po
 * pouzivatelovom dopyte.
 * Po ziskani vysledkov dopytov sa tieto vysledky zasifruju pomocou SHA1 a sifry sa porovnaju cim sa ziska
 * vysledok testovania dopytu.
 * Vysledok testu moze byt ERROR (v pripade syntaktickej chyby), WRONG (v pripade nezhody sifier vysledkov)
 * alebo PARTIAL (v pripade zhody sifier vysledkov). Tato hodnota je na webovom rozhrani zobrazena v
 * tabulke History v stlpci Success.
 * Nasledne sa pomocou funkcie processNewAnswerReturningId zapise novy zaznam do tabulky answers, pre udrzanie
 * historie pouzivatelov dopytov.
 * Nakoniec je pouzivatel oboznameny s vysledkom testovania jeho dopytu.
 */ 
export const getQueryTestResult = async (request: any, reply: any) => {
  const { role, exerciseId, queryToExecute, solution } = request.query;
  const user_id = request.query.id;
  let response: QueryTestResultResponse;
  response = await testQueries(role, solution, queryToExecute, 'test');
  if (response[0].code === 403 || response[0].code === 500) {
    reply.code(response[0].code).send({ message: response[0].message });
    return;
  }
  const queryTestResult: [GeneralResponse, QueryTestResponse] = response;
  let solutionSuccess = response[0].code === 400 ? 'ERROR' : response[1].queriesResultsMatch ? 'PARTIAL' : 'WRONG';
  response = await processNewAnswerReturningId(
    user_id,
    exerciseId,
    queryToExecute,
    solutionSuccess,
    false,
    queryTestResult[1].executionTime
  );
  if (response[0].code !== 200) {
    reply.code(response[0].code).send({ message: response[0].message });
    return;
  }
  let queryResultInfo = {
    id: response[1] as number,
    queryResult: queryTestResult[1].queryResult,
    solutionSuccess,
  };
  reply.code(queryTestResult[0].code).send({ message: queryTestResult[0].message, queryResultInfo });
  return;
};

/**
 * Funkcia getQuerySubmitResult je volana v pripade, ze pouzivatel odovzdava svoj dopyt.
 * Najskor sa dopyt testuje rovnako ako pri testovani pomocou funkcie testQueries. Ak je vysledkom testovania
 * hodnota PARTIAL, proces odovzdavania pokracuje. Inak je pouzivatel upozorneny na ci uz syntakticku chybu,
 * nespravny dopyt, alebo moze odovzdavanie zlyhat aj v pripade chyby s pripojenim na databazu.
 * Ak je teda vysledkom PARTIAL, pouzivatelov dopyt aj vzorovy dopyt sa pomocou funkcie editQueryToSecondScheme
 * upravia pomocou regularnych vyrazov. Pri uprave sa zmeni schema z cd na cd2 a dopyty su opat testovane.
 * Ak maju dopyty rovnake vysledky aj pre sekundarnu schemu, v databaze sa zaznamena, ze pouzivatel vyriesil
 * ulohu a nasledne sa jeho riesenie porovnava s existujucimi rieseniami. Ak je pouzivatelovo riesenie unikatne,
 * ulozi ako nove vzorove riesenie.
 * V ramci odovzdavania sa tiez prepocita pouzivatelov priemer v pocte pokusov o odovzdanie riesenia, aby sa 
 * mu pripadne upravil zhluk, v ktorom sa nachadza.
 * Nakoniec je pouizivatel oboznameny s vysledkom odovzdania
 */
export const getQuerySubmitResult = async (request: any, reply: any) => {
  const { role, exerciseId, solution, cluster } = request.query;
  let { queryToExecute } = request.query;
  const user_id = request.query.id;
  const uppercaseQuery = queryToUpperCase(queryToExecute);
  let response: QuerySubmitResultResponse;

  response = await testQueries(role, solution, queryToExecute, 'test');
  if (response[0].code === 403 || response[0].code === 500) {
    reply.code(response[0].code).send({ message: response[0].message });
    return;
  }
  const queryTestResultPrimaryDatabase = response as [GeneralResponse, QueryTestResponse];
  let solutionSuccess = response[0].code === 400 ? 'ERROR' : response[1].queriesResultsMatch ? 'PARTIAL' : 'WRONG';

  if (queryTestResultPrimaryDatabase[0].code === 200 && solutionSuccess === 'PARTIAL') {
    const editedSolutionQuery = editQueryToSecondScheme(solution);
    const editedStudentQuery = editQueryToSecondScheme(uppercaseQuery);
    response = await testQueries(role, editedSolutionQuery, editedStudentQuery, 'submit');
    if (response[0].code === 500) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    } else if (response[0].code === 200) {
      const res = response[0];
      let queryResultInfo = {
        solutionSuccess: 'COMPLETE',
        queryResult: response[1].queryResult,
      };
      response = await processNewAnswerReturningId(
        user_id,
        exerciseId,
        queryToExecute,
        'COMPLETE',
        true,
        queryTestResultPrimaryDatabase[1].executionTime
      );
      if (response[0].code !== 200) {
        reply.code(response[0].code).send({ message: response[0].message });
        return;
      }

      response = await updateUsersToExerciseToSolved(user_id, exerciseId);
      if (response.code !== 200) {
        reply.code(response.code).send({ message: response.message });
        return;
      }

      response = await proccessNewSolution(exerciseId, queryToExecute);
      if (response.code !== 200) {
        // TODO: user case: solution je spravne, ale nejde ulozit - co s tym chcem spravit? Mozem vytvorit nejaky proces, ktory raz za cas prebehne answers a porovna, ci vsetky success = 'COMPLETE' su aj v users.solutions
        // let res = {
        //   message: 'Solution is correct, but it could not be saved.',
        // };
      }
      checkAverageSubmitAttempts(user_id, cluster);
      reply.code(res.code).send({ message: res.message, queryResultInfo });
      return;
    } else solutionSuccess = 'ERROR';
  }

  //200-WRONG / 400-ERROR
  response = await processNewAnswerReturningId(
    user_id,
    exerciseId,
    queryToExecute,
    solutionSuccess,
    true,
    queryTestResultPrimaryDatabase[1].executionTime
  );
  if (response[0].code !== 200) {
    reply.code(response[0].code).send({ message: response[0].message });
    return;
  }
  const answer_id = response[1] as number;
  let queryResultInfo = {
    id: answer_id,
    solutionSuccess,
    queryResult:
      queryTestResultPrimaryDatabase[0].code === 400 ? undefined : queryTestResultPrimaryDatabase[1].queryResult,
  };
  reply
    .code(queryTestResultPrimaryDatabase[0].code)
    .send({ message: queryTestResultPrimaryDatabase[0].message, queryResultInfo });
  return;
};

export const updateShowSolutions = async (request: any, reply: any) => {
  const { exerciseId } = request.body;
  const user_id = request.query.id;
  try {
    let response = await usersToExercisesController.updateToFinished(user_id, exerciseId);
    reply.code(response.code).send({ message: response.message });
    return;
  } catch (error) {
    reply.code(500).send({ message: 'Something went wrong while trying to update exercise to finished' });
    return;
  }
};

type ExerciseLeaderboardResponse = [GeneralResponse, LeaderboardExecTime[]] | [GeneralResponse, LeaderboardAttempts[]];

export const getExerciseLeaderboard = async (request: any, reply: any) => {
  const { exerciseId } = request.query;
  try {
    let response: ExerciseLeaderboardResponse;
    response = await answersController.getExerciseLeaderboardExecTimeByExerciseId(exerciseId);
    const byTime = response[1] as LeaderboardExecTime[];
    response = await answersController.getExerciseLeaderboardAttemptsByExerciseId(exerciseId);
    const byAttempts = response[1] as LeaderboardAttempts[];
    if (byTime.length === 0 || byAttempts.length === 0) {
      reply.code(500).send({
        message: 'Something went wrong while trying to get exercise leaderboards',
        leaderboards: { byTime: [], byAttempts: [] },
      });
      return;
    }
    reply.code(200).send({ message: 'OK', leaderboards: { byTime, byAttempts } });
    return;
  } catch (error) {
    reply.code(500).send({
      message: 'Something went wrong while trying to get exercise leaderboards',
      leaderboards: { byTime: [], byAttempts: [] },
    });
    return;
  }
};

export const getLeaderboard = async (request: any, reply: any) => {
  try {
    let response: OverallLeaderboardResponse;
    response = await databaseController.getOverallLeaderboardAttempts();
    const byAttempts = response[1];
    response = await databaseController.getOverallLeaderboardExecTime();
    const byTime = response[1];
    if (byTime.length === 0 || byAttempts.length === 0) {
      reply.code(500).send({
        message: 'Something went wrong while trying to get exercise leaderboards',
        leaderboards: { byTime: [], byAttempts: [] },
      });
      return;
    }
    reply.code(200).send({ message: 'OK', leaderboards: { byTime, byAttempts } });
    return;
  } catch (error) {
    reply.code(500).send({
      message: 'Something went wrong while trying to get overall leaderboard',
      leaderboards: { byTime: [], byAttempts: [] },
    });
    return;
  }
};

export const checkAverageSubmitAttempts = async (user_id: number, cluster: number): Promise<GeneralResponse> => {
  try {
    let response = await userController.getAverageSubmitAttempts(user_id);
    if (response[0].code !== 200) return response[0];
    const avg = response[1] as number;
    let resp2: GeneralResponse | undefined;
    if (avg <= 2 && cluster !== 0) {
      resp2 = await userController.updateUserClusterById(user_id, 0);
    } else if (avg > 2 && avg <= 5 && cluster !== 1) {
      resp2 = await userController.updateUserClusterById(user_id, 1);
    } else if (avg > 5 && cluster !== 2) {
      resp2 = await userController.updateUserClusterById(user_id, 2);
    }
    if (resp2 === undefined) {
      return { code: 200, message: 'OK' };
    } else return resp2;
  } catch (error) {
    return {
      code: 500,
      message: 'Something went wrong while trying to check average submit attempts for user: ' + user_id,
    };
  }
};
