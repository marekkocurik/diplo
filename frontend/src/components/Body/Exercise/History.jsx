import { useEffect, useState } from 'react';
import _ from 'lodash';
import { Table } from 'react-bootstrap';

export default function History({ query_history, ...props }) {
  const [history, setHistory] = useState(null);

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

  useEffect(() => {
    setHistory(query_history);
  }, []);

  return (
    <div className="px-1" style={{ width: '100%' }}>
      <div className="py-1" style={{ maxHeight: '10%' }}>
        <b>History:</b>
      </div>
      <div
        style={{
          width: '100%',
          maxHeight: '90%',
          overflow: 'auto',
        }}
      >
        {history === null ? null : (
          <Table id="user_query_history" striped bordered hover style={{ fontSize: '0.7em' }}>
            <thead>
              <tr>
                <th key={'th_action'}>Action</th>
                <th key={'th_query'}>Query</th>
                <th key={'th_success'}>Success</th>
                <th key={'th_date'}>Date</th>
              </tr>
            </thead>
            <tbody>
              {history?.map((item, i) => (
                <tr>
                  <td>{item.submit_attempt ? 'Submit' : 'Test'}</td>
                  <td>{item.query}</td>
                  <td>{item.solution_success}</td>
                  <td>{formatDate(item.date)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
