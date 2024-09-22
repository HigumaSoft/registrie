import { describe, it, expect, beforeEach } from 'vitest';
import { Registrie } from '../src/registrie';
import {
  mockDataWithChildren,
  mockDataAny,
  EntryObjectWithChildren
} from './mock-data';

describe('Suggestions test', () => {
  // Test for mockDataWithChildren
  describe('Test for Typed Registrie by object keys', () => {
    let registryWithChildren: ReturnType<
      typeof Registrie<EntryObjectWithChildren>
    >;

    beforeEach(() => {
      registryWithChildren = Registrie<EntryObjectWithChildren>(
        'usage',
        'subCommands'
      );
      mockDataWithChildren.forEach((entry) =>
        registryWithChildren.register(entry)
      );
    });

    it('should return all parent entries for empty query, sorted', () => {
      const result = registryWithChildren.candidate('');
      expect(result).toEqual(['color', 'color-mix', 'font']);
    });

    it('should return parent partial matches for "col", sorted', () => {
      const result = registryWithChildren.candidate('col');
      expect(result).toEqual(['color', 'color-mix']);
    });

    it('should return ["font"] for "font", sorted', () => {
      const result = registryWithChildren.candidate('font');
      expect(result).toEqual(['font']);
    });

    it('should return empty array for "miss"', () => {
      const result = registryWithChildren.candidate('miss');
      expect(result).toEqual([]);
    });

    it('should return children for "color ", sorted', () => {
      const result = registryWithChildren.candidate('color ');
      expect(result).toEqual(['green', 'red']);
    });

    it('should return children for "col gr", sorted', () => {
      const result = registryWithChildren.candidate('color gr');
      expect(result).toEqual(['green']);
    });

    it('should return empty for "col b"', () => {
      const result = registryWithChildren.candidate('color b');
      expect(result).toEqual([]);
    });

    it('should return children for "col green ", sorted', () => {
      const result = registryWithChildren.candidate('color green ');
      expect(result).toEqual(['dark', 'light']);
    });
  });

  // TODO decide what to do with spaces in keys
  describe('Test for non-typed Registrie', () => {
    let registryWithAny: ReturnType<typeof Registrie>;

    beforeEach(() => {
      registryWithAny = Registrie();
      Object.entries(mockDataAny).forEach(([key, value]) =>
        registryWithAny.register(key, value)
      );
    });

    it('should return all entries for empty query', () => {
      const result = registryWithAny.candidate('');
      const expectedEntries = [
        'object',
        'array',
        'number',
        'string',
        'boolean',
        'any',
        'undefined',
        'null',
        'function',
        'number string'
      ];

      expect(result.sort()).toEqual(expectedEntries.sort());
    });

    it('should return ["array", "any"] for "a"', () => {
      const result = registryWithAny.candidate('a');
      expect(result).toEqual(['any', 'array']);
    });

    it('should return ["function"] for "function"', () => {
      const result = registryWithAny.candidate('function');
      expect(result).toEqual(['function']);
    });

    it('should return ["object"] for "ob"', () => {
      const result = registryWithAny.candidate('ob');
      expect(result).toEqual(['object']);
    });

    it('should return ["number", "number string"] for "numb', () => {
      const result = registryWithAny.candidate('numb');
      expect(result).toEqual(['number', 'number string']);
    });

    it('should return [] for "miss"', () => {
      const result = registryWithAny.candidate('miss');
      expect(result).toEqual([]);
    });
  });
});
