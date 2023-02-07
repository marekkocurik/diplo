import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { services } from '../../api/services';

export default function Register({ ...props }) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [title, setTitle] = useOutletContext();

  useEffect(() => {
    setTitle('Create your account');
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

  const checkEmail = async () => {
    if (email.includes('@') === false)
      throw new Error('Invalid email address.');
  };

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

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // await checkEmail();
      // await checkPassword();
      await services.register(name, surname, email, password);
      // navigate('/auth/login');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Surname</Form.Label>
          <Form.Control
            placeholder="Enter your surname"
            onChange={(e) => setSurname(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

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

        <Button className="w-100 p-2 mt-2" type="submit" onClick={handleSignUp}>
          Sign up
        </Button>
      </Form>
    </>
  );
}