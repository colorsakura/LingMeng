import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSessionStore, useSettingsStore } from './stores/settingsStore';
import MainPage from './pages/MainPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const loadSessions = useSessionStore((s) => s.loadSessions);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    loadSettings();
    loadSessions();
  }, [loadSettings, loadSessions]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<ChatPage />} />
          <Route path="chat/:sessionId" element={<ChatPage />} />
        </Route>
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
