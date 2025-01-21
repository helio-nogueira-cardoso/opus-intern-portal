package br.com.opusinternportal.api.config;

import br.com.opusinternportal.api.entity.PortalUser;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenProvider {
    @Value("${opusinternportal.security.secret}")
    private String secretKey;

    @Value("${opusinternportal.security.issuer}")
    private String issuer;

    @Value("${opusinternportal.security.expiration}")
    private Long expirationTime;

    public String generateToken(UserDetails userDetails) {
        Algorithm algorithm = Algorithm.HMAC256(secretKey);

        Date issuedAtDate = new Date();
        Date expiresAtDate = new Date(System.currentTimeMillis() + expirationTime);
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElseThrow(() -> new IllegalStateException("User has no roles assigned"));

        return buildToken(userDetails.getUsername(), issuedAtDate, expiresAtDate, role, algorithm);
    }

    private String buildToken(String subject, Date issuedAt, Date expiresAt, String role, Algorithm algorithm) {
        return JWT.create()
                .withSubject(subject)
                .withIssuedAt(issuedAt)
                .withExpiresAt(expiresAt)
                .withClaim("role", role)
                .sign(algorithm);
    }

    public boolean validateToken(String token, PortalUser portalUser) {
        try {
            String username = extractEmail(token);
            return username.equals(portalUser.getEmail()) && !isTokenExpired(token);
        } catch (JWTVerificationException e) {
            return false;
        }
    }

    public String extractEmail(String tokenJWT) {
        try {
            var algorithm = Algorithm.HMAC256(secretKey);
            return JWT.require(algorithm)
                    .withIssuer(issuer)
                    .build()
                    .verify(tokenJWT)
                    .getSubject();
        } catch (JWTVerificationException exception){
            throw new RuntimeException("Error while validating JWT token");
        }
    }
    
    private boolean isTokenExpired(String tokenJWT) {
        return JWT.require(Algorithm.HMAC256(secretKey))
                .build()
                .verify(tokenJWT)
                .getExpiresAt()
                .before(new Date());
    }
}
