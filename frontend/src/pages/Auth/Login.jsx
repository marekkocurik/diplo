import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { services } from '../../api/services';

export default function Login({ ...props }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useOutletContext();
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setTitle('Welcome nginx');
    setShow(false);
    setErrorMessage('');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let response = await services.login(email, password);
      localStorage.setItem('token', response.token);
      navigate('/home/dashboard');
    } catch (e) {
      const { message } = await e.response.json();
      setErrorMessage(message);
      setShow(true);
    }
  };

  const handleClose = () => setShow(false);

  return (
    <>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
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
            <Link to="/auth/forgot-password" style={{ color: '#2666CF' }}>
              Forgot your password?
            </Link>
          </Form.Text>
        </div>

        <Button className="w-100 p-2 mt-2" style={{ backgroundColor: '#2666CF' }} onClick={handleLogin} type="submit">
          Login
        </Button>

        <div className="text-center mt-2">
          <Form.Text>
            Don't have an account?{' '}
            <Link to="/auth/register" style={{ color: '#2666CF' }}>
              Sign up!
            </Link>
          </Form.Text>
        </div>
      </Form>

      <Modal show={show} onHide={handleClose}>
        <Modal.Body>{errorMessage}</Modal.Body>
      </Modal>
    </>
  );
}
