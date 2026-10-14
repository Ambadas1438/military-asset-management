package com.military.assets.controller;
import com.military.assets.dto.LoginRequest;
import com.military.assets.dto.LoginResponse;
import com.military.assets.dto.UserDto;
import com.military.assets.model.Base;
import com.military.assets.model.User;
import com.military.assets.repository.BaseRepository;
import com.military.assets.repository.UserRepository;
import com.military.assets.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private BaseRepository baseRepository;
    @Autowired private AuditService auditService;

    @GetMapping("/me")
    public ResponseEntity<?> getMe(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        UserDto dto = toDto(user);
        Map<String, Object> capabilities = buildCapabilities(user);
        return ResponseEntity.ok(Map.of("user", dto, "capabilities", capabilities));
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        List<UserDto> users = userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity.status(400).body(Map.of("error", "Email is required"));
        }
        User user = userRepository.findByEmailIgnoreCase(req.getEmail().trim())
            .orElseGet(() -> userRepository.findByUsernameIgnoreCase(req.getEmail().trim()).orElse(null));
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Invalid credentials",
                "message", "No account found. Please register or use a demo account."
            ));
        }
        String token = "mil-jwt-" + user.getId() + "-" + System.currentTimeMillis();
        auditService.log(user, "USER_LOGIN", "User", user.getId(), "{\"action\":\"login\"}", request.getRemoteAddr());
        return ResponseEntity.ok(new LoginResponse(token, toDto(user)));
    }

    // ── Quick login by userId (for demo quick-login buttons) ──
    @PostMapping("/quick-login")
    public ResponseEntity<?> quickLogin(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String userId = body.get("userId");
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(400).body(Map.of("error", "userId is required"));
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }
        String token = "mil-jwt-" + user.getId() + "-" + System.currentTimeMillis();
        auditService.log(user, "USER_LOGIN", "User", user.getId(), "{\"action\":\"quick-login\"}", request.getRemoteAddr());
        return ResponseEntity.ok(new LoginResponse(token, toDto(user)));
    }

    // ── Register / Signup new user ─────────────────────────────
    @PostMapping({"/register", "/signup"})
    public ResponseEntity<?> register(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String name     = body.get("name");
        String email    = body.get("email");
        String username = body.get("username");
        String role     = body.get("role");
        String rank     = body.get("rank");
        String baseId   = body.get("baseId");

        if (name == null || email == null || username == null) {
            return ResponseEntity.status(400).body(Map.of("error", "name, email and username are required"));
        }

        // Check duplicate email/username
        if (userRepository.findByEmailIgnoreCase(email.trim()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("error", "Email already registered"));
        }
        if (userRepository.findByUsernameIgnoreCase(username.trim()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("error", "Username already taken"));
        }

        // Validate role
        List<String> validRoles = List.of("admin", "commander", "logistics");
        String finalRole = (role != null && validRoles.contains(role.toLowerCase())) ? role.toLowerCase() : "logistics";

        // Find base if provided
        Base base = null;
        if (baseId != null && !baseId.isBlank()) {
            base = baseRepository.findById(baseId).orElse(null);
        }

        User user = new User();
        user.setId("user-" + UUID.randomUUID().toString().substring(0, 8));
        user.setName(name.trim());
        user.setEmail(email.trim().toLowerCase());
        user.setUsername(username.trim().toLowerCase());
        user.setRole(finalRole);
        user.setRank(rank != null ? rank.trim() : "Civilian");
        user.setServiceNumber("SN-NEW-" + System.currentTimeMillis() % 100000);
        user.setBase(base);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        String token = "mil-jwt-" + user.getId() + "-" + System.currentTimeMillis();
        auditService.log(user, "USER_REGISTER", "User", user.getId(), "{\"action\":\"register\"}", request.getRemoteAddr());

        return ResponseEntity.status(201).body(new LoginResponse(token, toDto(user)));
    }

    private UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        if (user.getBase() != null) {
            dto.setBaseId(user.getBase().getId());
            dto.setBaseName(user.getBase().getName());
        }
        dto.setRank(user.getRank());
        dto.setServiceNumber(user.getServiceNumber());
        dto.setAvatar(user.getAvatar());
        return dto;
    }

    private Map<String, Object> buildCapabilities(User user) {
        boolean isAdmin = "admin".equals(user.getRole());
        boolean isCommander = "commander".equals(user.getRole());
        boolean isLogistics = "logistics".equals(user.getRole());
        return Map.of(
            "canViewAllBases", isAdmin,
            "canManagePurchases", isAdmin || isLogistics,
            "canInitiateTransfers", isAdmin || isLogistics || isCommander,
            "canManageAssignments", isAdmin || isLogistics || isCommander,
            "canViewAuditLogs", isAdmin,
            "baseId", user.getBase() != null ? user.getBase().getId() : ""
        );
    }
}
