# haggis

A simple, template-based command-line argument parser for Node.js that makes working with `argv` intuitive and type-safe.

## What Does This Package Do?

When you run a program from the command line with arguments like this:

```bash
node myapp.js -s file1.js file2.js -d /output --exclude
```

Your program receives these arguments as an array of strings. **haggis** transforms this array into a structured object based on a template you provide, automatically handling:

- Short flags (`-e`, `-s`)
- Long flags (`--exclude`, `--source`)
- Multiple values for the same option
- Type casting (strings, numbers, booleans)
- Positional arguments (arguments without flags)

## Installation

```bash
npm install haggis
```

## Quick Start

```javascript
import { argv } from 'node:process';
import haggis from 'haggis';

// Define your template
const template = {
  exclude: false,
  source: [],
  destination: "",
};

// Optional configuration
const options = {
  strict: true,        // Only accept flags defined in template
  initial: 'source',   // Default property for positional arguments
};

const result = haggis(template, options, argv);
console.log(result);
```

**Running it:**

```bash
node myapp.js file1.js file2.js -d /output -e
```

**Result:**

```javascript
{
  exclude: true,
  source: ['file1.js', 'file2.js'],
  destination: '/output'
}
```

## How It Works

### The Template Object

The template defines what arguments your program accepts and their default values:

```javascript
const template = {
  exclude: false,      // Boolean flag, defaults to false
  source: [],          // Array to collect multiple values
  destination: "",     // String value
  count: 0,           // Number value
};
```

The **type** of each property determines how haggis handles the values:
- `false` → Boolean flags (presence = true)
- `[]` → Arrays that collect multiple values
- `""` → Strings (takes the last value if multiple provided)
- `0` → Numbers (automatically converted)

### Short vs Long Flags

**Short flags** start with a single dash (`-`) and use the first letter of your template property:

```bash
-e        # matches 'exclude'
-s        # matches 'source'
-d        # matches 'destination'
```

You can combine short flags:

```bash
-ed       # equivalent to -e -d
```

**Long flags** start with double dashes (`--`) and use the full property name:

```bash
--exclude
--source
--destination
```

### Positional Arguments

Arguments without flags are called "positional arguments." The `initial` option tells haggis which template property should receive them:

```javascript
const options = {
  initial: 'source',  // Positional args go to 'source'
};
```

```bash
node myapp.js file1.js file2.js    # Both files go to 'source'
```

## Understanding Quotes in UNIX/Linux

**For beginners:** When you type commands in a terminal, the shell (bash, zsh, etc.) processes your input before passing it to your program. Understanding how quotes work is essential.

### How the Shell Handles Quotes

In UNIX/Linux shells, quotes control how arguments are split and interpreted:

#### Without Quotes

Spaces separate arguments:

```bash
node myapp.js hello world
# argv = ['node', 'myapp.js', 'hello', 'world']
# Two separate arguments
```

#### With Double Quotes (`""`)

Everything inside is treated as **one argument**, but the shell still processes:
- Variable expansion (`$VAR` becomes its value)
- Command substitution (`` `command` `` or `$(command)`)
- Escape sequences (`\n`, `\t`)

```bash
node myapp.js "hello world"
# argv = ['node', 'myapp.js', 'hello world']
# One argument with a space

node myapp.js "Hello $USER"
# If USER=john, argv = ['node', 'myapp.js', 'Hello john']
```

#### With Single Quotes (`''`)

Everything inside is treated **literally** - no expansion happens:

```bash
node myapp.js 'hello world'
# argv = ['node', 'myapp.js', 'hello world']
# One argument with a space

node myapp.js 'Hello $USER'
# argv = ['node', 'myapp.js', 'Hello $USER']
# The $USER is NOT expanded
```

### Important: By the Time Your Program Runs

**The quotes are already removed!** The shell processes them and removes them before your program sees the arguments. Your Node.js program receives the processed strings, not the quotes themselves.

```bash
node myapp.js "my file.txt"
# Your program receives: ['node', 'myapp.js', 'my file.txt']
# The quotes are gone - you just get the string with a space in it
```

This means **haggis** (and your program) never sees the quotes - it only sees the final string values that the shell provides.

### Practical Examples

```bash
# Filename with spaces - NEEDS quotes
node myapp.js -s "my document.txt" -d "/output folder"

# Without quotes (WRONG - treated as 4 separate arguments)
node myapp.js -s my document.txt -d /output folder
# source = ['my']
# destination = 'document.txt'
# And 'folder' might be treated as a positional argument!

# Using variables
node myapp.js -d "$HOME/output"     # Expands to /home/yourname/output
node myapp.js -d '$HOME/output'     # Literally the string: $HOME/output

# Special characters that need quotes
node myapp.js "file with * and ?" 
# Without quotes, * and ? are wildcards expanded by the shell
```

## Options

### `strict` (default: `true`)

When `true`, haggis ignores flags that aren't defined in your template:

```javascript
const options = { strict: true };

// Template only has 'source' and 'destination'
// Running: node myapp.js --unknown value
// The --unknown flag is ignored
```

When `false`, unknown flags are allowed (but not added to the result).

### `initial` (default: `'positional'`)

Specifies which template property receives positional arguments:

```javascript
const options = { initial: 'source' };

// Running: node myapp.js file1.js file2.js
// Both files go to result.source
```

## Automatic Type Casting

haggis automatically converts string arguments to appropriate types:

```javascript
// Running: node myapp.js --count 42 --enabled true --ratio 3.14

// Result:
{
  count: 42,        // Number (integer)
  enabled: true,    // Boolean
  ratio: 3.14       // Number (float)
}
```

Conversion rules:
- `"true"` / `"false"` → Boolean
- Numeric strings → Numbers (integers or floats)
- Everything else → String
- Empty/whitespace → `null`

## Complete Example

```javascript
import { argv } from 'node:process';
import haggis from 'haggis';

const template = {
  verbose: false,
  input: [],
  output: "",
  threads: 1,
};

const options = {
  strict: true,
  initial: 'input',
};

const config = haggis(template, options, argv);

if (config.verbose) {
  console.log('Input files:', config.input);
  console.log('Output directory:', config.output);
  console.log('Thread count:', config.threads);
}
```

**Usage:**

```bash
# Basic usage
node process.js file1.js file2.js -o /output

# With all options
node process.js file1.js file2.js --output /output --threads 4 -v

# Using quotes for paths with spaces
node process.js "my file.js" "another file.js" -o "/output folder" -v
```

## API

### `haggis(template, options, argv)`

**Parameters:**

- `template` (Object): Object defining accepted arguments and their default values
- `options` (Object): Configuration object
  - `strict` (Boolean): Only accept flags defined in template (default: `true`)
  - `initial` (String): Property name for positional arguments (default: `'positional'`)
- `argv` (Array): Process arguments array (typically `process.argv`)

**Returns:** Object with parsed arguments based on template structure

## Running Tests

```bash
npm test
```

## License

MIT

## Author

[@catpea](https://github.com/catpea)

## Repository

[https://github.com/catpea/haggis](https://github.com/catpea/haggis)
