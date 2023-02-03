import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

export default function ForgotPassword({ ...props }) {
  const [title, setTitle] = useOutletContext();
  useEffect(() => {
    setTitle('Forgot Password');
  }, []);
  return <></>;
}
