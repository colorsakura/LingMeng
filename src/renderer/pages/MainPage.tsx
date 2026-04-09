import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export default function MainPage() {
  return (
    <div className="flex h-full">
      {/* Sidebar - always visible on desktop */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
