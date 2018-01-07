# CA-Dockerized
Creates and runs a private Certificate Authority with a sub (intermediate) CA inside a docker container.
Use the sub-CA to create actual TLS certificates, either for server or client authentication.
The CA file artifacts (its database, public certs and private keys) are stored in docker volumes with different volume mounts
(e.g. private keys cans be stored on a separate USB key that can be locked away).

## CA Operations
- init:     initialize the root-CA
- new-sub:  create a new sub-CA
- serverCert:   create a new server certificate, signed by sub-CA
- clientCert:   create a new client certificate, signed by sub-CA

## File and Volume Layout
- /ca-app/certs         public certificates of root and sub CAs
- /ca-app/db/           certificate database, CRL and CA production files
- /secrets/rootCA       private keys for root CA
- /secrets/subCA        private keys for sub CAs

## Container
build:
```
docker build ca-app -t ca-dockerized
```

run interactively:
```
docker run --rm -it -v d:\Prj\ca-dockerized\loc\certs:/ca-app/certs -v ca-db:/ca-app/db ca-dockerized ash
```

## References:
- [Bulletproof SSL and TLS](https://www.feistyduck.com/books/bulletproof-ssl-and-tls/)
- [ivanr/bulletproof-tls](https://github.com/ivanr/bulletproof-tls/tree/master/private-ca)

