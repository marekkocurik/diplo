import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { services } from '../../../api/services';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { solutionsInitialized } from '../../../store/slices/exerciseSlice';

export default function Solutions({ setUserQuery, exerciseId, ...props }) {
  const [errorMessage, setErrorMessage] = useState(null);
  const dispatch = useDispatch();
  const solutions = useSelector((state) => state.exercise.solutions);

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
        overflow: 'auto',
      }}
    >
      {errorMessage ? (
        errorMessage
      ) : solutions ? (
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
      ) : (
        <div className="loading-content">Loading solutions ...</div>
      )}
    </div>
    // </div>
  );
}
