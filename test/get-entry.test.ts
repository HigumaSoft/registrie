import { describe, it, expect, beforeEach } from 'vitest'; // or 'jest'
import { BasicRegistrie, NestedRegistrie, Registrie } from '../src/registrie'; // Adjust the import to your file structure
import {
  mockDataWithChildren,
  mockDataAny,
  EntryObjectWithChildren
} from './mock-data'; // Adjust import as necessary

describe('Query method tests', () => {
  // Test for mockDataWithChildren
  describe('Test for Typed Registrie by object keys', () => {
    let registryWithChildren: NestedRegistrie<EntryObjectWithChildren>;

    beforeEach(() => {
      registryWithChildren = Registrie<EntryObjectWithChildren>(
        'usage',
        'subCommands'
      );
      mockDataWithChildren.forEach((entry) =>
        registryWithChildren.register(entry)
      );
    });

    it('should return correct object for "color"', () => {
      const result = registryWithChildren.query('color');
      expect(result).toEqual({
        name: 'Css color',
        usage: 'color',
        subCommands: [
          { name: 'Color Red', usage: 'red', subCommands: [] },
          {
            name: 'Color Green',
            usage: 'green',
            subCommands: [
              { name: 'Color Green Dark', usage: 'dark', subCommands: [] },
              { name: 'Color Green Light', usage: 'light', subCommands: [] }
            ]
          }
        ]
      });
    });

    it('should return correct object for composed key "color green"', () => {
      const result = registryWithChildren.query('color green');
      expect(result).toEqual({
        name: 'Color Green',
        usage: 'green',
        subCommands: [
          { name: 'Color Green Dark', usage: 'dark', subCommands: [] },
          { name: 'Color Green Light', usage: 'light', subCommands: [] }
        ]
      });
    });

    it('should return correct object for "font arial"', () => {
      const result = registryWithChildren.query('font arial');
      expect(result).toEqual({
        name: 'Font Arial',
        usage: 'arial',
        subCommands: []
      });
    });

    it('should return undefined for a non-existent key', () => {
      const result = registryWithChildren.query('color blue');
      expect(result).toBeUndefined();
    });
  });

  // Test for mockDataAny
  describe('Test for Registrie with any data type', () => {
    let registryWithAny: BasicRegistrie;

    beforeEach(() => {
      registryWithAny = Registrie();
      Object.entries(mockDataAny).forEach(([key, value]) =>
        registryWithAny.register(key, value)
      );
    });

    it('should return correct object for "object"', () => {
      const result = registryWithAny.query('object');
      expect(result).toEqual(mockDataAny.object);
    });

    it('should return correct object for "number"', () => {
      const result = registryWithAny.query('number');
      expect(result).toEqual(mockDataAny.number);
    });

    it('should return correct object for composed key "number string"', () => {
      const result = registryWithAny.query('number string');
      expect(result).toEqual(mockDataAny['number string']);
    });

    it('should return undefined for a non-existent key', () => {
      const result = registryWithAny.query('unknown key');
      expect(result).toBeUndefined();
    });
  });
});
