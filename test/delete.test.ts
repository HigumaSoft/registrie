import { beforeEach, describe, expect, it } from "vitest";

import {
  type BasicRegistrie,
  type NestedRegistrie,
  Registrie,
} from "../src/registrie.js";
import {
  type EntryObjectWithChildren,
  mockDataAny,
  mockDataWithChildren,
} from "./mock-data.js";

describe("BasicRegistrie — erase", () => {
  let registry: BasicRegistrie;

  beforeEach(() => {
    registry = Registrie();
    Object.entries(mockDataAny).forEach(([key, value]) =>
      registry.register(key, value),
    );
  });

  it("removes an entry", () => {
    registry.erase("object");
    expect(registry.query("object")).toBeUndefined();
  });

  it("does not affect sibling keys with shared prefix", () => {
    registry.erase("number string");
    expect(registry.query("number string")).toBeUndefined();
    expect(registry.query("number")).toEqual(mockDataAny.number);
  });

  it("does not throw on non-existent key", () => {
    expect(() => registry.erase("does-not-exist")).not.toThrow();
  });

  it("does not throw on empty key", () => {
    expect(() => registry.erase("")).not.toThrow();
  });

  it("removed key no longer appears in candidate results", () => {
    registry.erase("object");
    expect(registry.candidate("ob")).toEqual([]);
  });

  it("does not remove a key that only partially matches", () => {
    registry.erase("arr");
    expect(registry.query("array")).toEqual(mockDataAny.array);
  });
});

describe("NestedRegistrie — erase", () => {
  let registry: NestedRegistrie<EntryObjectWithChildren>;

  beforeEach(() => {
    registry = Registrie<EntryObjectWithChildren>("usage", "subCommands");
    mockDataWithChildren.forEach((entry) => registry.register(entry));
  });

  it("removes a top-level entry", () => {
    registry.erase("font");
    expect(registry.query("font")).toBeUndefined();
  });

  it("removing a top-level entry also removes its subtree", () => {
    registry.erase("color");
    expect(registry.query("color")).toBeUndefined();
    expect(registry.query("color red")).toBeUndefined();
    expect(registry.query("color green")).toBeUndefined();
    expect(registry.query("color green dark")).toBeUndefined();
  });

  it("removes a nested entry without affecting the parent", () => {
    registry.erase("color green");
    expect(registry.query("color green")).toBeUndefined();
    expect(registry.query("color")).toBeDefined();
  });

  it("removed entry no longer appears in candidate results", () => {
    registry.erase("color");
    expect(registry.candidate("")).toEqual(["color-mix", "font"]);
  });

  it("does not throw on non-existent key", () => {
    expect(() => registry.erase("does-not-exist")).not.toThrow();
  });

  it("does not throw on empty key", () => {
    expect(() => registry.erase("")).not.toThrow();
  });
});
