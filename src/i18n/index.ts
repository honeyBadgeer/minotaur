import i18next from 'i18next';

async function initI18n() {
  try {
    const [ruResponse, kzResponse] = await Promise.all([
      fetch('./locales/ru.json'),
      fetch('./locales/kz.json'),
    ]);

    const [ruTranslations, kzTranslations] = await Promise.all([
      ruResponse.json(),
      kzResponse.json(),
    ]);

    await i18next.init({
      lng: 'ru',
      fallbackLng: 'ru',
      debug: false,
      resources: {
        ru: { translation: ruTranslations },
        kz: { translation: kzTranslations },
      },
    });
  } catch (err) {
    console.error('translations error', err);
  }
}

function t(key: string): string {
  return i18next.t(key);
}

function getLang(): string {
  return i18next.language;
}

function setLang(lang: 'ru' | 'kz') {
  i18next.changeLanguage(lang);
}

export { initI18n, t, getLang, setLang };
