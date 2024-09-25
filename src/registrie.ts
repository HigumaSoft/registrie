class RegistrieNode<T> {
  public children: { [key: string]: RegistrieNode<T> } = {};
  public entry: T | undefined = undefined;
  public empty: boolean = true;
}

export type BasicRegistrie<T = any> = {
  /**
   * Registers an entry in the registry.
   *
   * @param {string} key - The key to use for the entry.
   * @param {T} value - The entry to register.
   * @param {boolean} [frozen=true] - If `true` (default), registers the entry as frozen(immutable)
   * @returns {void}
   */
  register: (key: string, value: T, frozen?: boolean) => void;
  /**
   * Queries the registry for an entry by its key.
   *
   * @param {string} key - The key to search for in the registry.
   * @returns {T | undefined} The entry associated with the key, or `undefined` if not found.
   */
  query: (key: string) => T | undefined;
  /**
   * Provides suggestions or candidates for a partial key input.
   *
   * @param {string} key - The partial key to use for suggestions.
   * @returns {Array<string>} An array of suggested keys
   */
  candidate: (key: string) => string[];
  /**
   * Erases an entry from the registry.
   *
   * @param {string} key - The key of the entry to remove.
   */
  erase: (key: string) => void;
};

export type NestedRegistrie<T extends object> = {
  /**
   * Registers an entry in the registry.
   *
   * @param {T} value - The entry to register.
   * @param {boolean} [frozen=true] - If `true` (default), registers the entry as frozen(immutable)
   * @returns {void}
   */
  register: (value: T, frozen?: boolean) => void;
  /**
   * Queries the registry for an entry by its key.
   *
   * @param {string} key - The key to search for in the registry.
   * @returns {T | undefined} The entry associated with the key, or `undefined` if not found.
   */
  query: (key: string) => T | undefined;
  /**
   * Provides suggestions or candidates for a partial key input.
   *
   * @param {string} key - The partial key to use for suggestions.
   * @returns {Array<T[keyof T]>} An array of suggested keys of entries or its children.
   */
  candidate: (key: string) => T[keyof T][];
  /**
   * Erases an entry and its children from the registry.
   *
   * @param {string} key - The key of the entry to remove.
   */
  erase: (key: string) => void;
};

export function Registrie<T = any>(
  entryKey?: undefined,
  childrenEntryKey?: undefined
): BasicRegistrie<T>;

// If entryKey is provided, T must be an object, and register takes only a value of T
export function Registrie<T extends object>(
  entryKey: keyof T,
  childrenEntryKey?: keyof T
): NestedRegistrie<T>;

/**
 * A trie-based registry class that allows storing and querying entries with optional hierarchical keys.
 *
 * If no `entryKey` is provided, the function behaves like a general-purpose key-value registry. If `entryKey` is provided,
 * the function expects an object for each entry and supports hierarchical structures through `childrenEntryKey`.
 * @name Registrie
 * @author [Higuma Soft](https://github.com/HigumaSoft)
 */
export function Registrie<T>(entryKey?: keyof T, childrenEntryKey?: keyof T) {
  const _entryKey: keyof T | undefined = entryKey;
  const _childrenEntryKey: keyof T | undefined = childrenEntryKey;
  const _delimiter = ' ';

  // Define the root node
  const root: RegistrieNode<T> = new RegistrieNode<T>();

  // Helper function to validate the object type and the presence of keys
  function validateValueType(value: T): void {
    if (!_entryKey) return; // If no entryKey, no validation needed
    console.log(value);

    if (typeof value !== 'object' || value === null) {
      throw new Error(
        'The provided value must be an object if entryKey is set.'
      );
    }

    if (!(_entryKey in value)) {
      throw new Error(
        `The entryKey "${String(_entryKey)}" is not present in the object.`
      );
    }

    if (_childrenEntryKey && _childrenEntryKey in value) {
      const children = value[_childrenEntryKey];
      if (!Array.isArray(children)) {
        throw new Error(
          `The childrenEntryKey "${String(_childrenEntryKey)}" must be an array.`
        );
      }

      for (const child of children) {
        validateValueType(child);
      }
    }
  }

  // Function to add nested entries when entryKey is provided
  // TODO decide should i store children in parent node, cause it duplicates data, mb it should collect it from children

  function addEntryT(value: T, frozen: boolean = true): void {
    validateValueType(value);
    addEntryRecursiveT(value, frozen);
  }
  function addEntryRecursiveT(value: T, frozen = true, prefix = ''): void {
    const entryKey = `${prefix}${String(value[_entryKey!])}`;
    // Add the main entry
    addEntry(entryKey, value, frozen);
    // Recursively add children
    if (_childrenEntryKey && value[_childrenEntryKey]) {
      console.log(value);
      for (const child of value[_childrenEntryKey] as T[]) {
        addEntryRecursiveT(child, frozen, `${entryKey}${_delimiter}`);
      }
    }
  }

  // Function to add entry when entryKey is not provided
  function addEntry(key: string, value: T, frozen: boolean = true): void {
    let node: RegistrieNode<T> = root;

    for (const char of key) {
      if (!node.children[char]) {
        node.children[char] = new RegistrieNode<T>();
      }
      node = node.children[char]!;
    }

    node.entry =
      frozen && typeof value === 'object' && value !== null
        ? Object.freeze(value)
        : value;
    node.empty = false;
  }

  function remove(key: string): void {
    if (!key) return;
    let node = root;
    const stack: Array<[RegistrieNode<T>, string]> = [];
    for (const char of key) {
      if (!node.children[char]) return;
      node = node.children[char]!;
      stack.push([node, char]);
    }

    if (!node.entry) return;
    node.entry = undefined;

    while (stack.length > 0) {
      const [parent, char] = stack.pop()!;
      const child = parent.children[char];
      if (child && Object.keys(child.children).length === 0 && !child.entry) {
        delete parent.children[char];
      } else {
        break; // matched with a non-leaf node
      }
    }
  }

  // TODO implement for nested entries
  function removeT(key: string): void {
    const node = queryNode(key);
    if (!node || !node.entry) return;
  }

  function queryNode(key: string): RegistrieNode<T> | undefined {
    let node: RegistrieNode<T> = root;
    for (const char of key) {
      if (!node.children[char]) {
        return undefined;
      }
      node = node.children[char]!;
    }
    return node;
  }
  /**
   * Queries the registry for an entry by its key.
   *
   * @param {string} key - The key to search for in the registry.
   * @returns {T | undefined} The entry associated with the key, or `undefined` if not found.
   */
  function query(key: string): T | undefined {
    const node = queryNode(key);
    return node ? node.entry : undefined;
  }

  function candidate(input: string): string[] {
    const node = queryNode(input);
    return node ? suggestions(node, input).sort() : [];
  }

  function candidateT(input: string): string[] {
    const lastDelimiterIndex = input.lastIndexOf(_delimiter);
    const node: RegistrieNode<T> | undefined = queryNode(input);
    const prefix =
      lastDelimiterIndex == -1 ? input : input.slice(lastDelimiterIndex + 1);
    return node ? suggestionsT(node, prefix).sort() : [];
  }

  function suggestions(node: RegistrieNode<T>, prefix: string): string[] {
    const list: string[] = [];
    // if node stores an entry, add it to the list
    if (!node.empty) list.push(prefix);
    // recursively add children
    for (const char in node.children) {
      list.push(...suggestions(node.children[char]!, prefix + char));
    }
    return list;
  }

  function suggestionsT(node: RegistrieNode<T>, prefix: string): string[] {
    const list: string[] = [];

    if (!node.children || Object.keys(node.children).length === 0) {
      list.push(prefix);
      return list;
    }

    for (const [char, childNode] of Object.entries(node.children)) {
      const nextPrefix = prefix + char;
      if (char === _delimiter) {
        list.push(prefix); // stop parsing at delimiter
      } else {
        list.push(...suggestionsT(childNode, nextPrefix)); // continue parsing
      }
    }
    return list;
  }

  if (_entryKey) {
    return /** @type {NestedRegistrie<T>} */ {
      register: addEntryT,
      candidate: candidateT,
      erase: removeT,
      query: query
    };
  } else
    return /** @type {BasicRegistrie<T>} */ {
      register: addEntry,
      candidate: candidate,
      erase: remove,
      query: query
    };
}
