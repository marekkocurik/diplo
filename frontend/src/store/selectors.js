import _ from 'lodash';

export const selectActiveExercise = (state) => {
  const { activeExercise } = state.exercise;
  return activeExercise;
};

export const nextChapterExists = (state) => {
  const { activeChapterId, tree } = state.exercise;
  const chapterIndex = tree.findIndex((c) => c.id === activeChapterId);
  return chapterIndex < tree.length - 1;
};

export const selectActiveChapter = (state) => {
  const { activeChapterId, tree } = state.exercise;
  return tree.find((c) => c.id === activeChapterId);
};

export const selectActiveExerciseFinished = (state) => {
  if(selectActiveChapter(state) === undefined) return null;
  // const { activeExercise, tree, activeChapterId } = state.exercise;
  const exer = selectActiveChapter(state).exercises.find(
    (e) => e.id === state.exercise.activeExercise.id
  );
  return exer.finished;


  // return tree?.find((c) => c === activeChapterId)?.exercises?.find((e) => e.id === activeExercise.id)?.finished;
};

export const selectNextExerciseUrlString = (state) => {
  if (selectActiveChapter(state) === undefined) return false;

  const activeExerciseIndex = selectActiveChapter(state).exercises.findIndex(
    (e) => e.id === state.exercise.activeExercise.id
  );
  if (activeExerciseIndex < selectActiveChapter(state).exercises.length - 1) {
    const nextExerciseId = selectActiveChapter(state).exercises[activeExerciseIndex + 1].id;
    return `${selectActiveChapter(state).id}-${nextExerciseId}`;
  } else if (nextChapterExists(state)) {
    const nextChapterId =
      state.exercise.tree[state.exercise.tree.findIndex((c) => c.id === state.exercise.activeChapterId) + 1].id;
    const nextExerciseId =
      state.exercise.tree[state.exercise.tree.findIndex((c) => c.id === nextChapterId)].exercises[0].id;
    return `${nextChapterId}-${nextExerciseId}`;
  }
  return false;
};

export const selectPreviousExerciseUrlString = (state) => {
  if (selectActiveChapter(state) === undefined) return false;

  const activeExerciseIndex = selectActiveChapter(state).exercises.findIndex(
    (e) => e.id === state.exercise.activeExercise.id
  );
  if (activeExerciseIndex > 0) {
    const previousExerciseId = selectActiveChapter(state).exercises[activeExerciseIndex - 1].id;
    return `${selectActiveChapter(state).id}-${previousExerciseId}`;
  } else if (previousChapterExists(state)) {
    const previousChapterId =
      state.exercise.tree[state.exercise.tree.findIndex((c) => c.id === state.exercise.activeChapterId) - 1].id;
    const previousExerciseId = _.last(
      state.exercise.tree[state.exercise.tree.findIndex((c) => c.id === previousChapterId)].exercises
    ).id;
    return `${previousChapterId}-${previousExerciseId}`;
  }
  return false;
};

export const previousChapterExists = (state) => {
  const { activeChapterId, tree } = state.exercise;
  const chapterIndex = tree.findIndex((c) => c.id === activeChapterId);
  return chapterIndex > 0;
};
