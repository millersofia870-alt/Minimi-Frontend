/**
 * Secure Storage Utility
 * Encrypts and obfuscates data before saving to localStorage to protect
 * session details from plain-text inspection, script scraping, or unauthorized reading.
 */

const STORAGE_KEY_PREFIX = 'minimi_sec_';
const SECRET_SALT = 'minimi-agri-secure-salt-v1';

function xorCipher(text, secret) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
  }
  return result;
}

export function setSecureItem(key, value) {
  if (typeof window === 'undefined') return;
  try {
    const jsonString = JSON.stringify(value);
    const cipherText = xorCipher(jsonString, SECRET_SALT);
    const encoded = btoa(encodeURIComponent(cipherText));
    localStorage.setItem(STORAGE_KEY_PREFIX + key, encoded);
  } catch (err) {
    console.error('Failed to store secure item:', err);
  }
}

export function getSecureItem(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return null;
    const decoded = decodeURIComponent(atob(raw));
    const jsonString = xorCipher(decoded, SECRET_SALT);
    return JSON.parse(jsonString);
  } catch (err) {
    // If parsing or decoding fails, remove invalid item
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
    return null;
  }
}

export function removeSecureItem(key) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  } catch (err) {
    console.error('Failed to remove secure item:', err);
  }
}
