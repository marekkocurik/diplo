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

  const initialize = async (chapter_exercise_id) => {
    let [chapterID, exerciseID] = chapter_exercise_id.split('-');
    try {
      let exerciseInfo = await services.getExercise(exerciseID);
      setExercise(exerciseInfo);
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
  };

  const handleSubmittingQuery = async (e) => {};

  return (
    <div
      style={{
        width: '80%',
        height: '100vh',
        float: 'left',
        backgroundColor: 'red',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* sirka bude dana ako Calc(100vw - sirka ExerciseTree) */}
      <div id="exercise_name" style={{ backgroundColor: 'green', flex: 1 }}>
        <p dangerouslySetInnerHTML={{ __html: exercise?.name }} />
      </div>
      <div
        id="exercise_question"
        style={{ backgroundColor: 'lightblue', flex: 1 }}
      >
        <p dangerouslySetInnerHTML={{ __html: exercise?.question }} />
      </div>
      <Schema />
      <div id="exercise_results" style={{ display: 'flex', flex: 1 }}>
        <Result query={exercise.solution} />
        <Result query={studentQuery} />
      </div>
      <div id="exercise_query" style={{ backgroundColor: 'yellow', flex: 1 }}>
        <Form>
          <Form.Group>
            <Form.Control
              id="student_query"
              as="textarea"
              placeholder="Write your answer here"
            />
          </Form.Group>

          <Button className="w-100 p-2 mt-2" onClick={handleGivingHelp}>
            Help
          </Button>

          <Button className="w-100 p-2 mt-2" onClick={handleTestingQuery}>
            Test
          </Button>

          <Button className="w-100 p-2 mt-2" onClick={handleSubmittingQuery}>
            Submit
          </Button>
        </Form>
      </div>
    </div>
  );
}
