import SidebarHeader from './SidebarHeader';
import SessionList from './SessionList';
import BackendSwitcher from './BackendSwitcher';

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* Header */}
      <SidebarHeader />

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Session List */}
      <div className="sidebar-sessions">
        <SessionList />
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Backend Switcher */}
      <div className="sidebar-backend">
        <BackendSwitcher />
      </div>
    </div>
  );
}
