import enMessages from '../../messages/en.json';
import ptMessages from '../../messages/pt.json';

describe('Translation files', () => {
  it('should have matching top-level keys', () => {
    const enKeys = Object.keys(enMessages).sort();
    const ptKeys = Object.keys(ptMessages).sort();

    expect(enKeys).toEqual(ptKeys);
  });

  it('should have matching nested keys for common namespace', () => {
    const enKeys = Object.keys(enMessages.common).sort();
    const ptKeys = Object.keys(ptMessages.common).sort();

    expect(enKeys).toEqual(ptKeys);
  });

  it('should have matching nested keys for nav namespace', () => {
    const enKeys = Object.keys(enMessages.nav).sort();
    const ptKeys = Object.keys(ptMessages.nav).sort();

    expect(enKeys).toEqual(ptKeys);
  });

  it('should have matching nested keys for auth namespace', () => {
    const enKeys = Object.keys(enMessages.auth).sort();
    const ptKeys = Object.keys(ptMessages.auth).sort();

    expect(enKeys).toEqual(ptKeys);
  });

  it('should have matching nested keys for dashboard namespace', () => {
    const enKeys = Object.keys(enMessages.dashboard).sort();
    const ptKeys = Object.keys(ptMessages.dashboard).sort();

    expect(enKeys).toEqual(ptKeys);
  });

  it('should have matching nested keys for posts namespace', () => {
    const enKeys = Object.keys(enMessages.posts).sort();
    const ptKeys = Object.keys(ptMessages.posts).sort();

    expect(enKeys).toEqual(ptKeys);
  });

  it('should have matching nested keys for socialAccounts namespace', () => {
    const enKeys = Object.keys(enMessages.socialAccounts).sort();
    const ptKeys = Object.keys(ptMessages.socialAccounts).sort();

    expect(enKeys).toEqual(ptKeys);
  });

  it('should have matching nested keys for languageSwitcher namespace', () => {
    const enKeys = Object.keys(enMessages.languageSwitcher).sort();
    const ptKeys = Object.keys(ptMessages.languageSwitcher).sort();

    expect(enKeys).toEqual(ptKeys);
  });

  it('should not have empty translation values in English', () => {
    const checkEmpty = (obj: Record<string, unknown>, path = ''): string[] => {
      const emptyKeys: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof value === 'string' && value.trim() === '') {
          emptyKeys.push(fullPath);
        } else if (typeof value === 'object' && value !== null) {
          emptyKeys.push(...checkEmpty(value as Record<string, unknown>, fullPath));
        }
      }
      return emptyKeys;
    };

    const emptyKeys = checkEmpty(enMessages);
    expect(emptyKeys).toEqual([]);
  });

  it('should not have empty translation values in Portuguese', () => {
    const checkEmpty = (obj: Record<string, unknown>, path = ''): string[] => {
      const emptyKeys: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof value === 'string' && value.trim() === '') {
          emptyKeys.push(fullPath);
        } else if (typeof value === 'object' && value !== null) {
          emptyKeys.push(...checkEmpty(value as Record<string, unknown>, fullPath));
        }
      }
      return emptyKeys;
    };

    const emptyKeys = checkEmpty(ptMessages);
    expect(emptyKeys).toEqual([]);
  });
});
