import { beforeEach, describe, expect, it } from 'vitest';
import { BasicRegistrie, Registrie } from '../src/registrie';
import { mockDataAny } from './mock-data';

describe('Query method tests', () => {
  describe('Test for Registrie with any data type', () => {
    let registryWithAny: BasicRegistrie;

    beforeEach(() => {
      registryWithAny = Registrie();

      Object.entries(mockDataAny).forEach(([key, value]) =>
        registryWithAny.register(key, value)
      );
    });

    // New test for deletion of "number string"
    it('should delete "number string" and still return correct object for "number"', () => {
      // Delete the "number string" entry
      registryWithAny.erase('number string');

      // Query for "number string" should return undefined after deletion
      const deletedResult = registryWithAny.query('number string');
      expect(deletedResult).toBeUndefined();

      // Query for "number" should still return the correct value
      const numberResult = registryWithAny.query('number');
      expect(numberResult).toEqual(mockDataAny.number);
    });

    it('should delete object', () => {
      registryWithAny.erase('object');
      const result = registryWithAny.query('object');
      expect(result).toBeUndefined();
    });

    it('should not delete array', () => {
      registryWithAny.erase('arr');
      const result = registryWithAny.query('array');
      expect(result).toEqual(mockDataAny.array);
    });
  });
});
