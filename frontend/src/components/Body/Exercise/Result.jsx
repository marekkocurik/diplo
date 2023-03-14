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
        // TODO: vykreslit spravnost riesenia
        /*
        let result = await ..
        if (result.solution_success = ...)
        else ...
        */
      } else if (action === '') {
        // TODO: skusit odstranit podmienku
        if (props.queryResult)
          setQueryResult(props.queryResult);
      } else {
      }
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
    <div id="query_result" className="px-1" style={{ width: '100%', height:'100%' }}>
      <div className="py-2">
        <b>{table_name}</b>
      </div>
      <div
        style={{
          width: '100%',
          maxHeight: '90%',
          overflow: 'auto'
        }}
      >
        {errorMessage ? (
          errorMessage
        ) : (
          <Table striped bordered hover style={{ fontSize: '0.7em'}}>
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
        )}
      </div>
    </div>
  );
}
