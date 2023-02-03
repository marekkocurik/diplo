import { React, useState } from 'react';
import { Button } from 'react-bootstrap';

const chapters = [
  {
    chapter: 1,
    name: 'SELECT',
    exercises: [
      { id: 1, name: 'SELECT ALL' },
      { id: 2, name: 'SELECT ONLY' },
    ],
  },
  {
    chapter: 2,
    name: 'WHERE',
    exercises: [{ id: 1 }, { id: 2 }],
  },
  {
    chapter: 3,
    name: 'JOIN',
    exercises: [{ id: 1 }, { id: 2 }],
  },
];

const exercises = [
  { id: 1, name: 'SELECT ALL' },
  { id: 2, name: 'SELECT ONLY' },
];

export default function ExerciseTree({...props}) {
  const [exerciseNum, setExerciseNum] = useState(0);

  const handleExerciseClick = (n) => {
    setExerciseNum(n);
  };

  return (
    <div
      style={{
        width: '20%',
        height: '100vh',
        float: 'left',
        backgroundColor: 'grey',
      }}
    ></div>

    // <div>
    //     {
    //         exercises.map(
    //             exercise => <Button onClick={e => handleExerciseClick(exercise.id)}>{exercise.name}</Button>
    //         )
    //     }
    //     {/* <Exercise exerciseNum={exerciseNum}></Exercise> */}
    //     {exerciseNum}
    // </div>

    // <div>
    //       <div style={{ width: "20%", height: "100vh", float: "left", backgroundColor: "grey" }}></div>
    //       <div style={{ width: "80%", height: "100vh", float: "left" }}>
    //         <Routes>
    //           <Route path="/" element={
    //             <div style={{
    //               width: "100%",
    //               minHeight: "100vh",
    //               backgroundColor: "red",
    //             }}></div>
    //           } />
    //           <Route path="about" element={
    //             <div style={{
    //               width: "100%",
    //               minHeight: "100vh",
    //               backgroundColor: "blue",
    //             }}></div>
    //           } />
    //         </Routes>
    //       </div>
    //     </div>
  );
}