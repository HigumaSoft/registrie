// Sentinel used to distinguish "no entry" from a stored `undefined` value.
const EMPTY = Symbol("EMPTY");

class RegistrieNode<T> {
  public children: Record<string, RegistrieNode<T>> = {};
  // Using a symbol sentinel so `undefined` can be stored as a valid value.
  public entry: T | typeof EMPTY = EMPTY;
}

export type BasicRegistrie<T = unknown> = {
  /**
   * Registers an entry in the registry.
   *
   * @param {string} key - The key to use for the entry.
   * @param {T} value - The entry to register.
   * @param {boolean} [frozen=true] - If `true` (default), registers the entry as frozen (immutable).
   */
  register: (key: string, value: T, frozen?: boolean) => void;
  /**
   * Queries the registry for an entry by its key.
   *
   * @param {string} key - The key to search for.
   * @returns {T | undefined} The stored value, or `undefined` if not found.
   */
  query: (key: string) => T | undefined;
  /**
   * Returns all keys that start with the given prefix, sorted alphabetically.
   *
   * @param {string} key - The prefix to search for.
   * @returns {string[]} Matching keys.
   */
  candidate: (key: string) => string[];
  /**
   * Removes an entry from the registry and prunes empty nodes.
   *
   * @param {string} key - The key of the entry to remove.
   */
  erase: (key: string) => void;
};

export type NestedRegistrie<T extends object> = {
  /**
   * Registers a nested entry. The key is extracted from the object using `entryKey`.
   * If `childrenEntryKey` is set, children are registered recursively.
   *
   * @param {T} value - The entry to register.
   * @param {boolean} [frozen=true] - If `true` (default), registers the entry as frozen (immutable).
   */
  register: (value: T, frozen?: boolean) => void;
  /**
   * Queries the registry using a space-delimited path.
   * Example: `query('fruits apple')` looks up 'apple' under 'fruits'.
   *
   * @param {string} key - The space-delimited path.
   * @returns {T | undefined} The stored entry, or `undefined` if not found.
   */
  query: (key: string) => T | undefined;
  /**
   * Returns immediate child keys at the current path depth, sorted alphabetically.
   *
   * @param {string} key - The prefix path to search under.
   * @returns {string[]} Matching child keys (just the segment, not the full path).
   */
  candidate: (key: string) => string[];
  /**
   * Removes an entry and its entire subtree from the registry.
   *
   * @param {string} key - The space-delimited path of the entry to remove.
   */
  erase: (key: string) => void;
};

export function Registrie<T = unknown>(
  entryKey?: undefined,
  childrenEntryKey?: undefined,
): BasicRegistrie<T>;

export function Registrie<T extends object>(
  entryKey: keyof T,
  childrenEntryKey?: keyof T,
): NestedRegistrie<T>;

/**
 * Factory that creates a trie-based registry.
 *
 * - Without `entryKey`: returns a `BasicRegistrie<T>` — a simple key-value store.
 * - With `entryKey`: returns a `NestedRegistrie<T>` — a hierarchical registry where
 *   keys are extracted from the stored objects.
 *
 * @param entryKey - The property on `T` to use as the registry key.
 * @param childrenEntryKey - The property on `T` that holds an array of child entries.
 */
export function Registrie<T>(entryKey?: keyof T, childrenEntryKey?: keyof T) {
  const DELIMITER = " ";
  const root: RegistrieNode<T> = new RegistrieNode<T>();

  // — Validation —

  function validateValueType(value: T): void {
    if (!entryKey) return;

    if (typeof value !== "object" || value === null) {
      throw new Error(
        "The provided value must be an object if entryKey is set.",
      );
    }

    if (!(entryKey in value)) {
      throw new Error(
        `The entryKey "${String(entryKey)}" is not present in the object.`,
      );
    }

    if (childrenEntryKey && childrenEntryKey in value) {
      const children = value[childrenEntryKey];
      if (!Array.isArray(children)) {
        throw new Error(
          `The childrenEntryKey "${String(childrenEntryKey)}" must be an array.`,
        );
      }
      for (const child of children as T[]) {
        validateValueType(child);
      }
    }
  }

  // — Core trie operations —

  function getNode(key: string): RegistrieNode<T> | undefined {
    let node: RegistrieNode<T> = root;
    for (const char of key) {
      const next = node.children[char];
      if (!next) return undefined;
      node = next;
    }
    return node;
  }

  function addEntry(key: string, value: T, frozen: boolean = true): void {
    let node: RegistrieNode<T> = root;
    for (const char of key) {
      if (!node.children[char]) {
        node.children[char] = new RegistrieNode<T>();
      }
      node = node.children[char] as RegistrieNode<T>;
    }
    node.entry =
      frozen && typeof value === "object" && value !== null
        ? Object.freeze(value)
        : value;
  }

  function removeEntry(key: string): void {
    if (!key) return;

    let node: RegistrieNode<T> = root;
    const stack: Array<[RegistrieNode<T>, string]> = [];

    for (const char of key) {
      const next = node.children[char];
      if (!next) return;
      stack.push([node, char]);
      node = next;
    }

    if (node.entry === EMPTY) return;
    node.entry = EMPTY;

    while (stack.length > 0) {
      const [parent, char] = stack.pop() as [RegistrieNode<T>, string];
      const child = parent.children[char] as RegistrieNode<T>;
      if (Object.keys(child.children).length === 0 && child.entry === EMPTY) {
        delete parent.children[char];
      } else {
        break;
      }
    }
  }

  function removeEntryT(key: string): void {
    if (!key) return;

    let node: RegistrieNode<T> = root;
    const stack: Array<[RegistrieNode<T>, string]> = [];

    for (const char of key) {
      const next = node.children[char];
      if (!next) return;
      stack.push([node, char]);
      node = next;
    }

    if (node.entry === EMPTY) return;

    // Clear entry and entire subtree
    node.entry = EMPTY;
    node.children = {};

    // Backtrack and prune now-empty parents
    while (stack.length > 0) {
      const [parent, char] = stack.pop() as [RegistrieNode<T>, string];
      const child = parent.children[char] as RegistrieNode<T>;
      if (Object.keys(child.children).length === 0 && child.entry === EMPTY) {
        delete parent.children[char];
      } else {
        break;
      }
    }
  }

  // — BasicRegistrie —

  function query(key: string): T | undefined {
    const node = getNode(key);
    if (!node || node.entry === EMPTY) return undefined;
    return node.entry;
  }

  function candidate(input: string): string[] {
    const node = getNode(input);
    return node ? collectKeys(node, input).sort() : [];
  }

  function collectKeys(node: RegistrieNode<T>, prefix: string): string[] {
    const list: string[] = [];
    if (node.entry !== EMPTY) list.push(prefix);
    for (const char in node.children) {
      list.push(
        ...collectKeys(node.children[char] as RegistrieNode<T>, prefix + char),
      );
    }
    return list;
  }

  // — NestedRegistrie —

  function addEntryT(value: T, frozen: boolean = true): void {
    validateValueType(value);
    addEntryRecursiveT(value, frozen);
  }

  function addEntryRecursiveT(value: T, frozen = true, prefix = ""): void {
    const key = `${prefix}${String(value[entryKey as keyof T])}`;
    addEntry(key, value, frozen);
    if (childrenEntryKey && value[childrenEntryKey]) {
      for (const child of value[childrenEntryKey] as T[]) {
        addEntryRecursiveT(child, frozen, `${key}${DELIMITER}`);
      }
    }
  }

  function candidateT(input: string): string[] {
    const node = getNode(input);
    if (!node) return [];
    return collectKeysT(node, input).sort();
  }

  function collectKeysT(node: RegistrieNode<T>, fullPrefix: string): string[] {
    const list: string[] = [];

    for (const [char, childNode] of Object.entries(node.children)) {
      if (char === DELIMITER) {
        // Hit a delimiter — the segment up to here is a complete child key.
        // Strip the input prefix so we return just the segment, not the full path.
        const lastDelim = fullPrefix.lastIndexOf(DELIMITER);
        const segment =
          lastDelim === -1 ? fullPrefix : fullPrefix.slice(lastDelim + 1);
        list.push(segment);
      } else {
        list.push(...collectKeysT(childNode, fullPrefix + char));
      }
    }

    // Leaf node — return just its segment
    if (Object.keys(node.children).length === 0 && node.entry !== EMPTY) {
      const lastDelim = fullPrefix.lastIndexOf(DELIMITER);
      const segment =
        lastDelim === -1 ? fullPrefix : fullPrefix.slice(lastDelim + 1);
      list.push(segment);
    }

    return list;
  }

  if (entryKey) {
    return {
      register: addEntryT,
      candidate: candidateT,
      erase: removeEntryT,
      query,
    };
  }

  return {
    register: addEntry,
    candidate,
    erase: removeEntry,
    query,
  } as BasicRegistrie<T>;
}
