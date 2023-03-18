import { useEffect, useState } from 'react';
import _ from 'lodash';
import { Table } from 'react-bootstrap';

export default function History({ query_history, setStudentQuery, ...props }) {
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
    <div className="px-1" style={{ width: '100%', height: '100%' }}>
      <div className="py-1">
        <b>History:</b>
      </div>
      <div
        style={{
          width: '100%',
          maxHeight: '90%',
          overflow: 'auto',
        }}
      >
        {query_history === null ? null : (
          <Table id="user_query_history" striped bordered hover style={{ fontSize: '0.7em' }}>
            <thead>
              <tr>
                <th key={'th_action'} style={{maxWidth: '15%'}}>Action</th>
                <th key={'th_query'} style={{maxWidth: '50%'}}>Query</th>
                <th key={'th_success'} style={{maxWidth: '15%'}}>Success</th>
                <th key={'th_date'} style={{maxWidth: '20%'}}>Date</th>
              </tr>
            </thead>
            <tbody>
              {query_history?.map((item, i) => (
                <tr className="clickable" key={item.id+'_tr'} onClick={() => setStudentQuery(item.query)}>
                  <td key={item.id+'_action'}>{item.submit_attempt ? 'Submit' : 'Test'}</td>
                  <td key={item.id+'_query'}>{item.query}</td>
                  <td key={item.id+'_success'}>{item.solution_success}</td>
                  <td key={item.id+'_date'}>{formatDate(item.date)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
