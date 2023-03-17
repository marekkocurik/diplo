import { React, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import { Button, Form } from 'react-bootstrap';
import Schema from './Schema';
import Result from './Result';
import History from './History';
import Solutions from './Solutions';

export default function Exercise({ exerciseTree, setExerciseTree, ...props }) {
  const navigate = useNavigate();
  const [searchParams, _] = useSearchParams();
  const [exercise, setExercise] = useState(null);
  const [studentQuery, setStudentQuery] = useState('');
  const [queryAction, setQueryAction] = useState('');
  const [nextExerciseExists, setNextExerciseExists] = useState(true);
  const [previousExerciseExists, setPreviousExerciseExists] = useState(true);

  const initialize = async (exerciseID) => {
    document.getElementById('student_query').value = '';
    try {
      let exerciseInfo = await services.getExercise(exerciseID);
      setExercise(exerciseInfo);
      setQueryAction('none');
      setStudentQuery('');
    } catch (e) {
      console.log('Failed to get exercise.');
      const { message } = await e.response.json();
      console.log(message);
    }
  };

  useEffect(() => {
    if (searchParams.get('id') !== null) {
      let [chapterID, exercise_id] = searchParams.get('id').split('-');
      // TODO: zistit aka je prva a posledna uloha
      if (exercise_id == 1) setPreviousExerciseExists(false);
      else setPreviousExerciseExists(true);
      if (exercise_id == 71) setNextExerciseExists(false);
      else setNextExerciseExists(true);
      initialize(exercise_id);
    }
  }, [searchParams.get('id')]);

  const handleGivingHelp = async (e) => {};

  const handleTestingQuery = async (e) => {
    e.preventDefault();
    const _studentQuery = document.getElementById('student_query').value;
    setStudentQuery(_studentQuery);
    setQueryAction('test');
    // TODO: treba aktualizovat tabulku s historiou
  };

  const handleSubmittingQuery = async (e) => {
    e.preventDefault();
    const _studentQuery = document.getElementById('student_query').value;
    setStudentQuery(_studentQuery);
    setQueryAction('submit');
    // TODO: ak je spravne query, treba aktualizovat tabulku s TOP solutions, leaderboard ...
  };

  const handleNextExercise = async (e) => {
    e.preventDefault();
    if (searchParams.get('id') !== null) {
      let [chapterID, exercise_id] = searchParams.get('id').split('-');
      let new_id = Number(exercise_id) + 1;
      // TODO: treba zistit kedy zmenit hodnotu chapterID
      navigate(`/home/exercises?id=${chapterID}-${new_id}`);
    }
  };

  const handlePreviousExercise = async (e) => {
    e.preventDefault();
    if (searchParams.get('id') !== null) {
      let [chapterID, exercise_id] = searchParams.get('id').split('-');
      let new_id = Number(exercise_id) - 1;
      // TODO: treba zistit kedy zmenit hodnotu chapterID
      navigate(`/home/exercises?id=${chapterID}-${new_id}`);
    }
  };

  return searchParams.get('id') === null ? (
    <div></div>
  ) : (
    <div
      style={{
        paddingLeft: '1vw',
        height: '100%',
        width: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="pt-2" style={{ width: '100%' }}>
        <h2 dangerouslySetInnerHTML={{ __html: exercise?.name }} />
      </div>
      <div className="pt-1" style={{ width: '100%' }}>
        <p dangerouslySetInnerHTML={{ __html: exercise?.question }} />
      </div>
      <div style={{ width: '100%', maxHeight: '35vh' }}>
        <Schema />
      </div>
      <div className="py-2" style={{ display: 'flex', flexDirection: 'row', width: '100%', maxHeight: '60vh' }}>
        <div style={{ width: '50%' }}>
          <Result
            table_name={'Expected result:'}
            action={''}
            queryResult={exercise?.queryResult}
            query={exercise?.solution}
          />
        </div>
        <div style={{ width: '50%' }}>
          <Result
            table_name={'Your query result:'}
            action={queryAction}
            query={studentQuery}
            solution={exercise?.solution}
            exerciseId={exercise?.id}
          />
        </div>
      </div>
      <div className="py-2 px-1" style={{ display: 'flex', flexDirection: 'row', width: '100%', maxHeight: '50vh' }}>
        <div style={{ width: '70%' }}>
          <Form.Control
            id="student_query"
            style={{ resize: 'vertical', minHeight: '100%', maxHeight: '100%' }}
            as="textarea"
            placeholder="Write your answer here"
            defaultValue={studentQuery}
          />
        </div>
        <div className="px-2" style={{ width: '10%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '100%' }}>
            <Button style={{ width: '8vw', backgroundColor: '#2666CF' }} onClick={handleGivingHelp}>
              Help
            </Button>
          </div>
          <div className="py-1" style={{ width: '100%' }}>
            <Button style={{ width: '8vw', backgroundColor: '#2666CF' }} onClick={handleTestingQuery}>
              Test
            </Button>
          </div>
          <div style={{ width: '100%' }}>
            <Button style={{ width: '8vw', backgroundColor: '#2666CF' }} onClick={handleSubmittingQuery}>
              Submit
            </Button>
          </div>
        </div>
      </div>
      <div className="py-2" style={{ display: 'flex', flexDirection: 'row', width: '100%', maxHeight: '40vh' }}>
        <div style={{ width: '100%' }}>
          <History query_history={exercise?.history} setStudentQuery={setStudentQuery} />
        </div>
        {/* <div style={{ width: '50%', maxHeight: '100%' }}>
          <Solutions />
        </div> */}
      </div>
      <div className="py-3" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div className="px-2">
          <Button
            style={{ width: '8vw', backgroundColor: '#2666CF' }}
            disabled={!previousExerciseExists}
            onClick={handlePreviousExercise}
          >
            {' '}
            {'< Previous'}
          </Button>
        </div>
        <div className="px-2">
          <Button
            style={{ width: '8vw', backgroundColor: '#2666CF' }}
            disabled={!nextExerciseExists}
            onClick={handleNextExercise}
          >
            {'Next >'}
          </Button>
        </div>
      </div>
    </div>
  );
}
