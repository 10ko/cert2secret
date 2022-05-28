import { readFile, ensureDir, writeFile, pathExists } from "fs-extra"
import yaml from "js-yaml"
import chalk from "chalk"
import { join, dirname, resolve } from "path"

export interface Cert2SecretParams {
  key: string
  cert: string
  dest?: string
  secretName?: string
  namespace?: string
}

export const determineDestination = (
  cert: string,
  dest?: string,
  secretName?: string
): string => {
  let output = process.cwd()
  if (dest) {
    output = resolve(process.cwd(), dest)
  }
  if (!dest?.endsWith(".yaml") && !dest?.endsWith(".yml")) {
    output = secretName
      ? join(output, `${secretName}.yaml`)
      : join(output, `${cert}.yaml`)
  }
  return output
}

export interface GenerateManifestParams {
  keyData: string
  crtData: string
  name: string
  namespace?: string
}

export const generateSecretManifest = (params: GenerateManifestParams) => {
  const { keyData, crtData, name, namespace } = params
  return {
    apiVersion: "v1",
    kind: "Secret",
    type: "kubernetes.io/tls",
    metadata: {
      name,
      namespace: namespace || "default",
    },
    data: {
      "tls.crt": crtData,
      "tls.key": keyData,
    },
  }
}

export default async function cert2secret(params: Cert2SecretParams) {
  const { key, cert, dest, secretName, namespace } = params
  let keyData = ""
  let crtData = ""
  const output = determineDestination(cert, dest, secretName)

  try {
    keyData = (await readFile(key)).toString("base64")
    crtData = (await readFile(cert)).toString("base64")
  } catch (error) {
    if (error.code === "ENOENT") {
      // Check if ENOENT or anything else
      console.log(chalk.red("Couldn't find file: " + error.path))
    } else {
      console.log(chalk.red(error))
    }
    process.exit(1)
  }

  const secretManifest = generateSecretManifest({
    keyData,
    crtData,
    name: secretName || cert,
    namespace,
  })

  const parsedManifest = JSON.parse(JSON.stringify(secretManifest))

  try {
    if (!(await pathExists(dirname(output)))) {
      await /* TODO: JSFIX could not patch the breaking change:
      Creating a directory with fs-extra no longer returns the path 
      Suggested fix: The returned promise no longer includes the path of the new directory */
      ensureDir(dirname(output))
    }
    await writeFile(output, yaml.safeDump(parsedManifest), "utf8")
    console.log(chalk.green(`Success: please find your manifest at ${output}`))
  } catch (error) {
    console.log(error, secretManifest)
  }
}
