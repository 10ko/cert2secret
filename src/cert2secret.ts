import { readFile, ensureDir, writeFile, pathExists } from "fs-extra"
import yaml from "js-yaml"
import { join, dirname, resolve } from "path"

export interface Cert2SecretParams {
  key: string
  cert: string
  dest?: string
  name?: string
  namespace?: string
}

export const secretManifest = {
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
  },
}

export const computeDestination = (
  cert: string,
  dest?: string,
  name?: string
): string => {
  let output = process.cwd()
  if (dest) {
    output = resolve(process.cwd(), dest)
  }
  if (!dest?.endsWith(".yaml") && !dest?.endsWith(".yml")) {
    output = name ? join(output, `${name}.yaml`) : join(output, `${cert}.yaml`)
  }
  return output
}

export default async function cert2secret(params: Cert2SecretParams) {
  const { key, cert, dest, name, namespace } = params
  let keyContent = ""
  let certContent = ""
  const output = computeDestination(cert, dest, name)

  try {
    keyContent = (await readFile(key)).toString("base64")
    certContent = (await readFile(cert)).toString("base64")
  } catch (error) {
    if (error.code === "ENOENT") {
      // Check if ENOENT or anything else
      console.log("Couldn't find file: " + error.path)
    } else {
      console.log(error)
    }
    process.exit(1)
  }

  secretManifest.data["tls.key"] = keyContent
  secretManifest.data["tls.crt"] = certContent
  secretManifest.metadata.name = name || cert
  secretManifest.metadata.namespace = namespace || "default"

  const parsedManifest = JSON.parse(JSON.stringify(secretManifest))

  try {
    if (!(await pathExists(dirname(output)))) {
      await ensureDir(dirname(output))
    }
    await writeFile(output, yaml.safeDump(parsedManifest), "utf8")

  } catch (error) {
    console.log(error, secretManifest)
  }
}
