import { React, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import SimpleBar from 'simplebar-react';
import { motion } from 'framer-motion';
import _ from 'lodash';

export default function ExerciseTree({ exerciseTree, setExerciseTree, ...props }) {
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const [expandedChapter, setExpandedChapter] = useState(null);
  let exerciseClick = false;
  let activeTask = searchParams.get('id');

  const initialize = async () => {
    try {
      let treeStructure = await services.getExerciseTree();
      setExerciseTree(treeStructure);
    } catch (e) {
      console.log('Failed to get exercise tree.');
    }
  };

  useEffect(() => {
    if (_.isEqual(exerciseTree, [])) {
      initialize();
    }
    activeTask = searchParams.get('id');
  }, [searchParams.get('id')]);

  const handleChapterClick = (chapterId) => {
    if (!exerciseClick) setExpandedChapter(chapterId === expandedChapter ? null : chapterId);
    exerciseClick = false;
  };

  const handleExerciseClick = async (chapterId, exerciseId) => {
    exerciseClick = true;
    try {
      navigate(`/home/exercises?id=${chapterId}-${exerciseId}`);
    } catch (e) {
      console.log(e);
    }
  };

  const ChapterMenuElement = ({ active, children, ...props }) => (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0.55, backgroundColor: 'white' }}
      whileHover={!active && { opacity: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  );

  const ExerciseMenuElement = ({ active, children, ...props }) => (
    <motion.div
      initial={false}
      animate={{
        opacity: active ? 1 : 0.55,
        backgroundColor: props.exerciseSolved ? '#03C988' : props.exerciseStarted ? 'yellow' : 'white',
      }}
      whileHover={!active && { opacity: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  );

  return (
    <div style={{ boxShadow: '0px 2px 3px 1px #00000020', height: '100%' }}>
      <SimpleBar style={{ overflowY: 'auto', height: '100%' }}>
        <div>
          {exerciseTree?.map((chapter) => (
            <ChapterMenuElement
              key={'chapter_' + chapter.id}
              onClick={() => handleChapterClick(chapter.id)}
              className="font-weight-700 py-2 px-3 clickable"
              active={chapter.id === expandedChapter}
            >
              <div>
                <div>{chapter.name}</div>
                <div>
                  {expandedChapter === chapter.id &&
                    chapter.exercises?.map((exercise) => (
                      <ExerciseMenuElement
                        key={'exercise_' + exercise.id}
                        onClick={() => handleExerciseClick(chapter.id, exercise.id)}
                        className="py-1 my-1 px-3 font-weight-300 font-size-80 clickable"
                        active={chapter.id + '-' + exercise.id === activeTask}
                        exerciseSolved={exercise.solved}
                      >
                        {exercise._id + '. ' + exercise.name}
                      </ExerciseMenuElement>
                    ))}
                </div>
              </div>
            </ChapterMenuElement>
          ))}
        </div>
      </SimpleBar>
    </div>
  );
}
