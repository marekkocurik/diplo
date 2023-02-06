import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

export default function ResetPassword({ ...props }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [title, setTitle] = useOutletContext();
  
  useEffect(() => {
    setTitle('Reset Password');
  }, []);

  const checkLength = async () => {
    if (password.length < 8) throw new Error('Password is too short.');
  };

  const hasLowerCase = async () => {
    if (password.match(/[a-z]/) === null)
      throw new Error('Password must include a small letter.');
  };

  const hasUpperCase = async () => {
    if (password.match(/[A-Z]/) === null)
      throw new Error('Password must include a capital letter.');
  };

  const hasNumber = async () => {
    if (password.match(/[0-9]/) === null)
      throw new Error('Password must include a number.');
  };

  const hasSpecial = async () => {
    if (false) throw new Error('Password must include a special character.');
  };

  const passwordsMatch = async () => {
    if (password !== confirmPassword) throw new Error('Passwords do not match.');
  }

  const checkPassword = async () => {
    try {
      await checkLength();
      await hasLowerCase();
      await hasUpperCase();
      await hasNumber();
      await hasSpecial();
      await passwordsMatch();
    } catch (e) {
      throw e;
    }
  };

  const handleResetPassword = async () => {
    try {
        // console.log(email.includes('@')===false);
        // await services.login(login, password);
        // navigate('/dashboard');
        await checkPassword();
      } catch (e) {
        console.log(e);
      }
  }

  return (
    <>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>

        <Button
          className="w-100 p-2 mt-2"
          type="submit"
          onClick={handleResetPassword}
        >
          Reset password
        </Button>
      </Form>
    </>
  );
}
