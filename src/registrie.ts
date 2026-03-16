// Sentinel used to distinguish "no entry" from a stored `undefined` value.
const EMPTY = Symbol('EMPTY');

const DELIMITER = ' ';

class RegistrieNode<T> {
  public children: Record<string, RegistrieNode<T>> = {};
  // Symbol sentinel allows storing `undefined` as a valid value.
  public entry: T | typeof EMPTY = EMPTY;
}

// — Public types —

export type BasicRegistrie<T = unknown> = {
  /**
   * Registers an entry in the registry.
   *
   * @param key - The key to store the entry under.
   * @param value - The value to store.
   * @param frozen - If `true` (default), the value is frozen with `Object.freeze()`.
   */
  register: (key: string, value: T, frozen?: boolean) => void;
  /**
   * Returns the entry stored under the given key, or `undefined` if not found.
   *
   * @param key - Exact key to look up.
   */
  query: (key: string) => T | undefined;
  /**
   * Returns all keys that start with the given prefix, sorted alphabetically.
   *
   * @param key - Prefix to search for.
   */
  candidate: (key: string) => string[];
  /**
   * Removes an entry from the registry and prunes any now-empty nodes.
   *
   * @param key - The key of the entry to remove.
   */
  erase: (key: string) => void;
};

export type NestedRegistrie<T extends object> = {
  /**
   * Registers an entry. The key is extracted from the object using `entryKey`.
   * If `childrenEntryKey` is set, children are registered recursively.
   *
   * @param value - The object to register.
   * @param frozen - If `true` (default), the value is frozen with `Object.freeze()`.
   */
  register: (value: T, frozen?: boolean) => void;
  /**
   * Returns the entry at the given space-delimited path, or `undefined` if not found.
   * Example: `query('fruits apple')` looks up 'apple' nested under 'fruits'.
   *
   * @param key - Space-delimited path to look up.
   */
  query: (key: string) => T | undefined;
  /**
   * Returns immediate child keys at the current path depth, sorted alphabetically.
   * Returns just the segment name, not the full path.
   * Example: `candidate('fruits ')` returns `['apple', 'banana']`.
   *
   * @param key - Prefix path to search under.
   */
  candidate: (key: string) => string[];
  /**
   * Removes an entry and its entire subtree from the registry.
   *
   * @param key - Space-delimited path of the entry to remove.
   */
  erase: (key: string) => void;
};

// — Shared trie helpers —

function getNode<T>(root: RegistrieNode<T>, key: string): RegistrieNode<T> | undefined {
  let node: RegistrieNode<T> = root;
  for (const char of key) {
    const next = node.children[char];
    if (!next) return undefined;
    node = next;
  }
  return node;
}

function insertEntry<T>(root: RegistrieNode<T>, key: string, value: T, frozen: boolean): void {
  let node: RegistrieNode<T> = root;
  for (const char of key) {
    if (!node.children[char]) {
      node.children[char] = new RegistrieNode<T>();
    }
    node = node.children[char] as RegistrieNode<T>;
  }
  node.entry =
    frozen && typeof value === 'object' && value !== null
      ? Object.freeze(value)
      : value;
}

function pruneUp<T>(stack: Array<[RegistrieNode<T>, string]>): void {
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

function walkWithStack<T>(
  root: RegistrieNode<T>,
  key: string
): { node: RegistrieNode<T>; stack: Array<[RegistrieNode<T>, string]> } | undefined {
  let node: RegistrieNode<T> = root;
  const stack: Array<[RegistrieNode<T>, string]> = [];
  for (const char of key) {
    const next = node.children[char];
    if (!next) return undefined;
    stack.push([node, char]);
    node = next;
  }
  return { node, stack };
}

function collectAllKeys<T>(node: RegistrieNode<T>, prefix: string): string[] {
  const list: string[] = [];
  if (node.entry !== EMPTY) list.push(prefix);
  for (const char in node.children) {
    list.push(...collectAllKeys(node.children[char] as RegistrieNode<T>, prefix + char));
  }
  return list;
}

function collectChildSegments<T>(node: RegistrieNode<T>, fullPrefix: string): string[] {
  const list: string[] = [];

  for (const [char, childNode] of Object.entries(node.children)) {
    if (char === DELIMITER) {
      // Delimiter marks the end of a complete segment — extract and return it
      const lastDelim = fullPrefix.lastIndexOf(DELIMITER);
      const segment = lastDelim === -1 ? fullPrefix : fullPrefix.slice(lastDelim + 1);
      list.push(segment);
    } else {
      list.push(...collectChildSegments(childNode, fullPrefix + char));
    }
  }

  // Leaf node with an entry — return its segment
  if (Object.keys(node.children).length === 0 && node.entry !== EMPTY) {
    const lastDelim = fullPrefix.lastIndexOf(DELIMITER);
    const segment = lastDelim === -1 ? fullPrefix : fullPrefix.slice(lastDelim + 1);
    list.push(segment);
  }

  return list;
}

// — Factory implementations —

function createBasicRegistrie<T>(): BasicRegistrie<T> {
  const root = new RegistrieNode<T>();

  return {
    register(key: string, value: T, frozen = true): void {
      insertEntry(root, key, value, frozen);
    },

    query(key: string): T | undefined {
      const node = getNode(root, key);
      if (!node || node.entry === EMPTY) return undefined;
      return node.entry;
    },

    candidate(input: string): string[] {
      const node = getNode(root, input);
      return node ? collectAllKeys(node, input).sort() : [];
    },

    erase(key: string): void {
      if (!key) return;
      const result = walkWithStack(root, key);
      if (!result || result.node.entry === EMPTY) return;
      result.node.entry = EMPTY;
      pruneUp(result.stack);
    },
  };
}

function createNestedRegistrie<T extends object>(
  entryKey: keyof T,
  childrenEntryKey?: keyof T
): NestedRegistrie<T> {
  const root = new RegistrieNode<T>();

  function validate(value: T): void {
    if (typeof value !== 'object' || value === null) {
      throw new Error('The provided value must be an object if entryKey is set.');
    }
    if (!(entryKey in value)) {
      throw new Error(`The entryKey "${String(entryKey)}" is not present in the object.`);
    }
    if (childrenEntryKey && childrenEntryKey in value) {
      const children = value[childrenEntryKey];
      if (!Array.isArray(children)) {
        throw new Error(
          `The childrenEntryKey "${String(childrenEntryKey)}" must be an array.`
        );
      }
      for (const child of children as T[]) {
        validate(child);
      }
    }
  }

  function insertRecursive(value: T, frozen: boolean, prefix = ''): void {
    const key = `${prefix}${String(value[entryKey])}`;
    insertEntry(root, key, value, frozen);
    if (childrenEntryKey && value[childrenEntryKey]) {
      for (const child of value[childrenEntryKey] as T[]) {
        insertRecursive(child, frozen, `${key}${DELIMITER}`);
      }
    }
  }

  return {
    register(value: T, frozen = true): void {
      validate(value);
      insertRecursive(value, frozen);
    },

    query(key: string): T | undefined {
      const node = getNode(root, key);
      if (!node || node.entry === EMPTY) return undefined;
      return node.entry;
    },

    candidate(input: string): string[] {
      const node = getNode(root, input);
      return node ? collectChildSegments(node, input).sort() : [];
    },

    erase(key: string): void {
      if (!key) return;
      const result = walkWithStack(root, key);
      if (!result || result.node.entry === EMPTY) return;
      result.node.entry = EMPTY;
      result.node.children = {};
      pruneUp(result.stack);
    },
  };
}

// — Public factory —

export function Registrie<T = unknown>(
  entryKey?: undefined,
  childrenEntryKey?: undefined
): BasicRegistrie<T>;

export function Registrie<T extends object>(
  entryKey: keyof T,
  childrenEntryKey?: keyof T
): NestedRegistrie<T>;

/**
 * Creates a trie-based registry.
 *
 * - Without `entryKey`: returns a `BasicRegistrie<T>` — a key-value store backed by a trie.
 * - With `entryKey`: returns a `NestedRegistrie<T>` — a hierarchical registry where keys
 *   are extracted from the stored objects and children are registered recursively.
 *
 * @param entryKey - The property on `T` to use as the registry key.
 * @param childrenEntryKey - The property on `T` that holds an array of child entries.
 *
 * @example Basic usage
 * ```ts
 * const registry = Registrie<string>();
 * registry.register('apple', 'A fruit');
 * registry.query('apple'); // 'A fruit'
 * registry.candidate('ap'); // ['apple']
 * ```
 *
 * @example Nested usage
 * ```ts
 * const registry = Registrie<Category>('name', 'subCategories');
 * registry.register({ name: 'fruits', subCategories: [{ name: 'apple' }] });
 * registry.query('fruits apple'); // { name: 'apple' }
 * registry.candidate('fruits '); // ['apple']
 * ```
 */
export function Registrie<T>(entryKey?: keyof T, childrenEntryKey?: keyof T) {
  if (entryKey) {
    return createNestedRegistrie<T & object>(
      entryKey as keyof (T & object),
      childrenEntryKey as keyof (T & object) | undefined
    );
  }
  return createBasicRegistrie<T>();
}