import { useEffect, useState } from 'react';
import { services } from '../../api/services';
import { Button, Table } from 'react-bootstrap';

export default function Leaderboard({ ...props }) {
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [mode, setMode] = useState('execTime');

  const initialize = async () => {
    try {
      const res = await services.getOverallLeaderboard();
      setData(res.leaderboards);
      setErrorMessage(null);
    } catch (error) {
      const { message } = await error.response.json();
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div>
      <h3 className="pt-3 pb-1 px-5">Overall Leaderboard</h3>
      {errorMessage ? (
        errorMessage
      ) : (
        <div className="w-100 px-5 d-flex flex-column justify-content-center">
          <div className="w-100 d-flex pb-3">
            <Button
              style={{ opacity: mode === 'execTime' ? 1 : 0.5, fontSize: '0.9em' }}
              onClick={() => setMode('execTime')}
            >
              Execution time
            </Button>
            <Button
              className="mx-1"
              style={{ opacity: mode === 'attempts' ? 1 : 0.5, fontSize: '0.9em' }}
              onClick={() => setMode('attempts')}
            >
              Attempts
            </Button>
          </div>
          <div>
            {mode === 'execTime' ? (
              <Table striped bordered hover style={{ fontSize: '0.8em' }}>
                <thead>
                  <tr>
                    <th>Chapter ID</th>
                    <th>Chapter Name</th>
                    <th>Exercise ID</th>
                    <th>Exercise Name</th>
                    <th>User Name</th>
                    <th>Execution Time (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.byTime.map((item, index) => (
                    <tr key={index}>
                      <td>{item.c_id}</td>
                      <td>{item.c_name}</td>
                      <td>{item.e_id}</td>
                      <td>{item.e_name}</td>
                      <td>{item.username}</td>
                      <td>{item.execution_time}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Table striped bordered hover style={{ fontSize: '0.8em' }}>
                <thead>
                  <tr>
                    <th>Chapter ID</th>
                    <th>Chapter Name</th>
                    <th>Exercise ID</th>
                    <th>Exercise Name</th>
                    <th>User Name</th>
                    <th>User Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.byAttempts.map((item, index) => (
                    <tr key={index}>
                      <td>{item.c_id}</td>
                      <td>{item.c_name}</td>
                      <td>{item.e_id}</td>
                      <td>{item.e_name}</td>
                      <td>{item.username}</td>
                      <td>{item.attempts}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 *
 *
 */
