import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { services } from '../../../api/services';

export default function ChangePassword({ ...props }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [title, setTitle] = useOutletContext();

  useEffect(() => {
    setTitle('Change Password');
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

  const handleChangePassword = async (e) => {
    console.log('Attempting to change password');
    e.preventDefault();
    try {
      await checkPassword();
      await services.changePassword(password, newPassword);
      console.log('Password changed successfully.');
      navigate('/home/exercises?id=1-1');
    } catch (e) {
      console.log('Changing password has failed.', e);
    }
  };

  return (
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
          type="password"
          placeholder="Enter new password"
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Confirm new password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Confirm new password"
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
      </Form.Group>

      <Button className="w-100 p-2 mt-2" type="submit" onClick={handleChangePassword}>
        Change password
      </Button>
    </Form>
  );
}
