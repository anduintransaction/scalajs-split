const getImport = (imp) => (
  "import {\n  " +
  imp.nodes.join(",\n  ") +
  `\n} from "./${imp.id}.js"`
)

const addImportsToCode = (module) => ({
  ...module,
  code: module.imports.map(getImport).join("\n") +
        "\n" +
        module.code
})

/***********/

const getUsedNodes = (target, current) => ({
  id: current.id,
  nodes: current.nodes
    .filter(node => (
      node.shouldExport &&
      target.code.includes(node.id)
     ))
    .map(node => node.id)
})

const withImports = (module, i, modules) => ({
  ...module,
  imports: modules
    .filter(m => m.id !== module.id) // filter self
    .map(m => getUsedNodes(module, m))
    .filter(m => m.nodes.length > 0) // keep non-empty only
})

/***********/

const getWired = (modules) => modules
  .map(withImports)
  .map(addImportsToCode)

exports.default = getWired
