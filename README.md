# cert2secret

Easily generate a Kubernetes TLS secret manifest from a TLS key/certificate pair.

## Installation

```sh
$ npm install -g cert2secret
```

## Usage

```sh
Usage: cert2secret [options]

Options:
  -V, --version                  output the version number
  -k, --key <key file>           You must specify a TLS key file
  -c, --cert <certificate file>  You must specify a TLS certificate file
  -d --dest <destination>        Destination for the generated yaml manifest
  --name <name>                  The name of your certificate
  --namespace <namespace>        The namespace for your certificate manifest
  -h, --help                     output usage information
```
### Example
```sh
$ cert2secret -k your-certificate.key -c your-certificate.crt -d ./certificate-manifest.yaml
```
The command above will generate a file called `certificate-manifest.yml` with the following content:

```yaml
apiVersion: v1
kind: Secret
type: kubernetes.io/tls
metadata:
  namespace: default
data:
  tls.crt: >-
    ...base64 encoded certificate data
  tls.key: >-
    ...base64 encoded key data
```
