import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { historyInitialized } from '../../../store/slices/exerciseSlice';

export default function History({ exerciseId, setUserQuery, ...props }) {
  const [errorMessage, setErrorMessage] = useState(null);
  const dispatch = useDispatch();
  const history = useSelector(({ exercise }) => exercise.history);

  const formatDate = (date) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    const hours = ('0' + dateObj.getHours()).slice(-2);
    const minutes = ('0' + dateObj.getMinutes()).slice(-2);
    const seconds = ('0' + dateObj.getSeconds()).slice(-2);
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  };

  const initialize = async () => {
    try {
      let { answers } = await services.getExerciseHistory(exerciseId);
      dispatch(historyInitialized({ answers }));
      if (Array.isArray(answers) && answers[0] !== undefined) setUserQuery(answers[0].query);
      else setUserQuery('');
      setErrorMessage(null);
    } catch (e) {
      console.log('Failed to obtain exercise history: ', e);
      setErrorMessage('Failed to obtain exercise history');
    }
  };

  useEffect(() => {
    initialize();
  }, [exerciseId]);

  return (
    // <div className="px-1" style={{ width: '100%', height: '100%' }}>
    //   <div className="py-1">
    //     <b>History:</b>
    //   </div>
    <div
      style={{
        width: '100%',
        maxHeight: '20vh'
      }}
    >
      {errorMessage ? (
        errorMessage
      ) : history ? (
        <Table responsive striped bordered hover style={{ fontSize: '0.7em' }}>
          <thead>
            <tr>
              <th key={'th_action'} style={{ maxWidth: '15%' }}>
                Action
              </th>
              <th key={'th_query'} style={{ maxWidth: '50%' }}>
                Query
              </th>
              <th key={'th_success'} style={{ maxWidth: '15%' }}>
                Success
              </th>
              <th key={'th_date'} style={{ maxWidth: '20%' }}>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, i) => (
              <tr
                className="clickable"
                key={i + '_history_tr'}
                onClick={() => setUserQuery(item.query)}
                style={{
                  backgroundColor:
                    item.solution_success === 'COMPLETE'
                      ? '#03C988'
                      : item.solution_success === 'PARTIAL'
                      ? 'yellow'
                      : '',
                }}
              >
                <td key={item.id + '_action'}>{item.submit_attempt ? 'Submit' : 'Test'}</td>
                <td key={item.id + '_query'}>{item.query}</td>
                <td key={item.id + '_success'}>{item.solution_success}</td>
                <td key={item.id + '_date'}>{formatDate(item.date)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="loading-content">Loading history ...</div>
      )}
    </div>
    // </div>
  );
}
