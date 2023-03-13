import Exercise from '../../components/Body/Exercise/Exercise';
import ExerciseTree from '../../components/Body/ExerciseTree/ExerciseTree';

export default function Exercises({ ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1 }}>
        <ExerciseTree  />
      </div>
      <div style={{ flex: 5, overflowX: 'auto' }}>
        <Exercise  />
      </div>
    </div>
  );
}
