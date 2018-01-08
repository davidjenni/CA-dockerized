FROM alpine
RUN apk update && apk add --no-cache \
    nodejs \
    openssl

WORKDIR /ca-app
COPY . /ca-app/
RUN npm install

RUN mkdir -p certs db
RUN mkdir -p        /secrets/rootCA /secrets/subCA \
    && chmod 700    /secrets/rootCA /secrets/subCA
VOLUME [ "/ca-app/certs", "/ca-app/db", "/secrets/rootCA", "/secrets/subCA" ]

# ENTRYPOINT [ "node", "." ]
CMD [ "-help" ]
