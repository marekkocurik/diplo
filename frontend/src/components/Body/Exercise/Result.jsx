import { useEffect, useState } from 'react';
import { services } from '../../../api/services';
import _ from 'lodash';
import { Table } from 'react-bootstrap';

export default function Result({ table_name, action, setAction, query, ...props }) {
  const {
    solution,
    exerciseId,
    setHistory,
    setHistoryInitialized,
    setSolutions,
    setSolutionsInitialized,
    // initialized,
    // setInitialized,
    // queryResult,
    // setQueryResult,
    // errorMessage,
    // setErrorMessage,
  } = props;

  const [queryResult, setQueryResult] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const initialize = async () => {
    let result;
    try {
      if (action === 'test') {
        result = await services.getQueryTestResult(query, solution, exerciseId);
      } else if (action === 'submit') {
        result = await services.getQuerySubmitResult(query, solution, exerciseId);

        // TODO: upozornit usera ci je jeho query spravne
        /*
        let result = await ..
        if (result.solution_success = ...)
        else ...
        */
      } else if (action === 'initialize') {
        result = await services.getQueryExpectedResult(query);
        // if (!initialized) {
        //   setInitialized(true);
        // }
      }
      setQueryResult(result.queryResult);
      setErrorMessage(null);
    } catch (e) {
      console.log('Failed to get query result. Action: ' + (action === '' ? 'expected result' : action));
      const { message } = await e.response.json();
      setErrorMessage(message);
    } finally {
      if (action === 'test' || action === 'submit') {
        let h = {
          id: result === undefined ? -1 : result.id,
          submit_attempt: action === 'test' ? false : true,
          query: query,
          solution_success: result === undefined? 'ERROR' : result.solutionSuccess,
          date: Date.now(),
        };
        setHistoryInitialized(false);
        setHistory((prevHistory) => [h, ...prevHistory]);
        if (result !== undefined && result.solution_success === 'COMPLETE') {
          setSolutionsInitialized(false);
          setSolutions((prevSolutions) => [query, ...prevSolutions]);
        }
      }
    }
  };

  useEffect(() => {
    if (action !== '') {
      initialize();
      setAction('');
    }
  }, [action]);

  return (
    <div id="query_result" className="px-1" style={{ width: '100%', height: '100%' }}>
      <div className="py-2">
        <b>{table_name}</b>
      </div>
      <div
        style={{
          width: '100%',
          maxHeight: '90%',
          overflow: 'auto',
        }}
      >
        {errorMessage ? (
          errorMessage
        ) : queryResult ? (
          <Table striped bordered hover style={{ fontSize: '0.7em' }}>
            <thead>
              <tr>
                {_.keys(queryResult[0]).map((key) => (
                  <th key={'th_' + key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queryResult.map((item, i) => (
                <tr key={item.id + '_' + i}>
                  {_.values(item).map((val, j) => (
                    <td
                      key={'tr_' + item.id + '_' + i + '_' + j}
                      style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="loading-content">Loading query result ... </div>
        )}
      </div>
    </div>
  );
}
