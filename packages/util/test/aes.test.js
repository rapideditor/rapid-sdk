import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import * as test from '../built/util.mjs';


describe('utilAes', () => {
  it('encrypting and decrypting nothing yields nothing', () => {
    assert.equal(test.utilAesEncrypt(''), '');
    assert.equal(test.utilAesDecrypt(''), '');
  });

  it('encrypts and decrypts with default key', () => {
    const text = 'Hello Rapid!';
    const encrypted = '5597506f958c53716d3dbd79';
    assert.equal(test.utilAesEncrypt(text), encrypted);
    assert.equal(test.utilAesDecrypt(encrypted), text);
  });

  it('encrypts and decrypts with a custom 16-bit key', () => {
    const key = [
      216, 159, 213, 140, 129,  75,  80, 121,
       67, 201, 179, 120,  71, 237, 185,  42
    ];
    const text = 'Hello Rapid!';
    const encrypted = '9ff50e32b04fbd415b8dbcd0';
    assert.equal(test.utilAesEncrypt(text, key), encrypted);
    assert.equal(test.utilAesDecrypt(encrypted, key), text);
  });

  it('encrypts and decrypts with a custom 24-bit key', () => {
    const key = [
      180, 138, 124,  87, 157, 23, 209, 147,
       64,  65,  68, 206, 212, 79, 215, 114,
       37,  18, 159,  94, 168, 68, 177, 202
    ];
    const text = 'Hello Rapid!';
    const encrypted = '85fc05011fa7bfa1464db2ea';
    assert.equal(test.utilAesEncrypt(text, key), encrypted);
    assert.equal(test.utilAesDecrypt(encrypted, key), text);
  });

  it('encrypts and decrypts with a custom 32-bit key', () => {
    const key = [
        4,  48, 130, 253, 213, 139, 96,  178,
      170, 108, 127, 233, 167, 137, 181,  41,
      145,  62, 251,   9,  82, 159, 103, 198,
       63, 200, 158, 104, 188,  77, 193,  16
    ];
    const text = 'Hello Rapid!';
    const encrypted = '13c21d3dc2515ee02d93b537';
    assert.equal(test.utilAesEncrypt(text, key), encrypted);
    assert.equal(test.utilAesDecrypt(encrypted, key), text);
  });
});
