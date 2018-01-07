FROM alpine
RUN apk update && apk add --no-cache openssl
RUN mkdir -p /certs/public /certs/db /certs/root-secrets /certs/sub-secrets
VOLUME [ "/certs/public", "/certs/db", "/certs/root-secrets", "/certs/sub-secrets" ]

