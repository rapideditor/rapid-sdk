const util = require('..');

describe('utilObjectOmit', () => {
  it('omits keys', () => {
    const t = { a: 1, b: 2 };
    expect(util.utilObjectOmit(t, [])).toStrictEqual({ a: 1, b: 2 });
    expect(util.utilObjectOmit(t, ['a'])).toStrictEqual({ b: 2 });
    expect(util.utilObjectOmit(t, ['a', 'b'])).toStrictEqual({});
  });
});

