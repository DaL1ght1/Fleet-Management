FROM ghcr.io/apollographql/router:v1.49.0

COPY router.yaml /etc/router/router.yaml
COPY supergraph.graphql /etc/router/supergraph.graphql

ENTRYPOINT ["./router", "--config", "/etc/router/router.yaml"]
