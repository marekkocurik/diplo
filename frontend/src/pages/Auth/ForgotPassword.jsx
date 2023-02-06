import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

export default function ForgotPassword({ ...props }) {
  const [email, setEmail] = useState('');
  const [title, setTitle] = useOutletContext();

  useEffect(() => {
    setTitle('Forgot Password');
  }, []);

  const verifyEmail = async () => {
    //tu zavolam endpoint ktory overi ze emailova adresa je registrovana
  }

  const handleSendEmail = async () => {
    try {
      await verifyEmail();
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
      </Form>
    </>
  );
}
