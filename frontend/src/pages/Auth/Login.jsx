import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { services } from '../../api/services';

export default function Login({ ...props }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useOutletContext();

  useEffect(() => {
    setTitle('Welcome');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await services.login(email, password);
      // navigate('/dashboard');
    } catch (e) {}
  };

  return (
    <>
      <Form>
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

        <div className="text-center" style={{ fontSize: '0.8em' }}>
          <Form.Text>
            <Link to="/auth/forgot-password">Forgot your password?</Link>
          </Form.Text>
        </div>

        <Button className="w-100 p-2 mt-2" onClick={handleLogin} type="submit">
          Login
        </Button>

        <div className="text-center mt-2">
          <Form.Text>
            Don't have an account? <Link to="/auth/register">Sign up!</Link>
          </Form.Text>
        </div>
      </Form>
    </>
  );
}
