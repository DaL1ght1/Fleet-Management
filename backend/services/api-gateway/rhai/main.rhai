fn bearer_token(headers) {
    try {
        let authorization = headers["authorization"];
        if authorization.starts_with("Bearer ") && authorization.len() > 7 {
            return authorization;
        }
    } catch {
    }
    ()
}

fn supergraph_service(service) {
    service.map_request(|request| {
        if bearer_token(request.headers) == () {
            throw #{
                status: 401,
                body: #{ errors: [#{ message: "Authentication required", extensions: #{ code: "UNAUTHENTICATED" } }] }
            };
        }
    });
}
