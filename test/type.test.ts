import { describe, expect, test } from "vitest";

import {
  type BasicRegistrie,
  type NestedRegistrie,
  Registrie,
} from "../src/registrie.js";
import {
  type AnyType,
  type ArrayType,
  type BaseObject,
  type BooleanType,
  type EntryObject,
  type EntryObjectWithChildren,
  type EntryObjectWithInverseChildren,
  type FunctionType,
  mockAnyType,
  mockArrayType,
  mockBaseObject,
  mockBooleanType,
  mockEntryObject,
  mockEntryObjectWithChildren,
  mockEntryObjectWithInverseChildren,
  mockEntryObjectWithoutChildren,
  mockFunctionType,
  mockNullType,
  mockNumberType,
  mockUndefinedType,
  type NullType,
  type NumberType,
  type UndefinedType,
} from "./mock-data.js";

describe("BasicRegistrie — type compatibility", () => {
  test("accepts any object type", () => {
    const registry: BasicRegistrie<BaseObject> = Registrie<BaseObject>();
    expect(() => registry.register("object", mockBaseObject)).not.toThrow();
  });

  test("accepts array type", () => {
    const registry: BasicRegistrie<ArrayType> = Registrie<ArrayType>();
    expect(() => registry.register("array", mockArrayType)).not.toThrow();
  });

  test("accepts number type", () => {
    const registry: BasicRegistrie<NumberType> = Registrie<NumberType>();
    expect(() => registry.register("number", mockNumberType)).not.toThrow();
  });

  test("accepts boolean type", () => {
    const registry: BasicRegistrie<BooleanType> = Registrie<BooleanType>();
    expect(() => registry.register("boolean", mockBooleanType)).not.toThrow();
  });

  test("accepts any type", () => {
    const registry = Registrie<AnyType>();
    expect(() => registry.register("any", mockAnyType)).not.toThrow();
  });

  test("accepts undefined type", () => {
    const registry: BasicRegistrie<UndefinedType> = Registrie<UndefinedType>();
    expect(() =>
      registry.register("undefined", mockUndefinedType),
    ).not.toThrow();
  });

  test("accepts null type", () => {
    const registry: BasicRegistrie<NullType> = Registrie<NullType>();
    expect(() => registry.register("null", mockNullType)).not.toThrow();
  });

  test("accepts function type", () => {
    const registry: BasicRegistrie<FunctionType> = Registrie<FunctionType>();
    expect(() => registry.register("function", mockFunctionType)).not.toThrow();
  });
});

describe("NestedRegistrie — valid usage", () => {
  test("registers object when entryKey exists on type", () => {
    const registry: NestedRegistrie<EntryObject> =
      Registrie<EntryObject>("usage");
    expect(() => registry.register(mockEntryObject)).not.toThrow();
  });

  test("registers object with children", () => {
    const registry: NestedRegistrie<EntryObjectWithChildren> =
      Registrie<EntryObjectWithChildren>("usage", "subCommands");
    expect(() => registry.register(mockEntryObjectWithChildren)).not.toThrow();
  });

  test("registers object when childrenKey is declared but not present on value", () => {
    const registry: NestedRegistrie<EntryObjectWithChildren> =
      Registrie<EntryObjectWithChildren>("usage", "subCommands");
    expect(() =>
      registry.register(mockEntryObjectWithoutChildren),
    ).not.toThrow();
  });
});

describe("NestedRegistrie — runtime validation errors", () => {
  test("throws when entryKey is not present on the registered value", () => {
    // @ts-expect-error — 'block' is not a key of EntryObject, compile error expected
    const registry = Registrie<EntryObject>("block");
    // @ts-expect-error — register expects value only in NestedRegistrie
    expect(() => registry.register(mockEntryObject)).toThrow(
      'The entryKey "block" is not present in the object.',
    );
  });

  test("throws when childrenKey value is not an array", () => {
    const registry = Registrie<EntryObjectWithInverseChildren>(
      "usage",
      "subCommands",
    );
    expect(() => registry.register(mockEntryObjectWithInverseChildren)).toThrow(
      "The provided value must be an object if entryKey is set.",
    );
  });

  test("throws when registering a non-object value with entryKey set", () => {
    // @ts-expect-error — number is not an object, compile error expected
    const registry = Registrie<NumberType>("usage");
    // @ts-expect-error — register expects value only in NestedRegistrie
    expect(() => registry.register(mockNumberType)).toThrow(
      "The provided value must be an object if entryKey is set.",
    );
  });

  test("throws when registering an array value — usage key not found in array", () => {
    // @ts-expect-error — array is not a valid object for NestedRegistrie, compile error expected
    const registry = Registrie<ArrayType>("usage");
    // @ts-expect-error — register expects value only in NestedRegistrie
    expect(() => registry.register(mockArrayType)).toThrow(
      'The entryKey "usage" is not present in the object.',
    );
  });

  test("throws when registering null with entryKey set", () => {
    // @ts-expect-error — null is not a valid object, compile error expected
    const registry = Registrie<NullType>("usage");
    // @ts-expect-error — register expects value only in NestedRegistrie
    expect(() => registry.register(mockNullType)).toThrow(
      "The provided value must be an object if entryKey is set.",
    );
  });
});
