package com.military.assets.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private String id;
    private String username;
    private String name;
    private String email;
    private String role;
    private String baseId;
    private String baseName;
    private String rank;
    private String serviceNumber;
    private String avatar;
}
