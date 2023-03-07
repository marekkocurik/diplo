import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

export default function Profile({ ...props }) {
  const [title, setTitle] = useState('');
  return (
    <div
      className="w-100 d-flex flex-column justify-content-center align-items-center"
      style={{ height: '100vh' }}
    >
      <h2 className="mb-4">{title}</h2>
      <Card className="auth-window">
        <Outlet context={[title, setTitle]} />
      </Card>
    </div>
  );
}
