// https://stackoverflow.com/a/3561711
const escape = (string) => string
  .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

const inline = (inputRaw) => {
  let input = inputRaw
  const regex = /const (\$i.*) = (require\(".*"\));/g
  const imports = []

  let result = regex.exec(input)
  while (result) {
    const [req, id, value] = result

    // comment out the require statement
    imports.push(req)
    input = input.replace(req, `// ${req}`)

    // replace with direct value
    const regex2 = new RegExp(`${escape(id)}([^\\$\\w])`, 'g')
    // IMPORTANT: note that parenthese around "value"...
    // that costs me a day to figure out. In short it is to enforce
    // the execution order
    input = input.replace(regex2, `(${value})$1`)

    // next iteration
    // IMPORTANT: must exec against the raw
    result = regex.exec(inputRaw)
  }

  return { input, imports }
}

exports.default = inline
