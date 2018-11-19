console.time("total")

const fse = require("fs-extra")

const getInputPkgs = require("./a-1-input-pkgs").default
const getInputNodes = require("./a-2-input-nodes").default
const getModules = require("./a-3-output-modules").default
const getWiredModules = require("./a-4-output-wired-modules").default
const splitOutput = require("./a-5-output-split").default

const path = "/Users/thien/Code/anduin/design/core/" +
  "target/scala-2.12/scalajs-bundler/main"




/*********************************************
 *
 * input: String
 *
 **/

/***/ console.time("read input file")

const input = fse.readFileSync(`${path}/core-opt.js`, "utf8")

/***/ console.timeEnd("read input file")
/***/ console.log("  ", input.length, "bytes")




/*********************************************
 *
 * pkgs: [String]
 * - ids of available pkgs
 * - e.g. anduin.component.button
 *
 **/

/***/ console.time("get input packages")

const pkgs = getInputPkgs()

/***/ console.timeEnd("get input packages")
/***/ console.log("  ", pkgs.length, "(scala) packages")




/*********************************************
 *
 * nodes: [{
 *   id: String, 
 *   type: String,
 *   range: { start: Number, end: Number },
 *   module: String, // id of related module
 * }]
 * - obj of parsed nodes
 * - last of nodes is mainNode
 *
 **/

/***/ console.time("get input nodes") 

const nodes = getInputNodes(input, pkgs)

/***/ console.timeEnd("get input nodes")
/***/ console.log("  ", nodes.length, "top-level declarations")
/***/ console.log("  ", "entry:", nodes.slice(-1)[0].id)




/*********************************************
 *
 * module: {
 *   id: String, // same as pkg id
 *   nodes: [Node], // same as each item in "nodes"
 *   exports: [String],
 *   code: String
 * }
 *
 **/

/***/ console.time("get output modules")

let modules = getModules(input, nodes, pkgs)

/***/ console.timeEnd("get output modules")
/***/ console.log("  ", modules.length, "(js) modules")




/*********************************************
 *
 * wired modules: <same as module>
 * - have "imports" added directly to "code"
 *
 **/

/***/ console.time("wire output modules")

modules = getWiredModules(modules)

/***/ console.timeEnd("wire output modules")




/*********************************************
 *
 * split modules: <same as module>
 * - convert pages import in "router" to dynamic
 *   ones. Apply directly to its "code"
 *
 **/

/***/ console.time("split output file")

const splitResult = splitOutput(modules)
modules = splitResult.modules

/***/ console.timeEnd("split output file")
/***/ console.log("  ", splitResult.pages.length, "pages")




/*********************************************
 *
 **/

/***/ console.time("write output file")

const outputPath = `${path}/modules`
fse.removeSync(outputPath)
fse.ensureDirSync(outputPath)
modules.forEach(module => {
  fse.writeFileSync(`${outputPath}/${module.id}.js`, module.code)
})
// copy the "scripts" folder for further compilation (webpack)
fse.copySync(`${path}/scripts`, `${outputPath}/scripts`)
// we don't need to copy "node_modules" folder because node
// will automatically lookup parent

/***/ console.timeEnd("write output file")
/***/ const mSize = modules.reduce((tPrev, module) => {
/***/   const size = module.nodes.reduce((mPrev, node) => (
/***/     mPrev + (node.range.end - node.range.start)
/***/   ), 0)
/***/   return tPrev + size
/***/ }, 0)
/***/ const mPc = Math.round(mSize / input.length * 100)
/***/ console.log("  ", mSize, "bytes", `(${mPc}%)`)

console.timeEnd("total")
