import en from '../locales/en.json';
import te from '../locales/te.json';
import hi from '../locales/hi.json';
import ta from '../locales/ta.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';

const translations: { [key: string]: any } = { en, te, hi, ta, kn, ml };

describe('Translation Synchronization', () => {
    const getKeys = (obj: any, prefix = ''): string[] => {
        return Object.keys(obj).reduce((res: string[], el) => {
            if (Array.isArray(obj[el])) {
                return [...res, prefix + el];
            } else if (typeof obj[el] === 'object' && obj[el] !== null) {
                return [...res, ...getKeys(obj[el], prefix + el + '.')];
            }
            return [...res, prefix + el];
        }, []);
    };

    const enKeys = getKeys(en).sort();

    Object.keys(translations).forEach(lang => {
        if (lang === 'en') return;

        test(`English and ${lang} translation files should have the same keys`, () => {
            const langKeys = getKeys(translations[lang]).sort();
            const missingInLang = enKeys.filter(key => !langKeys.includes(key));
            const extraInLang = langKeys.filter(key => !enKeys.includes(key));

            if (missingInLang.length > 0 || extraInLang.length > 0) {
                const message = [
                    missingInLang.length > 0 ? `Missing keys in ${lang}.json:\n${missingInLang.join('\n')}` : '',
                    extraInLang.length > 0 ? `Extra keys in ${lang}.json (missing in en.json):\n${extraInLang.join('\n')}` : ''
                ].filter(Boolean).join('\n\n');

                throw new Error(message);
            }

            expect(langKeys).toEqual(enKeys);
        });
    });

    test('All translation keys should have a non-empty value', () => {
        const checkValues = (obj: any, fileName: string) => {
            const keys = getKeys(obj);
            keys.forEach(key => {
                const value = key.split('.').reduce((o, i) => o[i], obj);
                if (typeof value === 'string' && value.trim() === '') {
                    throw new Error(`Empty translation value found in ${fileName} for key: ${key}`);
                }
            });
        };

        Object.keys(translations).forEach(lang => {
            checkValues(translations[lang], `${lang}.json`);
        });
    });
});
