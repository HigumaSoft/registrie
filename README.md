<div align="center">

# RegisTrie

[![npm version](https://img.shields.io/npm/v/registrie.svg)](https://www.npmjs.com/package/registrie)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/HigumaSoft/registrie/actions/workflows/publish.yml/badge.svg)](https://github.com/HigumaSoft/registrie/actions/workflows/publish.yml)


</div>

A trie-based registry for TypeScript/JavaScript. Supports both simple key-value storage and hierarchical nested structures with prefix-based autocomplete.

## Installation

```bash
npm install registrie
```

## Usage

### BasicRegistrie — simple key-value store

```typescript
import { Registrie } from 'registrie';

const registry = Registrie<string>();

registry.register('apple', 'A tasty fruit');
registry.register('banana', 'A yellow fruit');
registry.register('apricot', 'An orange fruit');

registry.query('apple');       // 'A tasty fruit'
registry.query('cherry');      // undefined

registry.candidate('ap');      // ['apple', 'apricot']
registry.candidate('b');       // ['banana']
registry.candidate('');        // ['apple', 'apricot', 'banana']

registry.erase('apple');
registry.query('apple');       // undefined
```

### NestedRegistrie — hierarchical store

Keys are extracted from the objects themselves. Children are registered recursively.

```typescript
import { Registrie } from 'registrie';

interface Command {
  name: string;
  description: string;
  subCommands?: Command[];
}

const registry = Registrie<Command>('name', 'subCommands');

registry.register({
  name: 'git',
  description: 'Version control',
  subCommands: [
    { name: 'commit', description: 'Record changes' },
    { name: 'push',   description: 'Upload changes' },
  ]
});

registry.query('git');           // { name: 'git', ... }
registry.query('git commit');    // { name: 'commit', ... }
registry.query('git pull');      // undefined

// Pass a trailing space to get children of a node
registry.candidate('');          // ['git']
registry.candidate('git ');      // ['commit', 'push']

registry.erase('git');
registry.query('git');           // undefined
registry.query('git commit');    // undefined
```

## API

### `Registrie<T>(entryKey?, childrenEntryKey?)`

Factory function. Returns a `BasicRegistrie<T>` or `NestedRegistrie<T>` depending on arguments.

| Arguments | Returns |
|-----------|---------|
| none | `BasicRegistrie<T>` |
| `entryKey` | `NestedRegistrie<T>` |
| `entryKey, childrenEntryKey` | `NestedRegistrie<T>` with recursive children |

### `BasicRegistrie<T>`

| Method | Signature | Description |
|--------|-----------|-------------|
| `register` | `(key: string, value: T, frozen?: boolean) => void` | Store an entry. Overwrites if key exists. Throws on empty key. |
| `query` | `(key: string) => T \| undefined` | Exact key lookup. |
| `candidate` | `(key: string) => string[]` | All keys with given prefix, sorted. |
| `erase` | `(key: string) => void` | Remove an entry. No-op if not found. |

### `NestedRegistrie<T extends object>`

| Method | Signature | Description |
|--------|-----------|-------------|
| `register` | `(value: T, frozen?: boolean) => void` | Store an entry, key extracted from object. Overwrites if key exists. |
| `query` | `(key: string) => T \| undefined` | Space-delimited path lookup. |
| `candidate` | `(key: string) => string[]` | Immediate child keys at current depth, sorted. Pass trailing space to get children. |
| `erase` | `(key: string) => void` | Remove entry and its logical children. No-op if not found. |

## Notes

**`frozen` defaults to `true`**
By default, registered objects are frozen with `Object.freeze()` making them immutable after registration. Pass `frozen: false` to opt out:
```typescript
registry.register('key', value, false);
```

**Duplicate keys**
Registering the same key twice silently overwrites the previous entry.

**`candidate()` in NestedRegistrie**
To get children of a node, include a trailing space in the key:
```typescript
registry.candidate('git ');   // children of 'git' → ['commit', 'push']
registry.candidate('git');    // entries with prefix 'git' → ['git']
```

## License

MIT © [Higuma Soft](https://github.com/HigumaSoft)