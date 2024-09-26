# registrie

## 0.9.0

### Minor Changes

- df744be: Update README

## 0.8.4

### Patch Changes

- 1d2aead: Fixed package files

## 0.8.3

### Patch Changes

- 9a73b18: Updated package

## 0.8.2

### Patch Changes

- 48ad850: Update README

## 0.8.1

### Patch Changes

- b52aba5: Add readme

  - Fixed the object children check, made it optional.
  - Added JSDoc to the returned methods (closures).
  - Added functionality to store objects as mutable or immutable.
  - Added a README draft.

## 0.8.0

### Minor Changes

- f3e1aea: - Added deletion functionality for key:value Registrie
  - Added tests for key:value Registrie
  - fixed package output files

## 0.7.2

### Patch Changes

- 32dbe40: Fixed CI

## 0.7.1

### Patch Changes

- eb8e594: Check ci

## 0.7.0

### Minor Changes

- 7d09f94: #### Key Changes:

  - **New Functionality**:
    - Introduced support for **typed registries** when `entryKey` and `childrenEntryKey` are provided, enforcing structure for objects.
    - Added recursive registration of entries with `addEntryT` that handles objects with `subCommands` (children).
    - Implemented a flexible `register` method that supports both primitive values and structured objects based on whether `entryKey` is provided.
  - **Improved Query Handling**:
    - Added `queryNode` function for efficient traversal to retrieve nodes.
    - `query` method now returns an entry based on the provided key or composed key (e.g., `color green`).
  - **Suggestions and Autocompletion**:
    - Introduced `candidate` and `candidateT` methods:
      - `candidate`: Works for primitive keys.
      - `candidateT`: Handles composed keys and allows for autocompletion based on nested structures.
    - Added sorting to `suggestionsT` and `candidateT` to return sorted suggestion lists.
  - **Node Structure**:
    - Refined the `RegistrieNode<T>` class to include:
      - `children`: A map of child nodes.
      - `entry`: The actual entry stored at that node (or undefined if none).
      - `empty`: A boolean flag indicating if the node stores an entry.
  - **Validation and Type Safety**:
    - Added a `validateValueType` function to ensure that entries conform to the expected structure when `entryKey` and `childrenEntryKey` are provided.
    - Enforced strict object types and key validation to prevent incorrect types from being registered.
  - **Delimiter Handling**:
    - Introduced `_delimiter` for separating keys in composed keys (e.g., `"color green"`).
    - Handled composed keys in both `candidateT` and `suggestionsT`, with recursion for deeper key structures.

  #### Miscellaneous:

  - **Improved Error Handling**: Errors are thrown if the entry type or structure does not match expectations (e.g., if `childrenEntryKey` is not an array).
  - **Refactoring**: Reduced redundancy in key traversal logic by centralizing shared functionality across both primitive and typed registries.

## 0.6.2

### Patch Changes

- 48e465c: Updated scope and fix minor errors

## 0.6.1

### Patch Changes

- a088420: Init package
