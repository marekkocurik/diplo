import { React, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import { Button, Form } from 'react-bootstrap';
import Schema from './Schema';
import Result from './Result';

export default function Exercise({ ...props }) {
  const [searchParams, _] = useSearchParams();
  const [exercise, setExercise] = useState({ query: '' });
  const [studentQuery, setStudentQuery] = useState('');
  const [queryAction, setQueryAction] = useState('');

  const initialize = async (chapter_exercise_id) => {
    document.getElementById('student_query').value = '';
    let [chapterID, exerciseID] = chapter_exercise_id.split('-');
    try {
      let exerciseInfo = await services.getExercise(exerciseID);
      setExercise(exerciseInfo);
      setQueryAction('');
      setStudentQuery('');
    } catch (e) {
      console.log('Failed to get exercise.');
    }
  };

  useEffect(() => {
    initialize(searchParams.get('id'));
  }, [searchParams.get('id')]);

  const handleGivingHelp = async (e) => {};

  const handleTestingQuery = async (e) => {
    e.preventDefault();
    const _studentQuery = document.getElementById('student_query').value;
    setStudentQuery(_studentQuery);
    setQueryAction('test');
  };

  const handleSubmittingQuery = async (e) => {
    //e.preventDefault();
    //const _studentQuery = document.getElementById('student_query').value;
    //setStudentQuery(_studentQuery);
    //setQueryAction('submit');
  };

  return (
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
        <Result query={exercise.solution} action={''} />
        <Result
          query={studentQuery}
          action={queryAction}
          solution={exercise.solution}
          exerciseId={exercise.id}
        />
      </div>
      <div id="exercise_query" className="d-flex" style={{ flex: 1 }}>
        <div style={{ width: '70%' }}>
          <Form.Control
            className="w-100 h-100"
            id="student_query"
            as="textarea"
            placeholder="Write your answer here"
          />
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
