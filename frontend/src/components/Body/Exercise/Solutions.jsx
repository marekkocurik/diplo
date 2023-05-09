import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { services } from '../../../api/services';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { solutionsInitialized } from '../../../store/slices/exerciseSlice';
import { ModalConfirmation } from '../Modal/ModalConfirmation';
import { ModalLeaderboards } from '../Modal/ModalLeaderboards';
import { selectActiveChapter } from '../../../store/selectors';

export default function Solutions({ setUserQuery, exerciseId, ...props }) {
  const [errorMessage, setErrorMessage] = useState(null);
  const dispatch = useDispatch();
  const solutions = useSelector((state) => state.exercise.solutions);
  const exerciseTree = useSelector((state) => state.exercise.tree);
  const activeChapterId = useSelector(selectActiveChapter)?.id;

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLeaderboards, setShowLeaderboards] = useState(false);

  const handleShowConfirmation = () => {
    let finished = exerciseTree.find((o) => o.id === activeChapterId)?.exercises.find((o) => o.id === exerciseId).finished;
    console.log(finished);
    // console.log(exerciseTree[activeChapterId-1].exercises[exerciseId-1])
    if (finished !== null) {
      setShowLeaderboards(true);
    } else {
      setShowConfirmation(true);
    }
  };

  const handleShowSolutions = async () => {
    try {
      console.log('updatujem exercise to finished');
      let result = await services.updateExerciseFinished(exerciseId);
      console.log('update succesfull')
      setShowConfirmation(false);
      console.log('confirmation window closed')
      setShowLeaderboards(true);
      console.log('generating date');
      console.log(new Date());
      // exerciseTree[activeChapterId-1].exercises[exerciseId-1].finished = new Date(now);
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
          <ModalLeaderboards show={showLeaderboards} setShow={setShowLeaderboards} />
          <ModalConfirmation show={showConfirmation} setShow={setShowConfirmation} onAgree={handleShowSolutions} />
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
          {solutions?.length > 0 && (
            <div className="w-100 py-5 d-flex justify-content-center">
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
