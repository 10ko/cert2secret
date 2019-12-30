import { join, resolve } from "path"
import { computeDestination } from "../cert2secret"

describe("computeDestination", () => {
  const defaultCert = "certificate.crt"
  const defaultDest = "/new/dest/"

  it("returns cwd + certname.yaml", () => {
    const output = computeDestination(defaultCert)
    const expected = join(process.cwd(), `${defaultCert}.yaml`)
    expect(output).toEqual(expected)
  })

  it("returns a correct relative path", () => {
    const certPath = "../../test-cert/certificate.crt"
    const output = computeDestination(certPath)
    const resolvedPath = resolve(process.cwd(), certPath)
    const expected = `${resolvedPath}.yaml`
    expect(output).toEqual(expected)
  })

  it("returns destination + certname.yaml when destination doesn't contain yml ext", () => {
    const output = computeDestination(defaultCert, defaultDest)
    const expected = join(defaultDest, `${defaultCert}.yaml`)
    expect(output).toEqual(expected)
  })

  it("returns destination.yaml|yml when destination contains yaml|yml ext", () => {
    const outputYAML = computeDestination(defaultCert, "/new/dest/file.yaml")
    const expectedYAML = "/new/dest/file.yaml"
    expect(outputYAML).toEqual(expectedYAML)

    const outputYML = computeDestination(defaultCert, "/new/dest/file.yaml")
    const expectedYML = "/new/dest/file.yaml"
    expect(outputYML).toEqual(expectedYML)
  })

  it("returns relative destination.yaml|yml when destination contains yaml|yml ext", () => {
    const output = computeDestination(defaultCert, "../new/dest/file.yaml")
    const resolvedPath = resolve(process.cwd(), "../new/dest/file.yaml")
    expect(output).toEqual(resolvedPath)
  })
})
