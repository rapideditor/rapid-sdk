import aesjs from 'aes-js';

// This default signing key is built into Rapid and iD and can be used to mask/unmask sensitive values.
const DEFAULT_128 = [250, 157, 60, 79, 142, 134, 229, 129, 138, 126, 210, 129, 29, 71, 160, 208];


/** Performs AES encryption on provided text using provided key
 * @remarks See https://github.com/ricmoo/aes-js
 * Possible keys lengths are: 128 bits (16 bytes), 192 bits (24 bytes) or 256 bits (32 bytes).
 * To generate a random key:  window.crypto.getRandomValues(new Uint8Array(16));
 * @param plainText
 * @param key default: `DEFAULT_128`
 * @returns cipherText
 */
export function utilAesEncrypt(plainText: string, key: number[]): string {
  key = key || DEFAULT_128;
  const aesCtr = new aesjs.ModeOfOperation.ctr(key);
  const cipherBytes = aesCtr.encrypt(aesjs.utils.utf8.toBytes(plainText));
  const cipherText = aesjs.utils.hex.fromBytes(cipherBytes);
  return cipherText;
}


/** Performs AES decryption on provided encrypted text using provided key
 * @remarks See https://github.com/ricmoo/aes-js
 * Possible keys lengths are: 128 bits (16 bytes), 192 bits (24 bytes) or 256 bits (32 bytes).
 * To generate a random key:  window.crypto.getRandomValues(new Uint8Array(16));
 * @param cipherText
 * @param key default: `DEFAULT_128`
 * @returns plainText
 */
export function utilAesDecrypt(cipherText: string, key: number[]): string {
  key = key || DEFAULT_128;
  const aesCtr = new aesjs.ModeOfOperation.ctr(key);
  const plainBytes = aesCtr.decrypt(aesjs.utils.hex.toBytes(cipherText));
  const plainText = aesjs.utils.utf8.fromBytes(plainBytes);
  return plainText;
}
