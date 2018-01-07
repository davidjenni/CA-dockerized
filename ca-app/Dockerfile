FROM alpine
RUN apk update && apk add --no-cache openssl
WORKDIR /ca-app
RUN mkdir -p certs db /secrets/rootCA /secrets/subCA
COPY config/* config/
VOLUME [ "/ca-app/certs", "/ca-app/db", "/secrets/rootCA", "/secrets/subCA" ]

