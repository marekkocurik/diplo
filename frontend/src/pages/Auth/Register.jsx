import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

export default function Register({ ...props }) {
  const [title, setTitle] = useOutletContext();
  useEffect(() => {
    setTitle('Create your account');
  }, []);
  return <>
  <Form>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setLogin(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <div className="text-center" style={{ fontSize: '0.8em' }}>
          <Form.Text>
            <Link to="/auth/forgot-password">Forgot your password?</Link>
          </Form.Text>
        </div>

        <Button className="w-100 p-2 mt-2" type="submit">
          Login
        </Button>

        <div className="text-center mt-2">
          <Form.Text>
            Don't have an account? <Link to="/auth/register">Sign up!</Link>
          </Form.Text>
        </div>
      </Form>
  </>;
}
