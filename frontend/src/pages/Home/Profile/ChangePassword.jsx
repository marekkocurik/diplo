import { useEffect, useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { services } from '../../../api/services';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';

export default function ChangePassword({ ...props }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showTooltips, setShowTooltips] = useState(false);
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const target = useRef(null);
  const [title, setTitle] = useOutletContext();

  useEffect(() => {
    setTitle('Change Password');
    setShowTooltips(false);
    setShow(false);
    setErrorMessage('');
  }, []);

  const checkLength = () => {
    if (newPassword.length === 0) {
      setErrorMessage('New password is empty.');
      throw new Error();
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password is too short.');
      throw new Error();
    }
  };

  const hasLowerCase = () => {
    if (newPassword.match(/[a-z]/) === null) {
      setErrorMessage('New password must contain a lowercase letter.')
      throw new Error();
    }
  };

  const hasUpperCase = () => {
    if (newPassword.match(/[A-Z]/) === null) {
      setErrorMessage('New password must contain an uppercase letter.');
      throw new Error();
    }
  };

  const hasNumber = () => {
    if (newPassword.match(/[0-9]/) === null) {
      setErrorMessage('New password must contain a number.');
      throw new Error();
    }
  };

  const hasSpecial = () => {
    if (false) {
      setErrorMessage('New password must include a special character.');
      throw new Error();
    }
  };

  const passwordsMatch = () => {
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.')
      throw new Error();
    }
  };

  const checkPassword = () => {
    try {
      checkLength();
      hasLowerCase();
      hasUpperCase();
      hasNumber();
      // await hasSpecial();
      passwordsMatch();
    } catch (e) {
      throw e;
    }
  };

  const handleClose = () => setShow(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      checkPassword();
      await services.changePassword(password, newPassword);
      navigate('/home/dashboard');
    } catch (e) {
      if(e.response) {
        const { message } = await e.response.json();
        setErrorMessage(message);
      }
      setShow(true);
    }
  };

  return (
    <>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Current password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter current password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>New password</Form.Label>
          <Form.Control
            ref={target}
            type="password"
            placeholder="Enter new password"
            onChange={(e) => setNewPassword(e.target.value)}
            onFocus={() => setShowTooltips(!showTooltips)}
            onBlur={() => setShowTooltips(!showTooltips)}
          />
          <Overlay target={target.current} show={showTooltips} placement="right">
            {(props) => (
              <Tooltip className="background-red" {...props}>
                Password must meet following requirements:
                <ul>
                  <li>At least 8 characters long</li>
                  <li>At least 1 uppercase letter</li>
                  <li>At least 1 lowercase letter</li>
                  <li>At least 1 number</li>
                </ul>
              </Tooltip>
            )}
          </Overlay>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm new password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm new password"
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </Form.Group>

        <Button
          className="w-100 p-2 mt-2"
          style={{ backgroundColor: '#2666CF' }}
          type="submit"
          onClick={handleChangePassword}
        >
          Change password
        </Button>
      </Form>

      <Modal show={show} onHide={handleClose}>
        <Modal.Body>{errorMessage}</Modal.Body>
      </Modal>
    </>
  );
}
