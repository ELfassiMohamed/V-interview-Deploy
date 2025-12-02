package com.patient_service.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Patient Management API",
        version = "1.0.0",
        description = "API de gestion des patients et authentification. " +
                      "Cette API permet l'inscription, la connexion et la gestion des profils patients.",
        license = @License(
            name = "Apache 2.0",
            url = "https://www.apache.org/licenses/LICENSE-2.0"
        )
    ),
    servers = {
        @Server(
            description = "Environnement de développement",
            url = "http://localhost:8080"
        )
    }
)
@SecurityScheme(
    name = "bearer-jwt",
    description = "JWT Authentication - Entrez votre token JWT obtenu après login",
    scheme = "bearer",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
    
    // La configuration est gérée par les annotations ci-dessus
    // Pas besoin de méthodes @Bean supplémentaires avec cette approche
    
}
