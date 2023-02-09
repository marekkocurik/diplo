import { React, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { services } from '../../../api/services';

const chapters = [
  {
    id: 1,
    name: 'SELECT',
    exercises: [
      { id: 1, name: 'SELECT ALL' },
      { id: 2, name: 'SELECT ONLY' },
    ],
  },
  {
    id: 2,
    name: 'WHERE',
    exercises: [
      { id: 1, name: 'SELECT ALL' },
      { id: 2, name: 'SELECT ALL' },
    ],
  },
  {
    id: 3,
    name: 'JOIN',
    exercises: [
      { id: 1, name: 'SELECT ALL' },
      { id: 2, name: 'SELECT ALL' },
    ],
  },
];

const exercises = [
  { id: 1, name: 'SELECT ALL' },
  { id: 2, name: 'SELECT ONLY' },
];

export default function ExerciseTree({ ...props }) {
  const navigate = useNavigate();
  const [exerciseTree, setExerciseTree] = useState([]);

  const initialize = async () => {
    try {
      let treeStructure = await services.getExerciseTree();
      setExerciseTree(treeStructure);
    } catch (e) {
      console.log('Failed to get exercise tree.');
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const handleExerciseClick = async (n) => {
    try {
      navigate(`/home/exercises?id=${n}`);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      style={{
        width: '20%',
        height: '100vh',
        float: 'left',
        backgroundColor: 'grey',
      }}
    >
      {exerciseTree?.map(
        (chapter) => (
          <div>
            <div className="w-100 py-2 my-1 px-4">
              {chapter._id + '. ' + chapter.name}
            </div>

            {chapter.exercises?.map((exercise) => (
              <div
                className="w-100 py-2 my-1 px-4"
                style={{ fontSize: '0.8em' }}
                onClick={() =>
                  handleExerciseClick(chapter.id + '-' + exercise.id)
                }
              >
                {exercise._id + '. ' + exercise.name}
              </div>
            ))}
          </div>
        )
      )}
    </div>

    // <div>
    //     {
    //         exercises.map(
    //             exercise => <Button onClick={e => handleExerciseClick(exercise.id)}>{exercise.name}</Button>
    //         )
    //     }
    //     {/* <Exercise exerciseNum={exerciseNum}></Exercise> */}
    //     {exerciseNum}
    // </div>
  );
}
