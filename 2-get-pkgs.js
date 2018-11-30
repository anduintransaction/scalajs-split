const glob = require("glob")
const fs = require("fs")

/*********************/

const noLeaf = (pkg, i, allPkgs) => (
  !allPkgs.some(p => pkg.startsWith(`${p}.`))
)

/*********************/

const toFlat = (prev, pkg) =>
  [ ...prev, pkg.id, ...pkg.imports ]

/*********************/

const prefix = "src/main/scala/"
// get id from path
// - path is absolute, e.g.
//   ~/thien/anduin/design/core/src/main/scala/anduin/foo/Foo.scala
const withId = (pkg) => {
  const id = pkg.path
    .slice(
      pkg.path.indexOf(prefix) + prefix.length,
      pkg.path.lastIndexOf("/")
    )
    .split("/").join(".")
  return { id: id, imports: pkg.imports }
}

/*********************/

// import formats:
// - \nimport anduin.foo.Foo
// - \nimport anduin.foo._
// - \nimport anduin.foo.Foo._
// - \nimport anduin.foo.Foo.Bar
const getImports = (src) => {
  const pkgs = []
  const regexp = /\nimport ([a-z\.]+)\./g
  let result = regexp.exec(src)
  while (result) {
    pkgs.push(result[1])
    result = regexp.exec(src)
  }
  return pkgs
}


const withImports = (path) => {
  const src = fs.readFileSync(path, 'utf-8')
  return { path: path, imports: getImports(src) }
}

/*********************/

/**
 * This gets all scala pkgs that should be available in
 * the final compiled js file. This includes dep-only
 * pkgs like org.scalajs and non-dep pkgs like the main
 * entry
 **/
const getPkgs = ({ path }) => {
  const paths = glob.sync(`${path}/**/*.scala`)
  const pkgs = paths
    .map(withImports)
    .map(withId)
    .reduce(toFlat, [])
    .filter((v, i, a) => a.indexOf(v) === i) // unique
    .filter(noLeaf)
  return { pkgs, paths }
}

exports.default = getPkgs
