import { useEffect, useState } from 'react';
import { services } from '../../../api/services';
import _ from 'lodash';
import { Table } from 'react-bootstrap';

export default function Result({ table_name, action, query, ...props }) {
  const [queryResult, setQueryResult] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const initialize = async () => {
    try {
      if (action === 'test') {
        let result = await services.getQueryTestResult(query, props.solution, props.exerciseId);
        setQueryResult(result.queryResult);
      } else if (action === 'submit') {
        let result = await services.getQuerySubmitResult(query, props.solution, props.exerciseId);
        setQueryResult(result.queryResult);
        /*
        let result = await ..
        if (result.solution_success = ...)
        else ...
        */
      } else if (action === '') {
        if(props.queryResult) // TODO: skusit odstranit podmienku
          setQueryResult(props.queryResult);
      } else {}
      setErrorMessage(null);
    } catch (e) {
      console.log('Failed to get query result. Action: ' + (action === '' ? 'expected result' : action));
      const { message } = await e.response.json();
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    initialize();
  }, [query, action]);

  return (
    <div id="exercise_query_result" /*className="p-2" style={{ flex: 1, height: '100%' }}*/ >
      <div>
        <div>
          <b>{table_name}</b>
        </div>
        <div /* style={{ height: '70vh', overflow: 'scroll', overflowX: 'hidden', overflowY: 'auto' }} */>
          {errorMessage ? (
            <div /*className="w-100 h-100 d-flex justify-content-center align-items-center text-center" */>
              <div>{errorMessage}</div>
            </div>
          ) : (
            <Table striped bordered hover /*style={{ fontSize: '11px', maxWidth: '50%', tableLayout: 'auto' }} */>
              <thead>
                <tr>
                  {_.keys(queryResult[0]).map((key) => (
                    <th key={'th_' + key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResult?.map((item, i) => (
                  <tr key={item.id + '_' + i}>
                    {_.values(item).map((val, j) => (
                      <td key={'tr_' + item.id + '_' + i + '_' + j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
