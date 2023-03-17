import { useEffect, useRef, useState } from 'react';
import Header from '../../components/Header/Header';
import { Outlet } from 'react-router-dom';

export default function Home({ ...props }) {
  const [outletHeight, setOutletHeight] = useState(0);

  useEffect(() => {
    const hHeight = document.getElementById('header').offsetHeight;
    const outletHeight = `calc(100vh - ${hHeight}px)`;
    setOutletHeight(outletHeight);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '100vh' }}>
      <div id="header" >
        <Header />
      </div>
      <div
        id="outlet"
        style={{ minHeight: outletHeight, height: outletHeight, maxHeight: outletHeight, overflowY: 'auto' }}
      >
        <Outlet />
      </div>
    </div>
  );
}
