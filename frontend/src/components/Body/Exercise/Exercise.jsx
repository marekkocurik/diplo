import { React, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Exercise({ ...props }) {
  const [searchParams, _] = useSearchParams();
  const [exercise, setExercise] = useState(null);

  useEffect(() => {
    setExercise(searchParams.get('id'));
  }, [searchParams.get('id')]);

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
      <div id="exercise_question" style={{ backgroundColor: 'green', flex: 1 }}>
        {exercise}
      </div>
      <div
        id="exercise_schema"
        style={{ backgroundColor: 'lightblue', flex: 1 }}
      ></div>
      <div id="exercise_results" style={{ display: 'flex', flex: 1 }}>
        <div
          id="exercise_expected_result"
          style={{ flex: 1, height: '100%', backgroundColor: 'lightgreen' }}
        ></div>
        <div
          id="exercise_query_result"
          style={{ flex: 1, height: '100%', backgroundColor: 'purple' }}
        ></div>
      </div>
      <div
        id="exercise_query"
        style={{ backgroundColor: 'yellow', flex: 1 }}
      ></div>
    </div>
  );
}
