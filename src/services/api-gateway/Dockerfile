FROM ghcr.io/apollographql/router:v1.49.0

COPY src/services/api-gateway/router.yaml /etc/router/router.yaml
COPY src/services/api-gateway/supergraph.graphql /etc/router/supergraph.graphql

ENTRYPOINT ["./router", "--config", "/etc/router/router.yaml"]
