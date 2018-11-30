/**
 * Example input:
 *
 *        *  import {
 * node   *    $m_Landuin_guide_pages_welcome_PageWelcome$
 * module *  } from "anduin.guide.pages.welcome.js"
 *        *
 *        *  return this$2$2.getRender$1__p1__F0__Ljapgolly_scalajs_react_extra_router_RouterConfigDsl__Ljapgolly_scalajs_react_extra_router_Renderer(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$3) {
 *        *    return (function() {
 * start  *      const jsx$61 = $g.Promise;
 *        *      const a = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$4) {
 *        *        return (function(ctl$2) {
 *        *          const ctl = $as_Ljapgolly_scalajs_react_extra_router_RouterCtl(ctl$2);
 * node   *          return $m_Landuin_guide_pages_welcome_PageWelcome$().render__Ljapgolly_scalajs_react_extra_router_RouterCtl__Ljapgolly_scalajs_react_vdom_VdomElement(ctl)
 *        *        })
 *        *      })($this$3));
 * end    *      return jsx$61.resolve(a)
 *        *    })
 *        *  })(this$2$2)), dsl$3)
 *
 **/

/**
 * Example output:
 *
 *        *  return this$2$2.getRender$1__p1__F0__Ljapgolly_scalajs_react_extra_router_RouterConfigDsl__Ljapgolly_scalajs_react_extra_router_Renderer(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$3) {
 *        *    return (function() {
 * start  *      return import("anduin.guide.pages.welcome.js").then(({ $m_Landuin_guide_pages_welcome_PageWelcome$ }) => {
 *        *        return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$4) {
 *        *          return (function(ctl$2) {
 *        *            const ctl = $as_Ljapgolly_scalajs_react_extra_router_RouterCtl(ctl$2);
 * node   *            return $m_Landuin_guide_pages_welcome_PageWelcome$().render__Ljapgolly_scalajs_react_extra_router_RouterCtl__Ljapgolly_scalajs_react_vdom_VdomElement(ctl)
 *        *          })
 *        *        })($this$3));
 * end    *      })
 *        *    })
 *        *  })(this$2$2)), dsl$3)
 *
 */

/***********/

const isPageStart = (leftBound) => (line, index) => (
  index > leftBound && line.includes(".Promise")
)

const toPages = (prev, line, lineIndex, lines) => {
  if (!line.includes(".getRender")) { return prev }
  const start = lines.findIndex(isPageStart(lineIndex))
  const page = { start: start }
  return [...prev, page]
}

/***********/

const isPageEnd = (start) => (line, index) => (
  index > start && line.includes(".resolve")
)

const withEnd = (lines) => (page) => ({
  ...page,
  end: lines.findIndex(isPageEnd(page.start))
})

const isPageRender = (start) => (line, index) => (
  index > start && line.includes(".render")
)

const withNode = (lines) => (page) => {
  const line = lines.find(isPageRender(page.start))
  const node = line.slice(
    line.indexOf("$"),
    line.indexOf("().render")
  )
  return ({ ...page, node: node })
}

const withModule = (module) => (page) => ({
  ...page,
  module: module.imports
    .find(i => i.nodes.includes(page.node))
    .id
})

const withDynamicImport = (lines) => (page) => {
  const newLines = [
    `return import("./${page.module}.js")`,
    `  .then(({ ${page.node} }) => {`,
    ...lines.slice(page.start + 1, page.end), // DANGER
    "  })"
  ]
  newLines[2] = newLines[2]
    .replace(/const .* = new /, "return new ")
  return { ...page, dynamicImport: newLines }
}

/***********/

const getPages = (lines, module) => lines
  .reduce(toPages, []) // provide start of page
  .map(withEnd(lines))
  .map(withNode(lines))
  .map(withModule(module)) // the module of the node
  .map(withDynamicImport(lines))

/***********/

const addDynamicImport = ({ lines, shifted }, page) => ({
  lines: [
    ...lines.slice(0, page.start + shifted),
    ...page.dynamicImport,
    ...lines.slice(page.end + shifted + 1)
  ],
  shifted: shifted +
    page.dynamicImport.length -
    (page.end - page.start + 1)
})

const disableStaticImport = (isImports) => (lines, page) => {
  // this line could be either:
  //   } from "./anduin.foo.js"       (if not processed)
  //   } from "./anduin.foo.js" */    (if processed)
  const end = lines.findIndex(line => {
    return line.startsWith(`} from "./${page.module}.js"`)
  })
  // skip if processed
  if (lines[end].includes("*/")) { return lines }

  const start = isImports.slice(0, end).lastIndexOf(true)
  return lines.map((line, index) => {
    if (index === start) { return `/* ${line}` }
    if (index === end) { return `${line} */` }
    return line
  })
}

const getNextCode = (pages, lines) => {
  // add dynamic imports
  let { lines: nextLines } = pages
    .reduce(addDynamicImport, { lines: lines, shifted: 0 })
  // disable static imports
  const isImports = lines.map(line => line === "import {")
  nextLines = pages
    .reduce(disableStaticImport(isImports), nextLines)
  // done!
  return nextLines.join("\n")
}

/***********/

const splitOutput = (modules) => {
  const module = modules
    .find(m => m.id.includes("router"))
  const lines = module.code.split("\n")
  const pages = getPages(lines, module)

  const nextCode = getNextCode(pages, lines)
  const nextModule = { ...module, code: nextCode }
  const nextModules = modules
    .map(m => m.id === nextModule.id ? nextModule : m)
  return { modules: nextModules, pages: pages }
}

exports.default = splitOutput
