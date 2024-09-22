export type BaseObject = {
  name: string;
};
export type EntryObject = BaseObject & {
  usage: string;
};
export type EntryObjectWithChildren = EntryObject & {
  subCommands: EntryObjectWithChildren[];
};
export type EntryObjectWithInverseChildren = EntryObject & {
  subCommands: string[];
};
export type ArrayType = string[];
export type NumberType = number;
export type StringType = string;
export type BooleanType = boolean;
export type AnyType = any;
export type UndefinedType = undefined;
export type NullType = null;
export type FunctionType = (...args: any[]) => any;

export const mockBaseObject: BaseObject = { name: 'Base Object' };
export const mockEntryObject: EntryObject = {
  name: 'Entry Object',
  usage: 'usage-key'
};
export const mockEntryObjectWithChildren: EntryObjectWithChildren = {
  name: 'Parent Object',
  usage: 'parent-key',
  subCommands: [
    { name: 'Child Object 1', usage: 'child-key-1', subCommands: [] },
    { name: 'Child Object 2', usage: 'child-key-2', subCommands: [] }
  ]
};
export const mockEntryObjectWithInverseChildren: EntryObjectWithInverseChildren =
  {
    name: 'Parent Object',
    usage: 'parent-key',
    subCommands: ['invalid-child']
  };
export const mockArrayType: ArrayType = ['item1', 'item2'];
export const mockNumberType: NumberType = 42;
export const mockStringType: StringType = 'string';
export const mockBooleanType: BooleanType = true;
export const mockAnyType: AnyType = { name: 'Any Object' };
export const mockUndefinedType: UndefinedType = undefined;
export const mockNullType: NullType = null;
export const mockFunctionType: FunctionType = () => 'result';
export const mockNumberStringType: StringType = "42";

export const mockDataWithChildren: EntryObjectWithChildren[] = [
  {
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
  },
  {
    name: 'Css font',
    usage: 'font',
    subCommands: [
      { name: 'Font Arial', usage: 'arial', subCommands: [] },
      { name: 'Font Helvetica', usage: 'helvetica', subCommands: [] }
    ]
  },
  {
    name: 'Css color mix',
    usage: 'color-mix',
    subCommands: [
      { name: 'Color Red', usage: 'red', subCommands: [] },
      { name: 'Color Green', usage: 'green', subCommands: [] }
    ]
  }
];

export const mockDataAny = {
  object: mockBaseObject,
  array: mockArrayType,
  number: mockNumberType,
  string: mockStringType,
  boolean: mockBooleanType,
  any: mockAnyType,
  undefined: mockUndefinedType,
  null: mockNullType,
  function: mockFunctionType,
  'number string': mockNumberStringType
};
