import { React, useEffect } from "react";
import Exercise from "./Exercise/Exercise";
import ExerciseTree from "./ExerciseTree/ExerciseTree";

function Body() {

    useEffect(() => {

    })

    return (
        // tu by mala byt Routovacia tabulka, ktora podla URL nastavi obsah BODY
        <div>
            <ExerciseTree></ExerciseTree>
            <Exercise></Exercise>
        </div>
    );
}

export default Body;

