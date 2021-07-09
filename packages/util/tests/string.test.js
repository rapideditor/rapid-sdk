const util = require('..');


describe('utilEditDistance', () => {
  it('returns zero for same strings', () => {
    expect(util.utilEditDistance('foo', 'foo')).toEqual(0);
  });

  it('reports an insertion of 1', () => {
    expect(util.utilEditDistance('foo', 'fooa')).toEqual(1);
  });

  it('reports a replacement of 1', () => {
    expect(util.utilEditDistance('foob', 'fooa')).toEqual(1);
  });

  it('does not fail on empty input', () => {
    expect(util.utilEditDistance('', '')).toEqual(0);
  });
});


describe('utilHashcode', () => {
  it('handles empty string', () => {
    expect(util.utilHashcode('')).toEqual(0);
  });
  it('generates a hashcode', () => {
    expect(util.utilHashcode('some string')).toEqual(1395333309);
  });
});


describe('utilStringQs', () => {
  it('converts a url querystring into an Object of k=v pairs', () => {
    expect(util.utilStringQs('foo=bar')).toStrictEqual({foo: 'bar'});
    expect(util.utilStringQs('foo=bar&one=2')).toStrictEqual({foo: 'bar', one: '2' });
    expect(util.utilStringQs('')).toStrictEqual({});
  });

  it('trims leading # if present', () => {
    expect(util.utilStringQs('#foo=bar')).toStrictEqual({foo: 'bar'});
    expect(util.utilStringQs('#foo=bar&one=2')).toStrictEqual({foo: 'bar', one: '2' });
    expect(util.utilStringQs('#')).toStrictEqual({});
  });

  it('trims leading ? if present', () => {
    expect(util.utilStringQs('?foo=bar')).toStrictEqual({foo: 'bar'});
    expect(util.utilStringQs('?foo=bar&one=2')).toStrictEqual({foo: 'bar', one: '2' });
    expect(util.utilStringQs('?')).toStrictEqual({});
  });

  it('trims leading #? if present', () => {
    expect(util.utilStringQs('#?foo=bar')).toStrictEqual({foo: 'bar'});
    expect(util.utilStringQs('#?foo=bar&one=2')).toStrictEqual({foo: 'bar', one: '2' });
    expect(util.utilStringQs('#?')).toStrictEqual({});
  });
});


describe('utilQsString', () => {
  it('converts an Object of k=v pairs to a url querystring', () => {
    expect(util.utilQsString({ foo: 'bar' })).toEqual('foo=bar');
    expect(util.utilQsString({ foo: 'bar', one: 2 })).toEqual('foo=bar&one=2');
    expect(util.utilQsString({})).toEqual('');
  });
  it('without noencode param, encodes all characters', () => {
    expect(util.utilQsString({ map: '0/0/0' })).toEqual('map=0%2F0%2F0');
  });
  it('with noencode param, skips special characters', () => {
    expect(util.utilQsString({ map: '0/0/0' }, true)).toEqual('map=0/0/0');
  });
});


describe('utilUnicodeCharsCount', () => {
  it('counts empty string', () => {
    expect(util.utilUnicodeCharsCount('')).toEqual(0);
  });
  it('counts latin text', () => {
    expect(util.utilUnicodeCharsCount('Lorem')).toEqual(5);
  });
  it('counts diacritics', () => {
    expect(util.utilUnicodeCharsCount('Ĺo͂řȩm̅')).toEqual(7);
  });
  it('counts Korean text', () => {
    expect(util.utilUnicodeCharsCount('뎌쉐')).toEqual(2);
  });
  it('counts Hindi text with combining marks', () => {
    expect(util.utilUnicodeCharsCount('अनुच्छेद')).toEqual(8);
  });
  it('counts demonic multiple combining marks', () => {
    expect(util.utilUnicodeCharsCount('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞')).toEqual(74);
  });
  it('counts emoji', () => {
    // The `Array.from` polyfill may not account for emojis, so
    // be lenient here. Worst case scenario is that IE users might be
    // limited to somewhat fewer characters on tag and role input.
    expect(util.utilUnicodeCharsCount('😎')).toBeOneOf([1, 2]);
    expect(util.utilUnicodeCharsCount('🇨🇦')).toBeOneOf([2, 4]);
    expect(util.utilUnicodeCharsCount('🏳️‍🌈')).toBeOneOf([4, 6]);
    expect(util.utilUnicodeCharsCount('‍👩‍👩‍👧‍👧')).toBeOneOf([8, 12]);
    expect(util.utilUnicodeCharsCount('👩‍❤️‍💋‍👩')).toBeOneOf([8, 11]);
    expect(util.utilUnicodeCharsCount('😎😬😆😵😴😄🙂🤔')).toBeOneOf([8, 16]);

  });
});

describe('utilUnicodeCharsTruncated', () => {
  it('truncates empty string', () => {
    expect(util.utilUnicodeCharsTruncated('', 0)).toEqual('');
    expect(util.utilUnicodeCharsTruncated('', 255)).toEqual('');
  });
  it('truncates latin text', () => {
    expect(util.utilUnicodeCharsTruncated('Lorem', 0)).toEqual('');
    expect(util.utilUnicodeCharsTruncated('Lorem', 3)).toEqual('Lor');
    expect(util.utilUnicodeCharsTruncated('Lorem', 5)).toEqual('Lorem');
    expect(util.utilUnicodeCharsTruncated('Lorem', 255)).toEqual('Lorem');
  });
  it('truncates diacritics', () => {
    expect(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 0)).toEqual('');
    expect(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 3)).toEqual('Ĺo͂');
    expect(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 7)).toEqual('Ĺo͂řȩm̅');
    expect(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 255)).toEqual('Ĺo͂řȩm̅');
  });
  it('truncates Korean text', () => {
    expect(util.utilUnicodeCharsTruncated('뎌쉐', 0)).toEqual('');
    expect(util.utilUnicodeCharsTruncated('뎌쉐', 1)).toEqual('뎌');
    expect(util.utilUnicodeCharsTruncated('뎌쉐', 2)).toEqual('뎌쉐');
    expect(util.utilUnicodeCharsTruncated('뎌쉐', 255)).toEqual('뎌쉐');
  });
  it('truncates Hindi text with combining marks', () => {
    expect(util.utilUnicodeCharsTruncated('अनुच्छेद', 0)).toEqual('');
    expect(util.utilUnicodeCharsTruncated('अनुच्छेद', 3)).toEqual('अनु');
    expect(util.utilUnicodeCharsTruncated('अनुच्छेद', 8)).toEqual('अनुच्छेद');
    expect(util.utilUnicodeCharsTruncated('अनुच्छेद', 255)).toEqual('अनुच्छेद');
  });
  it('truncates demonic multiple combining marks', () => {
    expect(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', 0)).toEqual('');
    expect(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖', 59)).toEqual('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖');
    expect(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', 74)).toEqual('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞');
    expect(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', 255)).toEqual('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞');
  });
  it('truncates emoji', () => {
    expect(util.utilUnicodeCharsTruncated('😎', 0)).toEqual('');
    expect(util.utilUnicodeCharsTruncated('😎', 1)).toBeOneOf(['😎', '\ud83d']);
    expect(util.utilUnicodeCharsTruncated('🇨🇦', 1)).toBeOneOf(['🇨', '\ud83c']);
    expect(util.utilUnicodeCharsTruncated('🏳️‍🌈', 2)).toBeOneOf(['🏳️', '\ud83c\udff3']);
    expect(util.utilUnicodeCharsTruncated('‍👩‍👩‍👧‍👧', 4)).toBeOneOf(['‍👩‍👩', '‍👩‍']);
    expect(util.utilUnicodeCharsTruncated('👩‍❤️‍💋‍👩', 6)).toBeOneOf(['👩‍❤️‍💋', '👩‍❤️‍']);
    expect(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 0)).toEqual('');
    expect(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 4)).toBeOneOf(['😎😬😆😵', '😎😬']);
    expect(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 8)).toBeOneOf(['😎😬😆😵😴😄🙂🤔', '😎😬😆😵']);
    expect(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 16)).toEqual('😎😬😆😵😴😄🙂🤔');
    expect(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 255)).toEqual('😎😬😆😵😴😄🙂🤔');
  });
});


describe('utilSafeString', () => {
  it('replaces unsafe characters with _', () => {
    expect(util.utilSafeString('Hello World!')).toEqual('hello_world_');
  });
});

describe('utilUniqueString', () => {
  it('generates a reasonably unique identifier string', () => {
    expect(util.utilUniqueString('Hello World!')).toMatch(/^ideditor-hello_world_-\d+$/);
  });
});
