const stepTotal = 9

let stepNow = 0

const step = () => `[${stepNow}/${stepTotal}]`

exports.logStart = (string) => {
  stepNow = stepNow + 1
  process.stdout.write(`${step()} ${string}...`)
  console.time(string)
}

exports.logEnd = (string) => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(`${step()} `)
  console.timeEnd(string)
}

exports.logInfo = (string) => {
  console.log("      \x1b[2m%s\x1b[0m", string)
}
