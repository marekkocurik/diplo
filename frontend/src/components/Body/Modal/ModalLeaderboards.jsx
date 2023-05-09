import { useEffect, useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { services } from '../../../api/services';

export function ModalLeaderboards({ show, setShow, exerciseId, finished, ...props }) {
  const handleClose = () => setShow(false);
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [mode, setMode] = useState('execTime');

  const initialize = async () => {
    try {
      const res = await services.showSolutions(exerciseId);
      setData(res.leaderboards);
      setErrorMessage(null);
    } catch (error) {
      const { message } = await error.response.json();
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    if (show) {
      initialize();
    }
  }, [show]);

  return (
    <Modal className="custom-modal" centered size="lg" animation={false} show={show} onHide={handleClose}>
      <Modal.Header className="border-0" closeButton>
        <Modal.Title style={{ fontSize: '1.5em' }}>Task Leaderboards</Modal.Title>
      </Modal.Header>
      <div className="w-100 d-flex px-3">
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
      <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {errorMessage ? (
          errorMessage
        ) : mode === 'execTime' ? (
          <Table striped bordered hover style={{ fontSize: '0.8em' }}>
            <thead>
              <tr>
                <th>Query</th>
                <th>Execution Time</th>
              </tr>
            </thead>
            <tbody>
              {data?.byTime.map((item, index) => (
                <tr key={index}>
                  <td style={{ maxWidth: '300px' }}>{item.query}</td>
                  <td>{item.execution_time}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Table striped bordered hover style={{ fontSize: '0.8em', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {data?.byAttempts.map((item, index) => (
                <tr key={index}>
                  <td>{item.username}</td>
                  <td>{item.attempts}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
}
