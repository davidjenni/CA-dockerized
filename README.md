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
/certs/public           public certificates of root and sub CAs
/certs/db/              certificate database, CRL and CA production files
/certs/root-secrets     private keys for root CA
/certs/sub-secrets      private keys for sub CA

## Container
build:
```
docker build . -t ca-dockerized
```

run interactively:
```
docker run --rm -it -v d:\Prj\ca-dockerized\locCerts:/certs ca-dockerized ash
```

## References:
[Bulletproof SSL and TLS](https://www.feistyduck.com/books/bulletproof-ssl-and-tls/)
[ivanr/bulletproof-tls](https://github.com/ivanr/bulletproof-tls/tree/master/private-ca)

