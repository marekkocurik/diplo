import { React, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import SimpleBar from 'simplebar-react';
import { motion } from 'framer-motion';
import Accordion from 'react-bootstrap/Accordion';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { treeLoaded } from '../../../store/slices/exerciseSlice';

export default function ExerciseTree({ ...props }) {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [expandedChapter, setExpandedChapter] = useState(null);
  let activeTask = searchParams.get('id');
  const dispatch = useDispatch();

  const exerciseTree = useSelector((state) => state.exercise.tree);

  const initialize = async () => {
    try {
      const response = await services.getExerciseTree();
      dispatch(treeLoaded({ tree: response.tree }));
    } catch (e) {
      console.log('Failed to get exercise tree.');
    }
  };

  const initAccordion = async () => {
    const c_id = searchParams.get('id').split('-')[0];
    const chapter = exerciseTree.find((item) => item._id === parseInt(c_id));
    setExpandedChapter(chapter.id);
  };

  useEffect(() => {
    activeTask = searchParams.get('id');
    if (_.isEqual(exerciseTree, [])) {
      initialize();
    } else {
      if (activeTask) initAccordion();
    }
  }, [searchParams.get('id'), exerciseTree]);

  const ChapterMenuElement = ({ children, eventKey, active, chapterSolved, ...props }) => {
    const updateAccordion = useAccordionButton(eventKey);

    function handleChapterClick() {
      setExpandedChapter(eventKey === expandedChapter ? null : eventKey);
      updateAccordion();
    }

    return (
      <motion.div
        className="font-weight-700 py-2 px-3 clickable"
        onClick={handleChapterClick}
        initial={false}
        animate={{ opacity: active ? 1 : 0.55, backgroundColor: chapterSolved ? '#03C988' : 'white' }}
        whileHover={!active && { opacity: 0.8 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  };

  const ExerciseMenuElement = ({ active, chapterId, exerciseId, exerciseSolved, exerciseStarted, ...props }) => {
    const exerciseClick = () => {
      navigate(`/home/exercises?id=${chapterId}-${exerciseId}`);
    };

    return (
      <motion.div
        className="py-2 px-3 font-weight-300 clickable"
        onClick={exerciseClick}
        initial={false}
        animate={{
          opacity: active ? 1 : 0.55,
          fontSize: active ? '0.9em' : '0.7em',
          backgroundColor: exerciseSolved ? '#03C988' : exerciseStarted ? 'yellow' : 'white',
        }}
        whileHover={!active && { opacity: 0.8 }}
        {...props}
      />
    );
  };

  return (
    <div style={{ boxShadow: '0px 2px 3px 1px #00000020', height: '100%' }}>
      <SimpleBar style={{ overflowY: 'auto', height: '100%' }}>
        <Accordion activeKey={expandedChapter} flush>
          {exerciseTree?.map((chapter) => (
            <div key={'chapter_' + chapter.id}>
              <ChapterMenuElement
                eventKey={chapter.id}
                active={chapter.id === expandedChapter}
                chapterSolved={chapter.solved}
              >
                {chapter.name}
              </ChapterMenuElement>
              <Accordion.Collapse eventKey={chapter.id}>
                <div>
                  {chapter.exercises?.map((exercise) => (
                    <ExerciseMenuElement
                      key={'exercise_' + exercise.id}
                      active={chapter.id + '-' + exercise.id === activeTask}
                      chapterId={chapter.id}
                      exerciseId={exercise.id}
                      exerciseSolved={exercise.solved}
                      exerciseStarted={exercise.started}
                    >
                      {exercise._id + '. ' + exercise.name}
                    </ExerciseMenuElement>
                  ))}
                </div>
              </Accordion.Collapse>
            </div>
          ))}
        </Accordion>
      </SimpleBar>
    </div>
  );
}
