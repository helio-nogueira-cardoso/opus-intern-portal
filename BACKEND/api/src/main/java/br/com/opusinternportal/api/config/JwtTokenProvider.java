package br.com.opusinternportal.api.config;

import br.com.opusinternportal.api.entity.PortalUser;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;

@Component
public class JwtTokenProvider {
    @Value("${opusinternportal.security.secret}")
    private String secretKey;

    @Value("${opusinternportal.security.issuer}")
    private String issuer;

    @Value("${opusinternportal.security.token-expiration-time-in-minutes}")
    private Long expirationTimeInMinutes;

    public String generateToken(PortalUser user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            return JWT.create()
                    .withIssuer(issuer)
                    .withSubject(user.getUsername())
                    .withExpiresAt(expirationDate())
                    .sign(algorithm);
        } catch (JWTCreationException exception){
            throw new RuntimeException("Error while generating JWT token");
        }
    }

    public String getSubject(String tokenJWT) {
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

    private Instant expirationDate() {
        return LocalDateTime.now(ZoneOffset.systemDefault())
                .plusMinutes(expirationTimeInMinutes)
                .toInstant(ZoneOffset.systemDefault().getRules().getOffset(LocalDateTime.now()));
    }

    public boolean tokenIsValid(String tokenJWT, PortalUser user) {
        try {
            var decodedJWT = JWT.decode(tokenJWT);
            return decodedJWT.getSubject().equals(user.getUsername()) &&
                    decodedJWT.getExpiresAt().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
