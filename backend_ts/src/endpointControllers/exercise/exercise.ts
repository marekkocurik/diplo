import { Exercise, TreeExercise } from '../../databaseControllers/exercisesController';
import { queryToUpperCase } from '../ast/lexicalAnalysis/analyzer';
import { GeneralResponse } from '../../databaseControllers/databaseController';
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
} from './exerciseFunctions';

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

export const getQueryTestResult = async (request: any, reply: any) => {
  const { role, exerciseId, queryToExecute, solution } = request.query;
  const user_id = request.query.id;
  let response: QueryTestResultResponse;
  response = await testQueries(role, solution, queryToExecute, 'test');
  // 200 - OK
  // 400 - ERROR query
  // 403 - BAD REQUEST (prazdne query)
  // 500 - chyba s pripojenim na DB
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

export const getQuerySubmitResult = async (request: any, reply: any) => {
  const { role, exerciseId, solution } = request.query;
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
        let res = {
          message: 'Solution is correct, but it could not be saved.',
        };
      }
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
    console.log('updating to finished for uid:', user_id, 'eid:', exerciseId);
    let response = await usersToExercisesController.updateToFinished(user_id, exerciseId);
    reply.code(response.code).send({ message: response.message });
    return;
  } catch (error) {
    reply.code(500).send({ message: 'Something went wrong while trying to update exercise to finished' });
    return;
  }
};

export const getDummyData = async (request: any, reply: any) => {
  try {
    let response = await answersController.getDummyData();
    reply.code(200).send({ message: 'OK', data: response[1] });
    return;
  } catch (error) {
    reply.code(500).send({ message: 'something wrong' });
    return;
  }
};
