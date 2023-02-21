import { React, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import { Button, Form } from 'react-bootstrap';
import Schema from './Schema';
import Result from './Result';

export default function Exercise({ ...props }) {
  const [searchParams, _] = useSearchParams();
  const [exercise, setExercise] = useState({query:''});
  const [exerciseName, setExerciseName] = useState(null);
  const [exerciseQuestion, setExerciseQuestion] = useState(null);
  const [studentQuery, setStudentQuery] = useState('');
  // const [studentQueryResult, setStudentQueryResult] = useState([{}]);
  // const [expectedResult, setExpectedResult] = useState([{}]);

  const initialize = async (chapter_exercise_id) => {
    let [chapterID, exerciseID] = chapter_exercise_id.split('-');
    try {
      // let exerciseInfo = await services.getExercise(exerciseID);
      // console.log('exercise solution is ' +exerciseInfo.query);
      // setExercise(exerciseInfo);
      // setExerciseName(exerciseInfo.name);
      // setExerciseQuestion(exerciseInfo.question);
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
    try {
      // let expResult = await services.getExpectedResult(exercise.id);
      // let qResult = await services.getQueryResult(studentQuery);
      // console.log(qResult);
      // setExpectedResult(expResult);
      // setStudentQueryResult(qResult);
      // navigate('/home/exercises');

    } catch (e) {
      // const { message } = await e.response.json();
      // console.log(message);
      // console.log('Query testing failed');
    }
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
        <p>
          <div dangerouslySetInnerHTML={{ __html: exerciseName }} />
        </p>
      </div>
      <div
        id="exercise_question"
        style={{ backgroundColor: 'lightblue', flex: 1 }}
      >
        <p>
          <div dangerouslySetInnerHTML={{ __html: exerciseQuestion }} />
        </p>
      </div>
      <Schema />
      <div id="exercise_results" style={{ display: 'flex', flex: 1 }}>
        <Result query={exercise.query} />
        <Result query={studentQuery} />
        {/* <div
          id="exercise_expected_result"
          style={{ flex: 1, height: '100%', backgroundColor: 'lightgreen' }}
        >
          <table>
            <tr key={'header'}>
              {expectedResult
                ? Object.keys(expectedResult[0]).map((key) => <th>{key}</th>)
                : []}
            </tr>
            {expectedResult?.map((item) => (
              <tr key={item.id}>
                {Object.values(item).map((val) => (
                  <td>{val}</td>
                ))}
              </tr>
            ))}
          </table>
        </div>
        <div
          id="exercise_query_result"
          style={{ flex: 1, height: '100%', backgroundColor: 'purple' }}
        >
          <table>
            <tr key={'header'}>
              {studentQueryResult
                ? Object.keys(studentQueryResult[0]).map((key) => (
                    <th>{key}</th>
                  ))
                : []}
            </tr>
            {studentQueryResult?.map((item) => (
              <tr key={item.id}>
                {Object.values(item).map((val) => (
                  <td>{val}</td>
                ))}
              </tr>
            ))}
          </table>
        </div> */}
      </div>
      <div id="exercise_query" style={{ backgroundColor: 'yellow', flex: 1 }}>
        <Form>
          <Form.Group>
            <Form.Control
              id="student_query"
              as="textarea"
              placeholder="Write your answer here"
              // onChange={(e) => setStudentQuery(e.target.value)}
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
