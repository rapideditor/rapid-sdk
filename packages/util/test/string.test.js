import { describe, it } from 'bun:test';
import { strict as assert } from 'bun:assert';
import * as util from '../src/index.ts';


assert.equalOneOf = function(val, choices) {
  if (!Array.isArray(choices)) {
    assert.fail(`${choices} is not an Array`);
    return;
  }

  for (const choice of choices) {
    if (Object.is(val, choice)) return;  // found one
  }
  assert.fail(`${val} is not one of ${choices}`);
};


describe('utilEditDistance', () => {
  it('returns zero for same strings', () => {
    assert.equal(util.utilEditDistance('foo', 'foo'), 0);
  });

  it('reports an insertion of 1', () => {
    assert.equal(util.utilEditDistance('foo', 'fooa'), 1);
  });

  it('reports a replacement of 1', () => {
    assert.equal(util.utilEditDistance('foob', 'fooa'), 1);
  });

  it('does not fail on empty input', () => {
    assert.equal(util.utilEditDistance('', ''), 0);
  });

  it('works on empty inputs', () => {
    assert.equal(util.utilEditDistance('', ''), 0);
    assert.equal(util.utilEditDistance('foo', ''), 3);
    assert.equal(util.utilEditDistance('', 'foo'), 3);
  });
});

describe('utilHashcode', () => {
  it('handles empty string', () => {
    assert.equal(util.utilHashcode(''), 0);
  });
  it('generates a hashcode', () => {
    assert.equal(util.utilHashcode('some string'), 1395333309);
  });
});

describe('utilStringQs', () => {
  it('converts a url querystring into an Object of k=v pairs', () => {
    assert.deepEqual(util.utilStringQs('foo=bar'), { foo: 'bar' });
    assert.deepEqual(util.utilStringQs('foo='), { foo: '' });
    assert.deepEqual(util.utilStringQs('foo=bar&one=2'), { foo: 'bar', one: '2' });
    assert.deepEqual(util.utilStringQs('foo=&one=2'), { foo: '', one: '2' });
    assert.deepEqual(util.utilStringQs('foo=bar&one='), { foo: 'bar', one: '' });
    assert.deepEqual(util.utilStringQs(''), {});
  });

  it('trims leading # if present', () => {
    assert.deepEqual(util.utilStringQs('#foo=bar'), { foo: 'bar' });
    assert.deepEqual(util.utilStringQs('#foo='), { foo: '' });
    assert.deepEqual(util.utilStringQs('#foo=bar&one=2'), { foo: 'bar', one: '2' });
    assert.deepEqual(util.utilStringQs('#foo=&one=2'), { foo: '', one: '2' });
    assert.deepEqual(util.utilStringQs('#foo=bar&one='), { foo: 'bar', one: '' });
    assert.deepEqual(util.utilStringQs('#'), {});
  });

  it('trims leading ? if present', () => {
    assert.deepEqual(util.utilStringQs('?foo=bar'), { foo: 'bar' });
    assert.deepEqual(util.utilStringQs('?foo='), { foo: '' });
    assert.deepEqual(util.utilStringQs('?foo=bar&one=2'), { foo: 'bar', one: '2' });
    assert.deepEqual(util.utilStringQs('?foo=&one=2'), { foo: '', one: '2' });
    assert.deepEqual(util.utilStringQs('?foo=bar&one='), { foo: 'bar', one: '' });
    assert.deepEqual(util.utilStringQs('?'), {});
  });

  it('trims leading #? if present', () => {
    assert.deepEqual(util.utilStringQs('#?foo=bar'), { foo: 'bar' });
    assert.deepEqual(util.utilStringQs('#?foo='), { foo: '' });
    assert.deepEqual(util.utilStringQs('#?foo=bar&one=2'), { foo: 'bar', one: '2' });
    assert.deepEqual(util.utilStringQs('#?foo=&one=2'), { foo: '', one: '2' });
    assert.deepEqual(util.utilStringQs('#?foo=bar&one='), { foo: 'bar', one: '' });
    assert.deepEqual(util.utilStringQs('#?'), {});
  });
});

describe('utilQsString', () => {
  it('converts an Object of k=v pairs to a url querystring', () => {
    assert.equal(util.utilQsString({ foo: 'bar' }), 'foo=bar');
    assert.equal(util.utilQsString({ foo: 'bar', one: 2 }), 'foo=bar&one=2');
    assert.equal(util.utilQsString({}), '');
  });
  it('without noencode param, encodes all characters', () => {
    assert.equal(util.utilQsString({ map: '0/0/0' }), 'map=0%2F0%2F0');
  });
  it('with noencode param, skips special characters', () => {
    assert.equal(util.utilQsString({ map: '0/0/0' }, true), 'map=0/0/0');
  });
  it('sorts "map" params in front of other params', () => {
    const q = {
      background: 'test',
      map: '1/1/1',
      map3d: '2/2/2',
      poweruser: 'true'
    };
    assert.equal(util.utilQsString(q, true), 'map=1/1/1&map3d=2/2/2&background=test&poweruser=true');
  });
});

describe('utilUnicodeCharsCount', () => {
  it('counts empty string', () => {
    assert.equal(util.utilUnicodeCharsCount(''), 0);
  });
  it('counts latin text', () => {
    assert.equal(util.utilUnicodeCharsCount('Lorem'), 5);
  });
  it('counts diacritics', () => {
    assert.equal(util.utilUnicodeCharsCount('Ĺo͂řȩm̅'), 7);
  });
  it('counts Korean text', () => {
    assert.equal(util.utilUnicodeCharsCount('뎌쉐'), 2);
  });
  it('counts Hindi text with combining marks', () => {
    assert.equal(util.utilUnicodeCharsCount('अनुच्छेद'), 8);
  });
  it('counts demonic multiple combining marks', () => {
    assert.equal(util.utilUnicodeCharsCount('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞'), 74);
  });
  it('counts emoji', () => {
    // The `Array.from` polyfill may not account for emojis, so
    // be lenient here. Worst case scenario is that IE users might be
    // limited to somewhat fewer characters on tag and role input.
    assert.equalOneOf(util.utilUnicodeCharsCount('😎'), [1, 2]);
    assert.equalOneOf(util.utilUnicodeCharsCount('🇨🇦'), [2, 4]);
    assert.equalOneOf(util.utilUnicodeCharsCount('🏳️‍🌈'), [4, 6]);
    assert.equalOneOf(util.utilUnicodeCharsCount('‍👩‍👩‍👧‍👧'), [8, 12]);
    assert.equalOneOf(util.utilUnicodeCharsCount('👩‍❤️‍💋‍👩'), [8, 11]);
    assert.equalOneOf(util.utilUnicodeCharsCount('😎😬😆😵😴😄🙂🤔'), [8, 16]);
  });
});

describe('utilUnicodeCharsTruncated', () => {
  it('truncates empty string', () => {
    assert.equal(util.utilUnicodeCharsTruncated('', 0), '');
    assert.equal(util.utilUnicodeCharsTruncated('', 255), '');
  });
  it('truncates latin text', () => {
    assert.equal(util.utilUnicodeCharsTruncated('Lorem', 0), '');
    assert.equal(util.utilUnicodeCharsTruncated('Lorem', 3), 'Lor');
    assert.equal(util.utilUnicodeCharsTruncated('Lorem', 5), 'Lorem');
    assert.equal(util.utilUnicodeCharsTruncated('Lorem', 255), 'Lorem');
  });
  it('truncates diacritics', () => {
    assert.equal(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 0), '');
    assert.equal(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 3), 'Ĺo͂');
    assert.equal(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 7), 'Ĺo͂řȩm̅');
    assert.equal(util.utilUnicodeCharsTruncated('Ĺo͂řȩm̅', 255), 'Ĺo͂řȩm̅');
  });
  it('truncates Korean text', () => {
    assert.equal(util.utilUnicodeCharsTruncated('뎌쉐', 0), '');
    assert.equal(util.utilUnicodeCharsTruncated('뎌쉐', 1), '뎌');
    assert.equal(util.utilUnicodeCharsTruncated('뎌쉐', 2), '뎌쉐');
    assert.equal(util.utilUnicodeCharsTruncated('뎌쉐', 255), '뎌쉐');
  });
  it('truncates Hindi text with combining marks', () => {
    assert.equal(util.utilUnicodeCharsTruncated('अनुच्छेद', 0), '');
    assert.equal(util.utilUnicodeCharsTruncated('अनुच्छेद', 3), 'अनु');
    assert.equal(util.utilUnicodeCharsTruncated('अनुच्छेद', 8), 'अनुच्छेद');
    assert.equal(util.utilUnicodeCharsTruncated('अनुच्छेद', 255), 'अनुच्छेद');
  });
  it('truncates demonic multiple combining marks', () => {
    assert.equal(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', 0), '');
    assert.equal(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖', 59), 'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖');
    assert.equal(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', 74), 'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞');
    assert.equal(util.utilUnicodeCharsTruncated('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', 255), 'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞');
  });
  it('truncates emoji', () => {
    assert.equal(util.utilUnicodeCharsTruncated('😎', 0), '');
    assert.equalOneOf(util.utilUnicodeCharsTruncated('😎', 1), ['😎', '\ud83d']);
    assert.equalOneOf(util.utilUnicodeCharsTruncated('🇨🇦', 1), ['🇨', '\ud83c']);
    assert.equalOneOf(util.utilUnicodeCharsTruncated('🏳️‍🌈', 2), ['🏳️', '\ud83c\udff3']);
    assert.equalOneOf(util.utilUnicodeCharsTruncated('‍👩‍👩‍👧‍👧', 4), ['‍👩‍👩', '‍👩‍']);
    assert.equalOneOf(util.utilUnicodeCharsTruncated('👩‍❤️‍💋‍👩', 6), ['👩‍❤️‍💋', '👩‍❤️‍']);
    assert.equal(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 0), '');
    assert.equalOneOf(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 4), ['😎😬😆😵', '😎😬']);
    assert.equalOneOf(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 8), ['😎😬😆😵😴😄🙂🤔', '😎😬😆😵']);
    assert.equal(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 16), '😎😬😆😵😴😄🙂🤔');
    assert.equal(util.utilUnicodeCharsTruncated('😎😬😆😵😴😄🙂🤔', 255), '😎😬😆😵😴😄🙂🤔');
  });
});

describe('utilSafeString', () => {
  it('replaces unsafe characters with _', () => {
    assert.equal(util.utilSafeString('Hello World!'), 'hello_world_');
  });
});

describe('utilUniqueString', () => {
  it('generates a reasonably unique identifier string', () => {
    assert.match(util.utilUniqueString('Hello World!'), /^rapideditor-hello_world_-\d+$/);
  });
});

describe('utilSortString', () => {
  function testCases(cmp) {
    it('sorts strings', () => {
      assert.ok(cmp('a', 'b') < 0);
      assert.ok(cmp('b', 'a') > 0);
      assert.equal(cmp('a', 'a'), 0);
    });

    it('sorts strings case insentitively', () => {
      assert.equal(cmp('a', 'A'), 0);
    });

    it('sorts strings not regarding diacritics insentitively', () => {
      assert.equal(cmp('a', 'à'), 0);
    });
  }

  testCases(util.utilSortString('en'));
  testCases(util.utilSortString());

  /* Ok to reassign `Intl` here - we are testing whether this works in legacy environments */
  /* eslint-disable no-global-assign */
  const _Intl = Intl;
  Intl = undefined;
  testCases(util.utilSortString('en'));
  Intl = {};
  testCases(util.utilSortString('en'));
  Intl = _Intl;
  /* eslint-enable no-global-assign */
});
