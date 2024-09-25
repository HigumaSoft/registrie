# Registrie

A flexible trie-based registry for storing and querying entries with optional hierarchical keys. `Registrie` supports both simple key-value stores and complex nested structures, making it a versatile tool for various applications.

## Installation

To install `Registrie` using npm:

```bash
npm install registrie
```

Or with yarn:

```bash
yarn add registrie
```

## Usage

`Registrie` can be used as either a simple key-value store or a more complex registry for nested entries.

### Basic Example

If no `entryKey` is provided, `Registrie` behaves as a simple key-value registry.

```typescript
import { Registrie } from 'registrie';

// Create a new registry
const basicRegistry = Registrie<string>();

// Register entries
basicRegistry.register('apple', 'A tasty fruit');
basicRegistry.register('banana', 'A yellow fruit');

// Query entries
console.log(basicRegistry.query('apple')); // Output: 'A tasty fruit'

// Get suggestions for a partial key
console.log(basicRegistry.candidate('b')); // Output: ['banana']

// Erase an entry
basicRegistry.erase('apple');
console.log(basicRegistry.query('apple')); // Output: undefined
```

### Nested Example

If `entryKey` is provided, `Registrie` supports nested structures. This is useful for managing hierarchical data where each entry has a key and potentially children.

```typescript
import { Registrie } from 'registrie';

interface Category {
  name: string;
  subCategories?: Category[];
}

// Create a nested registry
const nestedRegistry = Registrie<Category>('name', 'subCategories');

// Define categories
const fruits: Category = {
  name: 'fruits',
  subCategories: [
    { name: 'apple' },
    { name: 'banana' },
  ],
};

const vegetables: Category = {
  name: 'vegetables',
  subCategories: [
    { name: 'carrot' },
    { name: 'broccoli' },
  ],
};

// Register categories
nestedRegistry.register(fruits);
nestedRegistry.register(vegetables);

// Query entries
console.log(nestedRegistry.query('fruits apple')); // Output: { name: 'apple' }

// Get suggestions
console.log(nestedRegistry.candidate('fruits')); // Output: ['apple', 'banana']
```

## API

### `BasicRegistrie<T = any>`

#### `register(key: string, value: T, frozen?: boolean): void`
Registers an entry in the registry.

- `key`: The key to use for the entry.
- `value`: The entry to register.
- `frozen`: If `true` (default), registers the entry as frozen (immutable).

#### `query(key: string): T | undefined`
Queries the registry for an entry by its key.

- `key`: The key to search for in the registry.

#### `candidate(key: string): string[]`
Provides suggestions for a partial key input.

- `key`: The partial key to use for suggestions.

#### `erase(key: string): void`
Erases an entry from the registry.

- `key`: The key of the entry to remove.

### `NestedRegistrie<T extends object>`

#### `register(value: T, frozen?: boolean): void`
Registers a nested entry in the registry.

- `value`: The entry to register.
- `frozen`: If `true` (default), registers the entry as frozen (immutable).

#### `query(key: string): T | undefined`
Queries the registry for an entry by its key.

- `key`: The key to search for in the registry.

#### `candidate(key: string): Array<T[keyof T]>`
Provides suggestions for a partial key input.

- `key`: The partial key to use for suggestions.

#### `erase(key: string): void`
Erases an entry and its children from the registry.

- `key`: The key of the entry to remove.

## License

MIT License © [Higuma Soft](https://github.com/HigumaSoft)
