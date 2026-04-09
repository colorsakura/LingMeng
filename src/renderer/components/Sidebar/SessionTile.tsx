import { useState } from 'react';
import { ChatSession, BackendProvider, BackendProviderDisplayNames, BackendProviderColors } from '@shared/types';

interface SessionTileProps {
  session: ChatSession;
  isSelected: boolean;
  onTap: () => void;
  onDelete: () => void;
}

export default function SessionTile({ session, isSelected, onTap, onDelete }: SessionTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const backendColor = BackendProviderColors[session.backend];

  // Backend icons
  const getBackendIcon = () => {
    switch (session.backend) {
      case BackendProvider.Kimi:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
          </svg>
        );
      case BackendProvider.DeepSeek:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinejoin="round" />
            <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case BackendProvider.Doubao:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18" />
            <path d="M3 12h18" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        );
      case BackendProvider.Qianwen:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" strokeLinejoin="round" />
            <path d="M5 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" strokeLinejoin="round" />
            <path d="M17 14l.75 1.5 1.5.75-1.5.75L17 19l-.75-1.5-1.5-.75 1.5-.75.75-1.5z" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onTap}
      className={`session-tile ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
    >
      {/* Selection Indicator */}
      {isSelected && <div className="session-tile-indicator" />}

      {/* Icon */}
      <div className="session-tile-icon" style={{ color: backendColor }}>
        {getBackendIcon()}
      </div>

      {/* Content */}
      <div className="session-tile-content">
        <p className="session-tile-title">{session.name}</p>
        {session.lastMessage && (
          <p className="session-tile-preview">{session.lastMessage}</p>
        )}
      </div>

      {/* Backend Badge */}
      <div
        className="session-tile-badge"
        style={{
          backgroundColor: `${backendColor}15`,
          color: backendColor
        }}
      >
        {BackendProviderDisplayNames[session.backend]}
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`session-tile-delete ${isHovered || isSelected ? 'visible' : ''}`}
        title="删除"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
