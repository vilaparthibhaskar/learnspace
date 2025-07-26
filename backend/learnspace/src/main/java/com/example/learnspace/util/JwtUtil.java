package com.example.learnspace.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET = "bXlfc2VjcmV0X2tleV9mb3Jfand0bXlfc2VjcmV0X2tleV9mb3Jfand0bXlfc2VjcmV0X2tleV9mb3Jfand0bXlfc2VjcmV0X2tleV9mb3Jfand0bXlfc2VjcmV0X2tleV9mb3Jfand0bXlfc2VjcmV0X2tleV9mb3Jfand0bXlfc2VjcmV0X2tleV9mb3Jfand0bXlfc2VjcmV0X2tleV9mb3Jfand0";

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
