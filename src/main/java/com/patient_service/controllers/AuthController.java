package com.patient_service.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.patient_service.dto.AuthRequest;
import com.patient_service.dto.AuthResponse;
import com.patient_service.dto.PatientProfileDTO;
import com.patient_service.dto.ProfileStatusResponse;
import com.patient_service.dto.RegisterRequest;
import com.patient_service.models.AccountStatus;
import com.patient_service.models.Patient;
import com.patient_service.services.JwtService;
import com.patient_service.services.PatientService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Authentication", description = "APIs d'authentification et gestion de profil patient")
public class AuthController {
    
    @Autowired
    private PatientService patientService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    
    @Operation(
        summary = "Inscription d'un nouveau patient",
        description = "Permet à un nouveau patient de créer un compte. Le compte sera en attente d'approbation par un fournisseur."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Inscription réussie",
            content = @Content(schema = @Schema(implementation = AuthResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Données invalides ou erreur lors de l'inscription",
            content = @Content(schema = @Schema(implementation = AuthResponse.class))
        )
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            Patient patient = patientService.registerPatient(request.getEmail(), request.getPassword(), request);
            String token = jwtService.generateToken(patient);
            
            AuthResponse response = new AuthResponse(
                token, 
                "Registration successful. Your account is pending provider approval.", 
                patient.getEmail(),
                patient.getAccountStatus(),
                patientService.canAccessMedicalHistory(patient),
                patient.getRole().getAuthority()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, "Registration failed: " + e.getMessage(), null));
        }
    }
    
    
    @Operation(
        summary = "Connexion d'un patient",
        description = "Authentifie un patient avec son email et mot de passe et retourne un token JWT"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Connexion réussie",
            content = @Content(schema = @Schema(implementation = AuthResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Identifiants invalides",
            content = @Content(schema = @Schema(implementation = AuthResponse.class))
        )
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            Patient patient = (Patient) authentication.getPrincipal();
            String token = jwtService.generateToken(patient);
            
            String message = patient.getAccountStatus() == AccountStatus.ACTIVE 
                ? "Login successful" 
                : "Login successful. " + patient.getAccountStatus().getDescription();
            
            AuthResponse response = new AuthResponse(
                token, 
                message, 
                patient.getEmail(),
                patient.getAccountStatus(),
                patientService.canAccessMedicalHistory(patient),
                patient.getRole().getAuthority()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, "Invalid credentials", null));
        }
    }
    
    
    @Operation(
        summary = "Obtenir le statut du profil patient",
        description = "Récupère les informations sur le statut du profil du patient connecté",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Statut récupéré avec succès",
            content = @Content(schema = @Schema(implementation = ProfileStatusResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Erreur lors de la récupération du statut"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Non authentifié"
        )
    })
    @GetMapping("/profile-status")
    public ResponseEntity<ProfileStatusResponse> getProfileStatus(
            @Parameter(hidden = true) Authentication authentication) {
        try {
            Patient patient = (Patient) authentication.getPrincipal();
            ProfileStatusResponse status = patientService.getProfileStatus(patient.getId());
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    
    @Operation(
        summary = "Obtenir le profil complet du patient",
        description = "Récupère toutes les informations du profil du patient connecté",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Profil récupéré avec succès",
            content = @Content(schema = @Schema(implementation = PatientProfileDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Erreur lors de la récupération du profil"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Non authentifié"
        )
    })
    @GetMapping("/profile")
    public ResponseEntity<PatientProfileDTO> getProfile(
            @Parameter(hidden = true) Authentication authentication) {
        try {
            Patient patient = (Patient) authentication.getPrincipal();
            patient = patientService.findById(patient.getId());
            
            PatientProfileDTO profileDTO = convertToProfileDTO(patient);
            return ResponseEntity.ok(profileDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    
    @Operation(
        summary = "Compléter/Mettre à jour le profil patient",
        description = "Permet au patient de compléter ou modifier ses informations personnelles",
        security = @SecurityRequirement(name = "bearer-jwt")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Profil mis à jour avec succès",
            content = @Content(schema = @Schema(implementation = PatientProfileDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Données invalides ou erreur lors de la mise à jour"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Non authentifié"
        )
    })
    @PutMapping("/complete-profile")
    public ResponseEntity<PatientProfileDTO> updateProfile(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Informations du profil à mettre à jour",
                required = true,
                content = @Content(schema = @Schema(implementation = Patient.class))
            )
            @RequestBody Patient profileUpdates,
            @Parameter(hidden = true) Authentication authentication) {
        try {
            Patient currentPatient = (Patient) authentication.getPrincipal();
            
            Patient updatedPatient = patientService.updatePatientProfile(currentPatient.getId(), profileUpdates);
            PatientProfileDTO profileDTO = convertToProfileDTO(updatedPatient);
            
            return ResponseEntity.ok(profileDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    
    private PatientProfileDTO convertToProfileDTO(Patient patient) {
        PatientProfileDTO dto = new PatientProfileDTO();
        dto.setId(patient.getId());
        dto.setEmail(patient.getEmail());
        dto.setAccountStatus(patient.getAccountStatus());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setPhone(patient.getPhone());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setGender(patient.getGender());
        dto.setAddress(patient.getAddress());
        dto.setCity(patient.getCity());
        dto.setState(patient.getState());
        dto.setZipCode(patient.getZipCode());
        dto.setCountry(patient.getCountry());
        dto.setCreatedAt(patient.getCreatedAt());
        dto.setUpdatedAt(patient.getUpdatedAt());
        return dto;
    }
}
