
export default function main(template={}, config = {}, argv) {

  const options = { strict: true, initial: 'positional' };
  Object.assign(options, config);

  let instructions = argv.reduce((accumulator, argument, index) => {
    if (index < 2) return accumulator;
    if (argument.startsWith('--')) {
      const name = argument.substring(2);
      const operation = { name: [name], data: [] };
      if((name in template) && (typeof template[name] === 'boolean')) operation.default = true; // presence means true unless later item sets a specific value
      accumulator.push(operation);
    } else if (argument.startsWith('-')) {
      const operation = { name: [], data: [] }
      accumulator.push(operation);
      const letters = argument.substring(1).split('');
      const names = letters.map(letter => [Object.keys(template).find(key => key.startsWith(letter)),letter])
      names.forEach(([name, letter]) => operation.name.push( name || letter))

      // check if all the letters in the letter group were bools, give them a default true
      // if not, no default will be assumed
      const allBools = names.map(([name])=>(typeof template[name] === 'boolean')).every(o=>o===true)
      if(allBools) operation.default = true; // presence means true unless later item sets a specific value
    } else {
      const operation = accumulator[accumulator.length - 1];
      operation.data.push(cast(argument))
    }
    return accumulator;
  }, [{ name: [options.initial], data: [] }]);



  // hoist defaults
  instructions.filter(o => ('default' in o) && (o.data.length == 0)).map(o => { o.data = [o.default]; delete o.default })

  // remove empty data withut defaults
  instructions = instructions .filter(i=>i.data.length!==0 && !('default' in i))

  // Apply Instructions To Template Object
  const result = instructions.reduce((result, opt) => {
    opt.name.forEach(name => {
      if (options.strict && (!(name in result))) return;
      if (Array.isArray(result[name])) {
        result[name] = result[name].concat(opt.data);
      } else {
        if (opt.data.length) result[name] = opt.data[opt.data.length - 1]; // always last, this is about winning
      }

    })
    return result;
  }, structuredClone(template));

  function cast(value) {
    // Trim whitespace and check if the value is empty
    if (value === null || value.trim() === '') {
      return null; // or handle as needed
    }

    // Check for boolean values
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }

    // Try converting to a number
    const number = Number(value);

    // Check if it is a valid number
    if (!isNaN(number)) {
      // Return integer if whole number, otherwise return float
      return Number.isInteger(number) ? Math.floor(number) : number;
    }

    // If not a number and not a boolean, return as a string
    return value;
  }

  return result;
}
