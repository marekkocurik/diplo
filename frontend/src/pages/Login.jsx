import { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Login(props) {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = () => {
    console.log(login,password);
    navigate('/dashboard');
  };

  return (
    <div
      className="w-100 d-flex flex-column justify-content-center align-items-center"
      style={{ height: '100vh' }}
    >
      <h2 className="mb-4">Welcome</h2>
      <Card className="p-4" style={{ width: '400px', background: '#FBFBFB' }}>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Login</Form.Label>
            <Form.Control placeholder="Enter your login" onChange={e => setLogin(e.target.value)}/>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Enter your password" onChange={e => setPassword(e.target.value)}/>
          </Form.Group>

          <div className="w-100 text-center" style={{ fontSize: '0.8em' }}>
            <Form.Label>Forgot your password?</Form.Label>
          </div>

          <Button
            className="w-100 p-2 mt-2"
            onClick={handleLogin}
            type="submit"
          >
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
