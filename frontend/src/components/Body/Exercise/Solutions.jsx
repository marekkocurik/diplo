import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import _ from 'lodash';

export default function Solutions({ exerciseId, setUserQuery, solutions, setSolutions, ...props }) {
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchParams] = useSearchParams();
  const { solutionsInitialized, setSolutionsInitialized } = props;

  const initialize = async () => {
    try {
      let result = await services.getUserExerciseSolutions(exerciseId);
      setSolutions(result.solutions);
      setErrorMessage(null);
    } catch (e) {
      console.log('Failed to obtain exercise solutions: ', e);
      setErrorMessage('Failed to obtain exercise solutions');
    }
  };

  useEffect(() => {
    if (!solutionsInitialized && _.isEqual(solutions, [])) {
      initialize();
      setSolutionsInitialized(true);
    }
  }, [solutions]);

  return (
    <div
      style={{
        width: '100%',
        // maxHeight: '90%',
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
                key={item.id + '_tr'}
                onClick={() => setUserQuery(item.query)}
                style={{ backgroundColor: '#03C988' }}
              >
                <td key={item.id + '_query'}>{item.query}</td>
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
