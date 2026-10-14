package com.military.assets.dto;

import com.military.assets.model.User;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private UserDto user;
}
