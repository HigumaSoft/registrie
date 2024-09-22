class RegistrieNode<T> {
  public children: { [key: string]: RegistrieNode<T> } = {};
  public entry: T | undefined = undefined;
  public empty: boolean = true;
}

// If no entryKey is provided, T can be any type (including primitives)
export function Registrie<T>(
  entryKey?: undefined,
  childrenEntryKey?: undefined
): {
  register: (key: string, value: T) => void;
  query: (key: string) => T | undefined;
  candidate: (key: string) => string[];
};

// If entryKey is provided, T must be an object, and register takes only a value of T
export function Registrie<T extends object>(
  entryKey: keyof T,
  childrenEntryKey?: keyof T
): {
  register: (value: T) => void;
  query: (key: string) => T | undefined;
  candidate: (key: string) => T[typeof entryKey][];
};

// Implementation of the function, handling both cases
export function Registrie<T>(entryKey?: keyof T, childrenEntryKey?: keyof T) {
  const _entryKey: keyof T | undefined = entryKey;
  const _childrenEntryKey: keyof T | undefined = childrenEntryKey;
  const _delimiter = ' ';

  // Define the root node
  const root: RegistrieNode<T> = new RegistrieNode<T>();

  // Helper function to validate the object type and the presence of keys
  function validateValueType(value: T): void {
    if (!_entryKey) return; // If no entryKey, no validation needed

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

    if (_childrenEntryKey) {
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
  function addEntryT(value: T, prefix = ''): void {
    validateValueType(value);
    const entryKey = `${prefix}${String(value[_entryKey!])}`;
    // Add the main entry
    addEntry(entryKey, value);

    // Recursively add children
    if (_childrenEntryKey) {
      for (const child of value[_childrenEntryKey] as T[]) {
        addEntryT(child, `${entryKey}${_delimiter}`);
      }
    }
  }

  // Function to add entry when entryKey is not provided
  function addEntry(key: string, value: T): void {
    let node: RegistrieNode<T> = root;

    for (const char of key) {
      if (!node.children[char]) {
        node.children[char] = new RegistrieNode<T>();
      }
      node = node.children[char]!;
    }

    node.entry = value;
    node.empty = false;
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

  // Conditionally return the correct register function based on entryKey presence
  return {
    register: _entryKey ? addEntryT : addEntry,
    candidate: _entryKey ? candidateT : candidate,
    query: query
  };
}
