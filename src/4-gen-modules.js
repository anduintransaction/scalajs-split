const getNodeCode = (input) => (node) => {
  const prefix = (node.shouldExport ? "export " : "")
  const body = input.slice(node.range.start, node.range.end + 1)
  return `${prefix}${body}`
}

const withModuleCode = (input) => (module) => ({
  ...module,
  code: module.nodes
    .map(getNodeCode(input))
    .join("\n")
})

/***********/

const withShouldExport = (node) => ({
  ...node,
  shouldExport: (
    node.type === "VariableDeclaration" ||
    node.type === "ClassDeclaration"
  )
})

const withNodes = (nodes) => (module) => ({
  id: module,
  nodes: nodes
    .filter(node => node.module === module)
    .map(withShouldExport)
})

/***********/

const getModules = (input, nodes, pkgs) => [...pkgs, "base"]
  .map(withNodes(nodes))
  .filter(module => module.nodes.length > 0)
  .map(withModuleCode(input))

exports.default = getModules
