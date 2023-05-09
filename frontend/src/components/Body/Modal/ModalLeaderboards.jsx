import { useEffect, useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { services } from '../../../api/services';

export function ModalLeaderboards({ show, setShow, ...props }) {
  const handleClose = () => setShow(false);
  const [data, setData] = useState(null);

  const initialize = async () => {
    const res = await services.getDummyData();
    setData(res.data);
  };

  const [mode, setMode] = useState('exec');

  useEffect(() => {
    initialize();
  }, []);

  return (
    <Modal className="custom-modal" centered size="lg" animation={false} show={show} onHide={handleClose}>
      <Modal.Header className="border-0" closeButton>
        <Modal.Title>Task Leaderboards</Modal.Title>
      </Modal.Header>
      <div className="w-100 d-flex px-3">
        <Button style={{ opacity: mode === 'exec' ? 1 : 0.5 }} onClick={() => setMode('exec')}>
          Execution time
        </Button>
        <Button style={{ opacity: mode === 'attempts' ? 1 : 0.5 }} onClick={() => setMode('attempts')}>
          Attempts
        </Button>
      </div>
      <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {mode === 'exec' && (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>User</th>
                <th>Query</th>
                <th>Execution Time</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td style={{ maxWidth: '300px' }}>{item.query}</td>
                  <td>{item.execution_time}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        
        {mode === 'attempts' && (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>User</th>
                <th>Query</th>
                <th>Execution Time</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td style={{ maxWidth: '300px' }}>{item.query}</td>
                  <td>{item.execution_time}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
}
