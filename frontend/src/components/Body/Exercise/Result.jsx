import { useEffect, useState } from 'react';
import { services } from '../../../api/services';
import _ from 'lodash';
import { Table } from 'react-bootstrap';

// finally {
//   if (action === 'test' || action === 'submit') {
//     let h = {
//       id: result === undefined ? -1 : result.id,
//       submit_attempt: action === 'test' ? false : true,
//       query: query,
//       solution_success: result === undefined ? 'ERROR' : result.solutionSuccess,
//       date: Date.now(),
//     };
//     setHistoryInitialized(false);
//     setHistory((prevHistory) => [h, ...prevHistory]);
//     if (result !== undefined && result.solutionSuccess === 'COMPLETE') {
//       setSolutionsInitialized(false);
//       setSolutions((prevSolutions) => [query, ...prevSolutions]);
//     }
//   }

export default function Result({ table_name, queryResult, errorMessage, ...props }) {
  return (
    <div id="query_result" className="p-3" style={{ width: '100%' }}>
      <div className="py-2">
        <b>{table_name}</b>
      </div>
      <div
        style={{
          width: '100%',
          minHeight: '10vh',
          maxHeight: '30vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        {errorMessage ? (
          errorMessage
        ) : queryResult?.length ? (
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
          <div
            style={{ color: '#aaa' }}
            className="loading-content w-100 h-100 d-flex justify-content-center align-items-center"
          >
            {queryResult && !queryResult.length ? '0 rows returned.' : 'No solution.'}
          </div>
        )}
      </div>
    </div>
  );
}
