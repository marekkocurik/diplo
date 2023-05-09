import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { services } from '../../../api/services';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { exerciseFinished, solutionsInitialized } from '../../../store/slices/exerciseSlice';
import { ModalConfirmation } from '../Modal/ModalConfirmation';
import { ModalLeaderboards } from '../Modal/ModalLeaderboards';
import { selectActiveChapter, selectActiveExercise } from '../../../store/selectors';

export default function Solutions({ setUserQuery, exerciseId, ...props }) {
  const [errorMessage, setErrorMessage] = useState(null);
  const dispatch = useDispatch();
  const solutions = useSelector((state) => state.exercise.solutions);
  const exerciseTree = useSelector((state) => state.exercise.tree);
  const activeChapterId = useSelector(selectActiveChapter)?.id;
  const finished = useSelector(selectActiveExercise)?.finished;

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLeaderboards, setShowLeaderboards] = useState(false);

  const handleShowConfirmation = () => {
    if (finished !== null) {
      setShowLeaderboards(true);
    } else {
      setShowConfirmation(true);
    }
  };

  const handleShowSolutions = async () => {
    try {
      let result = await services.updateExerciseFinished(exerciseId);
      dispatch(exerciseFinished({ exerciseId }));
      setShowConfirmation(false);
      setShowLeaderboards(true);
    } catch (error) {
      console.log('Failed to update exercise to finished');
    }
  };

  const initialize = async () => {
    try {
      let { solutions } = await services.getUserExerciseSolutions(exerciseId);
      dispatch(solutionsInitialized({ solutions }));
      setErrorMessage('');
    } catch (e) {
      console.log('Failed to obtain exercise solutions: ', e);
      setErrorMessage('Failed to obtain exercise solutions');
    }
  };

  useEffect(() => {
    initialize();
  }, [exerciseId]);

  return (
    <div
      style={{
        width: '100%',
      }}
    >
      {errorMessage ? (
        errorMessage
      ) : solutions ? (
        <div>
          <ModalLeaderboards
            show={showLeaderboards}
            setShow={setShowLeaderboards}
            exerciseId={exerciseId}
            finished={
              exerciseTree.find((o) => o.id === activeChapterId)?.exercises.find((o) => o.id === exerciseId).finished
            }
          />
          <ModalConfirmation show={showConfirmation} setShow={setShowConfirmation} onAgree={handleShowSolutions} />
          <div style={{ maxHeight: '18vh', overflowY: 'auto' }}>
            <Table id="user_exercise_solutions" striped bordered hover style={{ fontSize: '0.7em' }}>
              <thead>
                <tr>
                  <th key={'th_query'} style={{ maxWidth: '50%' }}>
                    Query
                  </th>
                </tr>
              </thead>
              <tbody>
                {solutions.map((item, i) => (
                  <tr
                    className="clickable"
                    key={i + 'solutions_tr'}
                    onClick={() => setUserQuery(item.query)}
                    style={{ backgroundColor: '#03C988' }}
                  >
                    <td>{item.query}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {solutions?.length > 0 && (
            <div className="w-100 pt-3 d-flex justify-content-center">
              <span className="clickable" onClick={handleShowConfirmation} style={{ textDecoration: 'underline' }}>
                View other users' solutions
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="loading-content">Loading solutions ...</div>
      )}
    </div>
    // </div>
  );
}
