import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tree: [],
  activeExercise: null,
  activeChapterId: null,

  userQuery: '',
  history: null,
  solutions: null,
};

export const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    queryUpdated: (state, action) => {
      state.userQuery = action.payload;
    },
    solutionsInitialized: (state, action) => {
      const { solutions } = action.payload;
      state.solutions = solutions;
    },
    solutionsUpdated: (state, action) => {
      state.solutions = [action.payload, ...state.solutions];
    },

    historyInitialized: (state, action) => {
      const { answers } = action.payload;
      state.history = answers;
    },
    historyUpdated: (state, action) => {
      state.history = [action.payload, ...state.history];
      const ex = state.tree
        .find((c) => c.id === state.activeChapterId)
        .exercises.find((e) => e.id === state.activeExercise.id);
      if (!ex.solved) ex.solved = action.payload.solution_success === 'COMPLETE';
      // state.tree.find((c) => c.id === state.activeChapterId).exercises.find((e) => e.id === state.activeExercise.id).solved =
      //   action.payload.solution_success === 'COMPLETE';

      state.tree
        .find((c) => c.id === state.activeChapterId)
        .exercises.find((e) => e.id === state.activeExercise.id).started = true;
    },

    treeLoaded: (state, action) => {
      const { tree } = action.payload;
      state.tree = tree;
    },
    exerciseSelected: (state, action) => {
      const { exercise, chapter } = action.payload;
      state.activeExercise = exercise;
      state.activeChapterId = chapter;
    },
    exerciseStarted: (state, action) => {
      const { exerciseId } = action.payload;
      state.tree.find((c) => c.id === state.activeChapterId).exercises.find((e) => e.id === exerciseId).started = true;
    },
    exerciseSolved: (state, action) => {
      const { exerciseId } = action.payload;
      state.tree.find((c) => c.id === state.activeChapterId).exercises.find((e) => e.id === exerciseId).solved = true;
    },
    exerciseFinished: (state, action) => {
      const { exerciseId, date } = action.payload;
      state.tree.find((c) => c.id === state.activeChapterId).exercises.find((e) => e.id === exerciseId).finished = date;
    },
    chapterSolved: (state, action) => {
      const { chapterId } = action.payload;
      state.tree[chapterId - 1].solved = true;
    },
  },
});

export const {
  treeLoaded,
  exerciseSelected,
  exerciseStarted,
  exerciseSolved,
  exerciseFinished,
  chapterSolved,
  historyInitialized,
  historyUpdated,
  queryUpdated,
  solutionsInitialized,
  solutionsUpdated,
} = exerciseSlice.actions;
export default exerciseSlice.reducer;
