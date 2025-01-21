package br.com.opusinternportal.api.config;

import br.com.opusinternportal.api.entity.PortalUser;
import br.com.opusinternportal.api.repository.PortalUserRepository;
import com.auth0.jwt.exceptions.JWTVerificationException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PortalUserRepository portalUserRepository;

    @Override
    /**
     * First filter responsible for ensuring that there is a valid JWT token in the request.
     * If a valid token is found, it configures authentication in the Spring Security Context.
     * Otherwise, it simply passes the request to the next filters, which may handle authentication differently.
     */
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Extract token from Authorization header
        String tokenJWT = extractToken(request);

        if (tokenJWT != null) {
            try {
                // Extract user email from JWT token (email acts as username)
                String email = jwtTokenProvider.extractEmail(tokenJWT);

                // Load user details from Database
                PortalUser portalUser = portalUserRepository.findByEmail(email).orElseThrow(
                        () -> new RuntimeException("User not found with email: " + email)
                );

                // Verify whether the token is valid for the user
                if (jwtTokenProvider.validateToken(tokenJWT, portalUser)) {
                    var authentication = new UsernamePasswordAuthenticationToken(portalUser,null, portalUser.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (JWTVerificationException e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT token");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }

        return null;
    }
}
