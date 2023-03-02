import { React, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import SimpleBar from 'simplebar-react';
import { motion } from 'framer-motion';

export default function ExerciseTree({ ...props }) {
  const navigate = useNavigate();
  const [exerciseTree, setExerciseTree] = useState([]);
  const [searchParams] = useSearchParams();
  const activeTask = searchParams.get('id');

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

  const MenuElement = ({ active, children, ...props }) => (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0.55 }}
      whileHover={!active && { opacity: 0.8 }}
      style={{ fontSize: '0.75em' }}
      className="w-100 py-1 my-1 px-5 font-weight-600 clickable"
      {...props}
    >
      {children}
    </motion.div>
  );

  return (
    <div
      style={{
        boxShadow: '0px 2px 3px 1px #00000020',
        width: '20%',
        height: '100vh',
        overflow: 'auto',
        float: 'left',
        backgroundColor: 'white',
        position: 'fixed',
      }}
    >
      <SimpleBar style={{ maxHeight: '100vh' }}>
        {exerciseTree?.map((chapter) => (
          <div key={'chapter_' + chapter.id}>
            <div className="font-weight-600 py-3 px-5">
              {chapter.name}
            </div>

            {chapter.exercises?.map((exercise) => (
              <MenuElement
                key={'exercise_' + exercise.id}
                onClick={() =>
                  handleExerciseClick(chapter.id + '-' + exercise.id)
                }
                active={chapter.id + '-' + exercise.id === activeTask}
              >
                {exercise._id + '. ' + exercise.name}
              </MenuElement>
            ))}
          </div>
        ))}
      </SimpleBar>
    </div>
  );
}
