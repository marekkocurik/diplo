import { useEffect, useState } from 'react';
import { services } from '../../../api/services';
import _ from 'lodash';

export default function Result({ query, ...props }) {
  const [queryResult, setQueryResult] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const initialize = async () => {
    console.log('query is ' + query);
    try {
      let result = await services.getQueryResult(query);
      setQueryResult(result);
      setErrorMessage(null);
    } catch (e) {
      console.log('Failed to get query result');
      setQueryResult([]);
      const { message } = await e.response.json();
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    if (query) initialize();
  }, [query]);

  return (
    <div
      id="exercise_query_result"
      style={{ flex: 1, height: '100%', backgroundColor: 'lightgreen' }}
    >
      {errorMessage ? (
        <div className="w-100 h-100 d-flex justify-content-center align-items-center text-center">
          <div>{errorMessage}</div>
        </div>
      ) : (
        <table>
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
        </table>
      )}
    </div>
  );
}