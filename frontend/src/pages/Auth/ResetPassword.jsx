import { useEffect, useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { services } from '../../api/services';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';

export default function ResetPassword({ ...props }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [show, setShow] = useState(false);
  const target = useRef(null);
  const [title, setTitle] = useOutletContext();

  useEffect(() => {
    setTitle('Reset Password');
    setShow(false);
  }, []);

  const checkLength = async () => {
    if (newPassword.length < 8) throw new Error('Password is too short.');
  };

  const hasLowerCase = async () => {
    if (newPassword.match(/[a-z]/) === null) throw new Error('Password must include a small letter.');
  };

  const hasUpperCase = async () => {
    if (newPassword.match(/[A-Z]/) === null) throw new Error('Password must include a capital letter.');
  };

  const hasNumber = async () => {
    if (newPassword.match(/[0-9]/) === null) throw new Error('Password must include a number.');
  };

  const hasSpecial = async () => {
    if (false) throw new Error('Password must include a special character.');
  };

  const passwordsMatch = async () => {
    if (newPassword !== confirmNewPassword) throw new Error('Passwords do not match.');
  };

  const checkPassword = async () => {
    try {
      await checkLength();
      await hasLowerCase();
      await hasUpperCase();
      await hasNumber();
      // await hasSpecial();
      await passwordsMatch();
    } catch (e) {
      throw e;
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      // console.log(email.includes('@')===false);
      // await services.login(login, password);
      await checkPassword();
      // navigate('/auth/login');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>New password</Form.Label>
        <Form.Control
          ref={target}
          type="password"
          placeholder="Enter new password"
          onChange={(e) => setNewPassword(e.target.value)}
          onFocus={() => setShow(!show)}
          onBlur={() => setShow(!show)}
        />
        <Overlay target={target.current} show={show} placement="right">
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
        onClick={handleResetPassword}
      >
        Reset password
      </Button>
    </Form>
  );
}
