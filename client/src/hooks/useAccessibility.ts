import { useState, useCallback, useEffect } from 'react';

export interface AccessibilitySettings {
  largeFont: boolean;
  highContrast: boolean;
  screenReader: boolean;
}

const STORAGE_KEY = 'accessibility_settings';

const defaultSettings: AccessibilitySettings = {
  largeFont: false,
  highContrast: false,
  screenReader: false,
};

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const handleSettingsChange = useCallback((newSettings: AccessibilitySettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));

    document.documentElement.classList.toggle('accessibility-large-font', newSettings.largeFont);
    document.documentElement.classList.toggle('accessibility-high-contrast', newSettings.highContrast);
  }, []);

  const speakText = useCallback((text: string) => {
    if (!settings.screenReader || !text) {
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, [settings.screenReader]);

  const handleElementClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (!settings.screenReader) {
      return;
    }

    const target = event.target as HTMLElement;
    const textContent = target.textContent?.trim();
    if (textContent) {
      speakText(textContent);
    }
  }, [settings.screenReader, speakText]);

  useEffect(() => {
    if (settings.screenReader) {
      document.documentElement.classList.add('accessibility-screen-reader');
    } else {
      document.documentElement.classList.remove('accessibility-screen-reader');
    }
  }, [settings.screenReader]);

  return {
    settings,
    setSettings: handleSettingsChange,
    speakText,
    handleElementClick,
  };
};
