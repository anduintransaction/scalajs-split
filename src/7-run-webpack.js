const execSync = require("child_process").execSync
const pathResolve = require("path").resolve

const getEntry = ({ path, nodes, modules }) => {
  const node = nodes.slice(-1)[0]
  const module = modules.find(module => {
    const nodeId = node.id.split("_").join(".")
    return nodeId.includes(module.id)
  })
  return `${path}/scalajs-split-modules/${module.id}.js`
}

const run = ({ path, nodes, modules }) => execSync(
  "npx webpack" +
  ` --config ${pathResolve(__dirname, "webpack.config.js")}` +
  ` --x-entry ${getEntry({ path, nodes, modules })}` +
  ` --x-path ${path}` +
  ' --progress',
  { stdio: 'inherit' }
)

exports.default = run
