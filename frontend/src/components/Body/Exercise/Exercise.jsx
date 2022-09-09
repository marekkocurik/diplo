import { React, useEffect, useState } from "react";

function Exercise({ exerciseNum }) {

    const [exercise, setExercise] = useState(null);

    useEffect(() => {
        //tu zavolam server aby mi vratil ulohu X:
        // const ejnl = {
        //     schema: {}
        // }
        setExercise(/* presne sem tu ulohu nagabem */)
    }, [exerciseNum])

    return (
        <div style={{ width: "80%", height: "100vh", float: "left", backgroundColor: "red" }}>
            {/* sirka bude dana ako Calc(100vw - sirka ExerciseTree) */}
        </div>
    );
}

export default Exercise;