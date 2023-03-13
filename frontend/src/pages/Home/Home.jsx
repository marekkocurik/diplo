import { useEffect, useRef, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import { Outlet } from 'react-router-dom';

export default function Home({ ...props }) {
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const [outletHeight, setOutletHeight] = useState(0);

  useEffect(() => {
    const headerHeight = headerRef.current.offsetHeight;
    const footerHeight = footerRef.current.offsetHeight;
    const outletHeight = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;
    setOutletHeight(outletHeight);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '100vh' }}>
      <div ref={headerRef}>
        <Header />
      </div>
      <div style={{ height: outletHeight, overflowY: 'auto' }}>
        <Outlet />
      </div>
      <div ref={footerRef}>
        <Footer />
      </div>
    </div>
  );
}
