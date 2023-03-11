import { React, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import { Button, Form } from 'react-bootstrap';
import Schema from './Schema';
import Result from './Result';

export default function Exercise({ ...props }) {
  const [searchParams, _] = useSearchParams();
  const [exercise, setExercise] = useState(null);
  const [studentQuery, setStudentQuery] = useState('');
  const [queryAction, setQueryAction] = useState('');

  const initialize = async (chapter_exercise_id) => {
    document.getElementById('student_query').value = '';
    let [chapterID, exerciseID] = chapter_exercise_id.split('-');
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
    if(searchParams.get('id') !== null)
      initialize(searchParams.get('id'));
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
    //e.preventDefault();
    //const _studentQuery = document.getElementById('student_query').value;
    //setStudentQuery(_studentQuery);
    //setQueryAction('submit');
    // TODO: ak je spravne query, treba aktualizovat tabulku s TOP solutions, leaderboard ...
  };

  return searchParams.get('id') === null ? (
    <div></div>
  ) : (
    <div
      style={{
        paddingLeft: '22vw',
        width: '100vw',
        height: '100vh',
        float: 'left',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div id="exercise_name" className="py-3">
        <h1 dangerouslySetInnerHTML={{ __html: exercise?.name }} />
      </div>
      <div id="exercise_question" style={{ width: '80%' }}>
        <p dangerouslySetInnerHTML={{ __html: exercise?.question }} />
      </div>
      <Schema />
      <div id="exercise_results" style={{ display: 'flex', flex: 1 }}>
        <Result table_name={'Expected result:'} action={''} queryResult={exercise?.queryResult} query={exercise?.solution } />
        <Result
          table_name={'Your query result:'}
          action={queryAction}
          query={studentQuery}
          solution={exercise?.solution}
          exerciseId={exercise?.id}
        />
      </div>
      <div id="exercise_query" className="d-flex" style={{ flex: 1 }}>
        <div style={{ width: '70%' }}>
          <Form.Control className="w-100 h-100" id="student_query" as="textarea" placeholder="Write your answer here" />
        </div>
        <div className="d-flex flex-column p-4">
          <Button className="px-4 p-2 my-1" onClick={handleGivingHelp}>
            Help
          </Button>

          <Button className="px-4 p-2 my-1" onClick={handleTestingQuery}>
            Test
          </Button>

          <Button className="px-4 p-2 my-1" onClick={handleSubmittingQuery}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
