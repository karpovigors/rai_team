import { useState, useCallback, useEffect } from 'react';
import './AccessibilityPanel.css';

export interface AccessibilitySettings {
  largeFont: boolean;
  highContrast: boolean;
  screenReader: boolean;
}

interface AccessibilityPanelProps {
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
}

const STORAGE_KEY = 'accessibility_settings';

const defaultSettings: AccessibilitySettings = {
  largeFont: false,
  highContrast: false,
  screenReader: false,
};

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleToggleSetting = useCallback((key: keyof AccessibilitySettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  }, [settings, onSettingsChange]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AccessibilitySettings;
        onSettingsChange({ ...defaultSettings, ...parsed });
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    document.documentElement.classList.toggle('accessibility-large-font', settings.largeFont);
    document.documentElement.classList.toggle('accessibility-high-contrast', settings.highContrast);
  }, [settings]);

  return (
    <div className="accessibility-panel">
      <button
        type="button"
        className="accessibility-toggle"
        onClick={() => setIsPanelOpen((prev) => !prev)}
        aria-label="Настройки доступности"
        aria-expanded={isPanelOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
          <path d="M8 15c1.5 1 2.5 1 4 0s2.5-1 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {isPanelOpen && (
        <div className="accessibility-menu">
          <h3 className="accessibility-menu-title">Доступность</h3>

          <button
            type="button"
            className={`accessibility-option ${settings.largeFont ? 'active' : ''}`}
            onClick={() => handleToggleSetting('largeFont')}
            aria-pressed={settings.largeFont}
          >
            <span className="accessibility-option-icon">A+</span>
            <span className="accessibility-option-label">Крупный шрифт</span>
          </button>

          <button
            type="button"
            className={`accessibility-option ${settings.highContrast ? 'active' : ''}`}
            onClick={() => handleToggleSetting('highContrast')}
            aria-pressed={settings.highContrast}
          >
            <span className="accessibility-option-icon">◐</span>
            <span className="accessibility-option-label">Высокий контраст</span>
          </button>

          <button
            type="button"
            className={`accessibility-option ${settings.screenReader ? 'active' : ''}`}
            onClick={() => handleToggleSetting('screenReader')}
            aria-pressed={settings.screenReader}
          >
            <span className="accessibility-option-icon">🔊</span>
            <span className="accessibility-option-label">Озвучка</span>
          </button>

          {settings.screenReader && (
            <div className="accessibility-hint">
              <small>Нажмите на элемент, чтобы услышать его содержимое</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
