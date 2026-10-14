package com.military.assets.middleware;

import com.military.assets.model.User;
import com.military.assets.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class UserContextFilter extends OncePerRequestFilter {

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String userId = request.getHeader("x-user-id");
        if (userId != null && !userId.isBlank()) {
            userRepository.findById(userId).ifPresent(user -> request.setAttribute("currentUser", user));
        }
        filterChain.doFilter(request, response);
    }
}
