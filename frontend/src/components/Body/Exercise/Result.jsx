import { useEffect, useState } from 'react';
import { services } from '../../../api/services';
import _ from 'lodash';
import { Table } from 'react-bootstrap';

export default function Result({ table_name, query, action, ...props }) {
  const [queryResult, setQueryResult] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const initialize = async () => {
    try {
      let result = [];
      if (action === 'test') {
        let test = await services.getQueryTestResult(
          query,
          props.solution,
          props.exerciseId
        );
        result = test.queryResult;
      } else if (action === 'submit') {
        // result = await services.getQuerySubmitResult(query);
      } else {
        result = await services.getQueryExpectedResult(query);
      }
      setQueryResult(result);
      setErrorMessage(null);
    } catch (e) {
      console.log(
        'Failed to get query result. Action: ' +
          (action === '' ? 'expected result' : action)
      );
      setQueryResult([]);
      const { message } = await e.response.json();
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    setQueryResult([]);
    setErrorMessage(null);
    if (query) initialize();
  }, [query]);

  return (
    <div
      className="p-2"
      id="exercise_query_result"
      style={{ flex: 1, height: '100%' }}
    >
      <div>
        <div>
          <b>{table_name}</b>
        </div>
        <div>
          {errorMessage ? (
            <div className="w-100 h-100 d-flex justify-content-center align-items-center text-center">
              <div>{errorMessage}</div>
            </div>
          ) : (
            <Table striped bordered hover>
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
