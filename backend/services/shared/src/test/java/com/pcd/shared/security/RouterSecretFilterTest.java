package com.pcd.shared.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

import static org.assertj.core.api.Assertions.assertThat;

class RouterSecretFilterTest {

    private static final String SECRET = "router-secret";

    private final RouterSecretFilter filter = new RouterSecretFilter(
            SECRET, PathPatternRequestMatcher.withDefaults().matcher("/graphql/**"));

    @Test
    void passesGraphQlRequestsCarryingTheRouterSecret() throws Exception {
        MockHttpServletRequest request = graphqlRequest();
        request.addHeader(RouterSecretFilter.HEADER_NAME, SECRET);
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertThat(chain.getRequest()).isSameAs(request);
    }

    @Test
    void rejectsGraphQlRequestsWithoutTheRouterSecret() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(graphqlRequest(), response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void rejectsGraphQlRequestsWithAWrongRouterSecret() throws Exception {
        MockHttpServletRequest request = graphqlRequest();
        request.addHeader(RouterSecretFilter.HEADER_NAME, "wrong");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(401);
    }

    @Test
    void ignoresRequestsOutsideTheProtectedPaths() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/auth/login");
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertThat(chain.getRequest()).isSameAs(request);
    }

    private static MockHttpServletRequest graphqlRequest() {
        return new MockHttpServletRequest("POST", "/graphql");
    }
}
