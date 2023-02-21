import { useEffect, useState } from 'react';
import { services } from '../../../api/services';

export default function Result({ query, ...props }) {
  const [queryResult, setQueryResult] = useState([{}]);

  const initialize = async () => {
    console.log('query is ' + query);
    try {
    //   let result = await services.getQueryResult(query);
    //   setQueryResult(result);
    } catch (e) {
      console.log('Failed to get query result');
    }
  };

  useEffect(() => {
    initialize();
  });

  return (
    <div
      id="exercise_query_result"
      style={{ flex: 1, height: '100%', backgroundColor: 'lightgreen' }}
    >
      <table>
        <tr key={'header'}>
          {queryResult
            ? Object.keys(queryResult[0]).map((key) => <th>{key}</th>)
            : []}
        </tr>
        {queryResult?.map((item) => (
          <tr key={item.id}>
            {Object.values(item).map((val) => (
              <td>{val}</td>
            ))}
          </tr>
        ))}
      </table>
    </div>
  );
}
