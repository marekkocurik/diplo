import { Button, Modal } from 'react-bootstrap';

export function ModalConfirmation({ show, setShow, onAgree, ...props }) {
  const handleClose = () => setShow(false);

  return (
    <Modal centered size="md" animation={false} show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Are you sure?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        If you view other users' solutions for this exercise, your new solutions for this exercise will no longer count
        towards the leaderboards. This decision only applies for this exercise, but it cannot be reversed.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onAgree}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
