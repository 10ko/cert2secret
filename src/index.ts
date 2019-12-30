#!/usr/bin/env node

const program = require("commander")
const packagejson = require("./../package.json")
import cert2secret from "./cert2secret"

program.version(packagejson.version)

program
  .requiredOption("-k, --key <key file>", "you must specify a TLS key file")
  .requiredOption(
    "-c, --cert <certificate file>",
    "you must specify a TLS certificate file"
  )
  .option(
    "-d --dest <destination>",
    "destination for the generated yaml manifest"
  )
  .option("--name <name>", "the name of your certificate")
  .option(
    "--namespace <namespace>",
    "the namespace for your certificate manifest"
  )

program.parse(process.argv)

cert2secret({
  key: program.key,
  cert: program.cert,
  dest: program.dest,
  name: program.name,
  namespace: program.namespace,
})
