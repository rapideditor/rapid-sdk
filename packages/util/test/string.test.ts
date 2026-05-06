import { describe, expect, it } from 'bun:test';
import * as util from '../src/index.ts';


describe('utilEditDistance', () => {
  it('returns zero for same strings', () => {
    expect(util.utilEditDistance('foo', 'foo')).toBe(0);
  });

  it('reports an insertion of 1', () => {
    expect(util.utilEditDistance('foo', 'fooa')).toBe(1);
  });

  it('reports a replacement of 1', () => {
    expect(util.utilEditDistance('foob', 'fooa')).toBe(1);
  });

  it('does not fail on empty input', () => {
    expect(util.utilEditDistance('', '')).toBe(0);
  });

  it('works on empty inputs', () => {
    expect(util.utilEditDistance('', '')).toBe(0);
    expect(util.utilEditDistance('foo', '')).toBe(3);
    expect(util.utilEditDistance('', 'foo')).toBe(3);
  });
});

describe('utilHashcode', () => {
  it('handles empty string', () => {
    expect(util.utilHashcode('')).toBe(0);
  });
  it('generates a hashcode', () => {
    expect(util.utilHashcode('some string')).toBe(1395333309);
  });
});

describe('utilStringQs', () => {
  it('converts a url querystring into an Object of k=v pairs', () => {
    expect(util.utilStringQs('foo=bar')).toEqual({ foo: 'bar' });
    expect(util.utilStringQs('foo=')).toEqual({ foo: '' });
    expect(util.utilStringQs('foo=bar&one=2')).toEqual({ foo: 'bar', one: '2' });
    expect(util.utilStringQs('foo=&one=2')).toEqual({ foo: '', one: '2' });
    expect(util.utilStringQs('foo=bar&one=')).toEqual({ foo: 'bar', one: '' });
    expect(util.utilStringQs('')).toEqual({});
  });

  it('trims leading # if present', () => {
    expect(util.utilStringQs('#foo=bar')).toEqual({ foo: 'bar' });
    expect(util.utilStringQs('#foo=')).toEqual({ foo: '' });
    expect(util.utilStringQs('#foo=bar&one=2')).toEqual({ foo: 'bar', one: '2' });
    expect(util.utilStringQs('#foo=&one=2')).toEqual({ foo: '', one: '2' });
    expect(util.utilStringQs('#foo=bar&one=')).toEqual({ foo: 'bar', one: '' });
    expect(util.utilStringQs('#')).toEqual({});
  });

  it('trims leading ? if present', () => {
    expect(util.utilStringQs('?foo=bar')).toEqual({ foo: 'bar' });
    expect(util.utilStringQs('?foo=')).toEqual({ foo: '' });
    expect(util.utilStringQs('?foo=bar&one=2')).toEqual({ foo: 'bar', one: '2' });
    expect(util.utilStringQs('?foo=&one=2')).toEqual({ foo: '', one: '2' });
    expect(util.utilStringQs('?foo=bar&one=')).toEqual({ foo: 'bar', one: '' });
    expect(util.utilStringQs('?')).toEqual({});
  });

  it('trims leading #? if present', () => {
    expect(util.utilStringQs('#?foo=bar')).toEqual({ foo: 'bar' });
    expect(util.utilStringQs('#?foo=')).toEqual({ foo: '' });
    expect(util.utilStringQs('#?foo=bar&one=2')).toEqual({ foo: 'bar', one: '2' });
    expect(util.utilStringQs('#?foo=&one=2')).toEqual({ foo: '', one: '2' });
    expect(util.utilStringQs('#?foo=bar&one=')).toEqual({ foo: 'bar', one: '' });
    expect(util.utilStringQs('#?')).toEqual({});
  });
});

describe('utilQsString', () => {
  it('converts an Object of k=v pairs to a url querystring', () => {
    expect(util.utilQsString({ foo: 'bar' })).toBe('foo=bar');
    expect(util.utilQsString({ foo: 'bar', one: 2 })).toBe('foo=bar&one=2');
    expect(util.utilQsString({})).toBe('');
  });
  it('without noencode param, encodes all characters', () => {
    expect(util.utilQsString({ map: '0/0/0' })).toBe('map=0%2F0%2F0');
  });
  it('with noencode param, skips special characters', () => {
    expect(util.utilQsString({ map: '0/0/0' }, true)).toBe('map=0/0/0');
  });
  it('sorts "map" params in front of other params', () => {
    const q = {
      background: 'test',
      map: '1/1/1',
      map3d: '2/2/2',
      poweruser: 'true'
    };
    expect(util.utilQsString(q, true)).toBe('map=1/1/1&map3d=2/2/2&background=test&poweruser=true');
  });
});

describe('utilUnicodeCharsCount', () => {
  it('counts empty string', () => {
    expect(util.utilUnicodeCharsCount('')).toBe(0);
  });
  it('counts latin text', () => {
    expect(util.utilUnicodeCharsCount('Lorem')).toBe(5);
  });
  it('counts diacritics', () => {
    expect(util.utilUnicodeCharsCount('Ĺo͂řȩm̅')).toBe(7);
  });
  it('counts Korean text', () => {
    expect(util.utilUnicodeCharsCount('뎌쉐')).toBe(2);
  });
  it('counts Hindi text with combining marks', () => {
    expect(util.utilUnicodeCharsCount('अनुच्छेद')).toBe(8);
  });
  it('counts demonic multiple combining marks', () => {
    expect(util.utilUnicodeCharsCount('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞')).toBe(74);
  });
  it('counts emoji', () => {
    // The `Array.from` polyfill may not account for emojis, so
    // be lenient here. Worst case scenario is that IE users might be
    // limited to somewhat fewer characters on tag and role input.
    expect([1, 2]).toContain(util.utilUnicodeCharsCount('😎'));
    expect([2, 4]).toContain(util.utilUnicodeCharsCount('🇨🇦'));
    expect([4, 6]).toContain(util.utilUnicodeCharsCount('🏳️‍🌈'));
    expect([8, 12]).toContain(util.utilUnicodeCharsCount('‍👩‍👩‍👧‍👧'));
    expect([8, 11]).toContain(util.utilUnicodeCharsCount('👩‍❤️‍💋‍👩'));
    expect([8, 16]).toContain(util.utilUnicodeCharsCount('😎😬😆😵😴😄🙂🤔'));
  });
});

describe('utilUnicodeCharsTruncated', () => {
  it('truncates empty string', () => {
    expect(util.utilUnicodeCharsTruncated('', 0)).toBe('');
    expect(util.utilUnicodeCharsTruncated('', 255)).toBe('');
  });
  it('truncates latin text', () => {
    expect(util.utilUnicodeCharsTruncated('Lorem', 0)).toBe('');
    expect(util.utilUnicodeCharsTruncated('Lorem', 3)).toBe('Lor');
    expect(util.utilUnicodeCharsTruncated('Lorem', 5)).toBe('Lorem');
    expect(util.utilUnicodeCharsTruncated('Lorem', 255)).toBe('Lorem');
  });
  it('truncates diacritics', () => {
    expect(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 0)).toBe('');
    expect(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 3)).toBe('Ĺo͂');
    expect(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 7)).toBe('Ĺo͂řȩm̅');
    expect(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 255)).toBe('Ĺo͂řȩm̅');
  });
  it('truncates Korean text', () => {
    expect(util.utilUnicodeCharsTruncated('뎌쉐', 0)).toBe('');
    expect(util.utilUnicodeCharsTruncated('뎌쉐', 1)).toBe('뎌');
    expect(util.utilUnicodeCharsTruncated('뎌쉐', 2)).toBe('뎌쉐');
    expect(util.utilUnicodeCharsTruncated('뎌쉐', 255)).toBe('뎌쉐');
  });
  it('truncates Hindi text with combining marks', () => {
    expect(util.utilUnicodeCharsTruncated('अनुच्छेद', 0)).toBe('');
    expect(util.utilUnicodeCharsTruncated('अनुच्छेद', 3)).toBe('अनु');
    expect(util.utilUnicodeCharsTruncated('अनुच्छेद', 8)).toBe('अनुच्छेद');
    expect(util.utilUnicodeCharsTruncated('अनुच्छेद', 255)).toBe('अनुच्छेद');
  });
  it('truncates demonic multiple combining marks', () => {
    expect(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', 0)).toBe('');
    expect(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖', 59)).toBe('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖');
    expect(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', 74)).toBe('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞');
    expect(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', 255)).toBe('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞');
  });
  it('truncates emoji', () => {
    expect(util.utilUnicodeCharsTruncated('😎', 0)).toBe('');
    expect(['😎', '\ud83d']).toContain(util.utilUnicodeCharsTruncated('😎', 1));
    expect(['🇨', '\ud83c']).toContain(util.utilUnicodeCharsTruncated('🇨🇦', 1));
    expect(['🏳️', '\ud83c\udff3']).toContain(util.utilUnicodeCharsTruncated('🏳️‍🌈', 2));
    expect(['‍👩‍👩', '‍👩‍']).toContain(util.utilUnicodeCharsTruncated('‍👩‍👩‍👧‍👧', 4));
    expect(['👩‍❤️‍💋', '👩‍❤️‍']).toContain(util.utilUnicodeCharsTruncated('👩‍❤️‍💋‍👩', 6));
    expect(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 0)).toBe('');
    expect(['😎😬😆😵', '😎😬']).toContain(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 4));
    expect(['😎😬😆😵😴😄🙂🤔', '😎😬😆😵']).toContain(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 8));
    expect(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 16)).toBe('😎😬😆😵😴😄🙂🤔');
    expect(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 255)).toBe('😎😬😆😵😴😄🙂🤔');
  });
});

describe('utilSafeString', () => {
  it('replaces unsafe characters with _', () => {
    expect(util.utilSafeString('Hello World!')).toBe('hello_world_');
  });
});

describe('utilUniqueString', () => {
  it('generates a reasonably unique identifier string', () => {
    expect(util.utilUniqueString('Hello World!')).toMatch(/^rapideditor-hello_world_-\d+$/);
  });
});

describe('utilSortString', () => {
  function testCases(cmp) {
    it('sorts strings', () => {
      expect(cmp('a', 'b')).toBeLessThan(0);
      expect(cmp('b', 'a')).toBeGreaterThan(0);
      expect(cmp('a', 'a')).toBe(0);
    });

    it('sorts strings case insentitively', () => {
      expect(cmp('a', 'A')).toBe(0);
    });

    it('sorts strings not regarding diacritics insentitively', () => {
      expect(cmp('a', 'à')).toBe(0);
    });
  }

  testCases(util.utilSortString('en'));
  testCases(util.utilSortString());

  /* Ok to reassign `Intl` here - we are testing whether this works in legacy environments */
  const _Intl = Intl;
  (globalThis as any).Intl = undefined;
  testCases(util.utilSortString('en'));
  (globalThis as any).Intl = {};
  testCases(util.utilSortString('en'));
  (globalThis as any).Intl = _Intl;
});
