import { React, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';

export default function Exercise({ ...props }) {
  const [searchParams, _] = useSearchParams();
  const [exercise, setExercise] = useState(null);
  const [exerciseName, setExerciseName] = useState(null);
  const [exerciseQuestion, setExerciseQuestion] = useState(null);

  const initialize = async (chapter_exercise_id) => {
    let [chapterID, exerciseID] = chapter_exercise_id.split('-');
    try {
      let exerciseInfo = await services.getExercise(exerciseID);
      setExercise(exerciseInfo);
      setExerciseName(exerciseInfo.name);
      setExerciseQuestion(exerciseInfo.question);
    } catch (e) {
      console.log('Failed to get exercise.');
    }
  };

  useEffect(() => {
    initialize(searchParams.get('id'));
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
        <p>
          <div dangerouslySetInnerHTML={{ __html: exerciseName }} />
        </p>
      </div>
      <div
        id="exercise_schema"
        style={{ backgroundColor: 'lightblue', flex: 1 }}
      >
        <p>
          <div dangerouslySetInnerHTML={{ __html: exerciseQuestion }} />
        </p>
      </div>
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
