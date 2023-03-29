import { useEffect, useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { services } from '../../api/services';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';

export default function Register({ ...props }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTooltips, setShowTooltips] = useState(false);
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const target = useRef(null);
  const [title, setTitle] = useOutletContext();

  useEffect(() => {
    setTitle('Create your account');
    setShowTooltips(false);
    setShow(false);
    setErrorMessage('');
  }, []);

  const checkLength = () => {
    if (password.length === 0) {
      setErrorMessage('Password is empty.');
      throw new Error();
    }
    if (password.length < 8) {
      setErrorMessage('Password is too short.');
      throw new Error();
    }
  };

  const hasLowerCase = () => {
    if (password.match(/[a-z]/) === null) {
      setErrorMessage('Password must contain a lowercase letter.')
      throw new Error();
    }
  };

  const hasUpperCase = () => {
    if (password.match(/[A-Z]/) === null) {
      setErrorMessage('Password must contain an uppercase letter.');
      throw new Error();
    }
  };

  const hasNumber = () => {
    if (password.match(/[0-9]/) === null) {
      setErrorMessage('Password must contain a number.');
      throw new Error();
    }
  };

  const hasSpecial = () => {
    if (false) {
      setErrorMessage('Password must include a special character.');
      throw new Error();
    }
  };

  const passwordsMatch = () => {
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      throw new Error();
    }
  };

  const checkEmail = () => {
    if (email.includes('@') === false) {
      setErrorMessage('Invalid email address.');
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

  const checkUsername = () => {
    if (name.trim().length === 0) {
      setErrorMessage('Name is empty.');
      throw new Error();
    }
    if (surname.trim().length === 0) {
      setErrorMessage('Surname is empty.');
      throw new Error();
    }
  };

  const handleClose = () => setShow(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      checkUsername();
      checkEmail();
      checkPassword();
      await services.register(name, surname, email, password);
      navigate('/auth/login');
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
          <Form.Label>Name</Form.Label>
          <Form.Control placeholder="Enter your name" onChange={(e) => setName(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Surname</Form.Label>
          <Form.Control placeholder="Enter your surname" onChange={(e) => setSurname(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            ref={target}
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
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
          <Form.Label>Confirm password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>

        <Button className="w-100 p-2 mt-2" style={{ backgroundColor: '#2666CF' }} type="submit" onClick={handleSignUp}>
          Sign up
        </Button>

        <div className="mt-2" style={{ fontSize: '0.8em', textAlign: 'right' }}>
          <Form.Text>
            <Link to="/auth/login" style={{ color: '#2666CF' }}>
              Back to login.
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
