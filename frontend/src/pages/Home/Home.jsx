import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import { Outlet } from 'react-router-dom';

export default function Home({ ...props }) {
  return (
    <div>
      <Header></Header>
      <Outlet />
      <Footer></Footer>
    </div>
  );
}
