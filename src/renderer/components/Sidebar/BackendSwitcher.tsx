import { useState, useRef, useEffect } from 'react';
import { BackendProvider, BackendProviderDisplayNames, BackendProviderColors } from '@shared/types';
import { useSettingsStore } from '../../stores/settingsStore';

export default function BackendSwitcher() {
  const { currentBackend, setCurrentBackend, tokens } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const providers = Object.values(BackendProvider);
  const selectedProvider = currentBackend;
  const selectedColor = BackendProviderColors[selectedProvider];

  return (
    <div className="backend-switcher" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="backend-switcher-trigger"
        style={{ '--backend-color': selectedColor } as React.CSSProperties}
      >
        <div className="backend-switcher-selected">
          <span className="backend-switcher-dot" style={{ backgroundColor: selectedColor }} />
          <span className="backend-switcher-name">
            {BackendProviderDisplayNames[selectedProvider]}
          </span>
          <span className={`backend-switcher-status ${tokens[selectedProvider] ? 'configured' : 'unconfigured'}`}>
            {tokens[selectedProvider] ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
            )}
          </span>
        </div>
        <svg
          className={`backend-switcher-chevron ${isOpen ? 'open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="backend-switcher-dropdown">
          {providers.map((provider) => {
            const color = BackendProviderColors[provider];
            const isConfigured = !!tokens[provider];
            const isSelected = provider === selectedProvider;

            return (
              <button
                key={provider}
                onClick={() => {
                  setCurrentBackend(provider);
                  setIsOpen(false);
                }}
                className={`backend-switcher-option ${isSelected ? 'selected' : ''}`}
                style={{ '--backend-color': color } as React.CSSProperties}
              >
                <span className="backend-switcher-option-dot" style={{ backgroundColor: color }} />
                <span className="backend-switcher-option-name">
                  {BackendProviderDisplayNames[provider]}
                </span>
                {isConfigured ? (
                  <span className="backend-switcher-option-status configured">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : (
                  <span className="backend-switcher-option-status unconfigured">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                    </svg>
                  </span>
                )}
                {isSelected && (
                  <span className="backend-switcher-option-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
