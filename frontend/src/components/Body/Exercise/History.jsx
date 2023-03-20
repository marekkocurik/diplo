import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import _ from 'lodash';

export default function History({ exerciseId, setUserQuery, history, setHistory, ...props }) {
  // const [history, setHistory] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchParams] = useSearchParams();
  const { exerciseTree, setExerciseTree, historyInitialized, setHistoryInitialized } = props;

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

  const updateExerciseTree = (history) => {
    if (history.length === 1 || history[0].solution_success === 'COMPLETE') {
      let newTree = JSON.parse(JSON.stringify(exerciseTree));
      let chapter_id = searchParams.get('id').split('-')[0];
      const chapter = newTree.find((item) => item._id === parseInt(chapter_id));
      const exercise = chapter.exercises.find((item) => item.id === parseInt(exerciseId));
      exercise.started = true;
      exercise.solved = history[0].solution_success === 'COMPLETE' ? true : false;
      setExerciseTree(newTree);
    }
  };

  const initialize = async () => {
    try {
      let result = await services.getExerciseHistory(exerciseId);
      setHistory(result.answers);
      if (result.answers[0]) {
        setUserQuery(result.answers[0].query);
        updateExerciseTree(result.answers);
      }
      setErrorMessage(null);
    } catch (e) {
      console.log('Failed to obtain exercise history: ', e);
      setErrorMessage('Failed to obtain exercise history');
    }
  };

  useEffect(() => {
    // setHistory(query_history);
    // if (action !== '') {
    if (!historyInitialized && _.isEqual(history, [])) {
      initialize();
      setHistoryInitialized(true);
    }

    //   setAction('');
    // }
  }, [history]);

  return (
    // <div className="px-1" style={{ width: '100%', height: '100%' }}>
    //   <div className="py-1">
    //     <b>History:</b>
    //   </div>
      <div
        style={{
          width: '100%',
          // maxHeight: '90%',
          overflow: 'auto',
        }}
      >
        {errorMessage ? (
          errorMessage
        ) : history ? (
          <Table id="user_query_history" striped bordered hover style={{ fontSize: '0.7em' }}>
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
                <tr className="clickable" key={item.id + '_tr'} onClick={() => setUserQuery(item.query)} style={{ backgroundColor: item.solution_success === 'COMPLETE' ? '#03C988' : item.solution_success === 'PARTIAL' ? 'yellow' : ''}}>
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
