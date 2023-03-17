import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdBugReport, MdHomeFilled } from 'react-icons/md';
import { NavDropdown } from 'react-bootstrap';

export default function Header({ ...props }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    // TODO: dorobit nacitavanie username
    setUserName('Marek Kocurik');
  }, []);

  const handleLogoutClick = () => {
    try {
      localStorage.removeItem('token');
      navigate(`/auth/login`);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      className="py-1"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        boxShadow: '0px 1px 2px 1px #00000020',
        backgroundColor: '#2666CF',
        color: 'white',
      }}
    >
      <div style={{ display: 'flex' }}>
        <MdHomeFilled className="mx-2 clickable" size={25} onClick={() => navigate(`/home/dashboard`)} />
        <div className="mx-2 clickable" onClick={() => navigate(`/home/exercises`)}>
          Exercises
        </div>
        <div className="mx-2 clickable" onClick={() => navigate(`/home/leaderboard`)}>
          Leaderboard
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <NavDropdown id="nav-dropdown-dark-example" title={userName} className="mx-2">
          <NavDropdown.Item onClick={() => navigate(`/home/profile`)}>Profile</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={handleLogoutClick}>Logout</NavDropdown.Item>
        </NavDropdown>
        <MdBugReport className="mx-2 clickable" size={25} onClick={() => navigate(`/home/report-bug`)} />
      </div>
    </div>
  );
}
