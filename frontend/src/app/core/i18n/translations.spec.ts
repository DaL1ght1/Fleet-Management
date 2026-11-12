import en from '../../../assets/i18n/en.json';
import fr from '../../../assets/i18n/fr.json';
import ar from '../../../assets/i18n/ar.json';
import es from '../../../assets/i18n/es.json';
import { LANGUAGES } from './language.service';

interface TranslationTree {
  [key: string]: string | TranslationTree;
}

const flatten = (tree: TranslationTree, prefix = ''): string[] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string' ? [`${prefix}${key}`] : flatten(value, `${prefix}${key}.`),
  );

const placeholders = (text: string): string[] => (text.match(/{{\s*\w+\s*}}/g) ?? []).sort();

const valueAt = (tree: TranslationTree, path: string): string =>
  path.split('.').reduce<string | TranslationTree>((node, key) => (node as TranslationTree)[key], tree) as string;

describe('translations', () => {
  const reference = flatten(en).sort();
  const locales: Record<string, TranslationTree> = { fr, ar, es };

  it('ships a translation file for every selectable language', () => {
    expect(LANGUAGES.map(language => language.code).sort()).toEqual(['ar', 'en', 'es', 'fr']);
  });

  for (const [code, tree] of Object.entries(locales)) {
    it(`${code} defines exactly the same keys as en`, () => {
      expect(flatten(tree).sort()).toEqual(reference);
    });

    it(`${code} keeps every interpolation placeholder`, () => {
      for (const key of reference) {
        expect(placeholders(valueAt(tree, key)))
          .withContext(key)
          .toEqual(placeholders(valueAt(en, key)));
      }
    });
  }
});
