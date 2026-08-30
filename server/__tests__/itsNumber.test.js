// server/__tests__/itsNumber.test.js
const { isValidItsNumber } = require('../../shared/validators/itsNumber');

describe('isValidItsNumber', () => {
  test('accepts a real confirmed 8-digit ITS number', () => {
    expect(isValidItsNumber('50409739')).toBe(true);
  });

  test('rejects a 5-digit TRNO-shaped value (must not be confused with TRNO)', () => {
    expect(isValidItsNumber('28949')).toBe(false);
  });

  test('rejects non-numeric characters', () => {
    expect(isValidItsNumber('abc12345')).toBe(false);
  });

  test('rejects a number type instead of string', () => {
    expect(isValidItsNumber(50409739)).toBe(false);
  });

  test('rejects 9 digits (too long)', () => {
    expect(isValidItsNumber('123456789')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(isValidItsNumber('')).toBe(false);
  });
});