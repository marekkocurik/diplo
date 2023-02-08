import Exercise from '../../components/Body/Exercise/Exercise';
import ExerciseTree from '../../components/Body/ExerciseTree/ExerciseTree';

export default function Exercises({ ...props }) {
  return (
    <div>
      <ExerciseTree />
      <Exercise />
    </div>
  );
}
