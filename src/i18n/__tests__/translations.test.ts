import en from '../locales/en.json';
import te from '../locales/te.json';

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
    const teKeys = getKeys(te).sort();

    test('English and Telugu translation files should have the same keys', () => {
        const missingInTe = enKeys.filter(key => !teKeys.includes(key));
        const extraInTe = teKeys.filter(key => !enKeys.includes(key));

        if (missingInTe.length > 0 || extraInTe.length > 0) {
            const message = [
                missingInTe.length > 0 ? `Missing keys in te.json:\n${missingInTe.join('\n')}` : '',
                extraInTe.length > 0 ? `Extra keys in te.json (missing in en.json):\n${extraInTe.join('\n')}` : ''
            ].filter(Boolean).join('\n\n');

            throw new Error(message);
        }

        expect(teKeys).toEqual(enKeys);
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

        checkValues(en, 'en.json');
        checkValues(te, 'te.json');
    });
});
