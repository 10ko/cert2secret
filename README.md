# cert2secret

Generate a Kubernetes TLS secret manifest from a TLS key/certificate pair.

**Use case:** you want to [secure an Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/#tls) specifying a secret containing the TLS key/cert pair.

> NOTE: If your goal it's just to create a tls secret in a cluster you can use `kubectl` instead.

```sh
kubectl create secret tls ${CERT_NAME} --key ${KEY_FILE} --cert ${CERT_FILE}
```

## Installation

```sh
npm install -g cert2secret
```

## Usage

```sh
Usage: cert2secret [options]

Options:
  -V, --version                  output the version number
  -k, --key <key file>           you must specify a TLS key file
  -c, --cert <certificate file>  you must specify a TLS certificate file
  -d --dest <destination>        destination for the generated yaml manifest
  --secretname <secretname>      the name of your certificate used in the secret metadata
  --namespace <namespace>        the namespace for your certificate manifest
  -h, --help                     output usage information
```

### Example

```sh
cert2secret -k your-certificate.key -c your-certificate.crt -d ./certificate-manifest.yaml
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
