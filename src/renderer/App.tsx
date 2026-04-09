import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSessionStore, useSettingsStore, useNoteStore } from './stores/settingsStore';
import MainPage from './pages/MainPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import NotesPage from './pages/NotesPage';

function App() {
  const loadSessions = useSessionStore((s) => s.loadSessions);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadNotes = useNoteStore((s) => s.loadNotes);

  useEffect(() => {
    loadSettings();
    loadSessions();
    loadNotes();
  }, [loadSettings, loadSessions, loadNotes]);

  return (
    <div className="h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-content)' }}>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<ChatPage />} />
          <Route path="chat/:sessionId" element={<ChatPage />} />
          <Route path="notes" element={<NotesPage />} />
        </Route>
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
