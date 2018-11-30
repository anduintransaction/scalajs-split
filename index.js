#!/usr/bin/env node

/***/ console.time("total")

const fse = require("fs-extra")
const resolvePath = require("path").resolve

const { logStart, logEnd, logInfo } = require("./0-utils")

const inlineImports = require("./1-inline-imports").default
const getInputPkgs  = require("./2-get-pkgs").default
const getInputNodes = require("./3-get-nodes").default
const genModules    = require("./4-gen-modules").default
const wireModules   = require("./5-wire-modules").default
const splitModules  = require("./6-split-modules").default
const runWebpack    = require("./7-run-webpack").default

const pathRoot = resolvePath(process.argv[2])
const pathTarget = `${pathRoot}/target/scala-2.12/scalajs-bundler/main`




/*********************************************
 *
 * inputRaw: String
 * - this is the generated result of scalajs
 *   compiler
 * - this is the full-opt one, with ES6 and
 *   without GCC
 *
 **/

/***/ logStart("read input file")

const inputRaw = fse.readFileSync(`${pathTarget}/core-opt.js`, "utf8")

/***/ logEnd("read input file")
/***/ logInfo(`${inputRaw.length} bytes`)




/*********************************************
 *
 * input: String
 * - by default scalajs places external imports
 *   (e.g. require("downshift")) at the top of
 *   the file.
 * - this prevents code splitting from working
 *   effectively so we need to inline these to tie
 *   them more correct with their consumers
 *
 **/

/***/ logStart("inline imports")

const inlineResult = inlineImports(inputRaw)
const input = inlineResult.input

/***/ logEnd("inline imports")
/***/ logInfo(`${inlineResult.imports.length} imports`)




/*********************************************
 *
 * pkgs: [String]
 * - ids of available pkgs
 * - e.g. anduin.component.button
 *
 **/

/***/ logStart("get input packages")

const pkgsResult = getInputPkgs({ path: pathRoot })
const pkgs = pkgsResult.pkgs

/***/ logEnd("get input packages")
/***/ logInfo(`${pkgsResult.paths.length} scala files scanned`)
/***/ logInfo(`${pkgsResult.pkgs.length} scala packages`)




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

/***/ logStart("get input nodes") 

const nodes = getInputNodes(input, pkgs)

/***/ logEnd("get input nodes")
/***/ logInfo(`${nodes.length} top-level declarations`)
/***/ logInfo(`entry: ${nodes.slice(-1)[0].id}`)




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

/***/ logStart("generate output modules")

let modules = genModules(input, nodes, pkgs)

/***/ logEnd("generate output modules")
/***/ logInfo(`${modules.length} (js) modules`)




/*********************************************
 *
 * wired modules: <same as module>
 * - have "imports" added directly to "code"
 *
 **/

/***/ logStart("wire modules")

modules = wireModules(modules)

/***/ logEnd("wire modules")




/*********************************************
 *
 * split modules: <same as module>
 * - convert pages import in "router" to dynamic
 *   ones. Apply directly to its "code"
 *
 **/

/***/ logStart("split modules")

const splitResult = splitModules(modules)
modules = splitResult.modules

/***/ logEnd("split modules")
/***/ logInfo(`${splitResult.pages.length} pages`)




/*********************************************
 * 
 * write modules
 * - write modules to files for webpack to
 *   process later
 *
 **/

/***/ logStart("write modules")

const pathModules = `${pathTarget}/modules`
fse.ensureDirSync(pathModules)
modules.forEach(module => {
  fse.writeFileSync(`${pathModules}/${module.id}.js`, module.code)
})
// copy the "scripts" folder for further compilation (webpack)
fse.copySync(`${pathTarget}/scripts`, `${pathModules}/scripts`)
// we don't need to copy "node_modules" folder because node
// will automatically lookup parent

/***/ logEnd("write modules")




/*********************************************
 *
 * run webpack
 * - run webpack on generated files
 *
 **/

/***/ logStart("run webpack")

runWebpack({ path: pathTarget, nodes, modules })

/***/ logEnd("run webpack")




/***/ console.timeEnd("total")
