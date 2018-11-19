const esprima = require("esprima")

/***********/

/**
 * pkg:  anduin.component.button
 * node: $c_Landuin_component_button_Button
 * module: pkg + "base"
 **/
const withPkg = (pkgs) => (node) => ({
  ...node,
  module: pkgs.find(pkg => {
    const id = pkg.split(".").join("_")
    return node.id.includes(`${id}_`)
  }) || "base"
})

/***********/

// $_anduin_foo.prototype.$classData = ...
const getIdExpression = (node) => {
  const left = node.expression.left
  if (!left) { return "" }
  const isClassData = left.property.name === "$classData"
  if (!isClassData) { return "" }
  return left.object.object.name
}

// const $_anduin_foo = ...
const getIdVariable = (node) => {
  if (node.declarations.length > 1) { throw "the hell" }
  return node.declarations[0].id.name
}

// class $_anduin_foo extends ...
const getIdClass = (node) => {
  return node.id.name
}

const getId = (node, index, nodes) => {
  if (index === nodes.length - 1) {
    // main pkg initializer node
    return node.expression.callee.object.callee.name
  } else {
    // normal (non-main) node
    switch(node.type) {
      case "ExpressionStatement": return getIdExpression(node)
      case "VariableDeclaration": return getIdVariable(node)
      case "ClassDeclaration":    return getIdClass(node)
      default:                    return ""
    }
  }
}

const parseNode = (node, index, nodes) => ({
  id: getId(node, index, nodes), 
  type: node.type,
  range: ({ start: node.range[0], end: node.range[1] })
})

/***********/

const getNodes = (input, pkgs) => {
  const root = esprima.parseScript(input, { range: true })
  return root.body
    .map(parseNode)
    .map(withPkg(pkgs))
}

exports.default = getNodes
