import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { services } from '../../api/services';

export default function ForgotPassword({ ...props }) {
  const [email, setEmail] = useState('');
  const [title, setTitle] = useOutletContext();

  useEffect(() => {
    setTitle('Forgot Password');
  }, []);

  // const verifyEmail = async () => {
  //   //tu zavolam endpoint ktory overi ze emailova adresa je registrovana
  // }

  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await services.getHello();
    } catch (e) {

    }
  }

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

        <Button className="w-100 p-2 mt-2" type="submit" onClick={handleSendEmail}>
          Send email
        </Button>

        <div className="mt-2" style={{ fontSize: '0.8em', textAlign: 'right'}}>
          <Form.Text>
            <Link to="/auth/login">Back to login.</Link>
          </Form.Text>
        </div>

      </Form>
    </>
  );
}
