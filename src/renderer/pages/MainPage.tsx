import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export default function MainPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
}
