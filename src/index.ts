#!/usr/bin/env node

const chalk = require("chalk")
const program = require("commander")
const packagejson = require("./../package.json")
import { readFile, ensureDir, writeFile, pathExists } from "fs-extra"
import yaml from "js-yaml"
import { join, dirname } from "path"


interface Params {
  key: string
  cert: string
  dest?: string
  name?: string
  namespace?: string
}

const manifest = {
  apiVersion: "v1",
  kind: "Secret",
  type: "kubernetes.io/tls",
  metadata: {
    name: "",
    namespace: "",
  },
  data: {
    "tls.crt": "",
    "tls.key": "",
  }
}

const computeDestination = (cert: string, dest?: string, name?: string): string => {
  let output = process.cwd()
  if (dest) {
    output = dest
  }
  if (!dest?.endsWith(".yaml") && !dest?.endsWith(".yml")) {
    output = name ? join(output, `${name}.yaml`) : join(output, `${cert}.yaml`)
  }
  return output
}

const cert2secret = async (params: Params) => {
  const { key, cert, dest, name, namespace } = params
  let keyContent = ""
  let certContent = ""
  const output = computeDestination(cert, dest, name)

  try {
    keyContent = (await readFile(key)).toString("base64")
    certContent = (await readFile(cert)).toString("base64")
  } catch(error) {
    if (error.code === "ENOENT") { // Check if ENOENT or anything else
      console.log("Couldn't find file: " + error.path)
    } else {
      console.log(error)
    }
  }

  manifest.data["tls.key"] = keyContent
  manifest.data["tls.crt"] = certContent
  manifest.metadata.name = name || cert
  manifest.metadata.namespace = namespace || "default"

  const parsedManifest = JSON.parse(JSON.stringify(manifest))

  try {
    if (!await pathExists(dirname(output))) {
      await ensureDir(dirname(output))
    }
    await writeFile(output, yaml.safeDump(parsedManifest), "utf8")
  } catch(error) {
    console.log(error, manifest)
  }

}

program
  .version(packagejson.version)

program
  .requiredOption("-k, --key <key file>", "you must specify a TLS key file")
  .requiredOption("-c, --cert <certificate file>", "you must specify a TLS certificate file")
  .option("-d --dest <destination>", "destination for the generated yaml manifest")
  .option("--name <name>", "the name of your certificate")
  .option("--namespace <namespace>", "the namespace for your certificate manifest")

program.parse(process.argv);

cert2secret({
  key: program.key,
  cert: program.cert,
  dest: program.dest,
  name: program.name,
  namespace: program.namespace,
})
