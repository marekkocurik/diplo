import { useEffect, useState } from 'react';
import Exercise from '../../components/Body/Exercise/Exercise';
import ExerciseTree from '../../components/Body/ExerciseTree/ExerciseTree';

export default function Exercises({ ...props }) {
  const exTrWidth = '15vw';
  const exWidth = '85vw';
  const [exerciseTree, setExerciseTree] = useState([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
      <div id="exerciseTree" style={{ width: exTrWidth, maxWidth: exTrWidth }}>
        <ExerciseTree exerciseTree={exerciseTree} setExerciseTree={setExerciseTree} />
      </div>
      <div id="exercise" style={{ width: exWidth, maxWidth: exWidth, overflowX: 'auto' }}>
        <Exercise exerciseTree={exerciseTree} setExerciseTree={setExerciseTree} />
      </div>
    </div>
  );
}
