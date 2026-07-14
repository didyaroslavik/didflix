import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useRandomGreeting() {
  const { t, i18n } = useTranslation();

  const [greeting, setGreeting] = useState(() => {
    const phrases = t('greetings', { returnObjects: true }) as string[];
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex] || '';
  });

  useEffect(() => {
    const handleLanguageChange = () => {
      const phrases = t('greetings', { returnObjects: true }) as string[];
      const randomIndex = Math.floor(Math.random() * phrases.length);
      setGreeting(phrases[randomIndex] || '');
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [t, i18n]);

  return greeting;
}