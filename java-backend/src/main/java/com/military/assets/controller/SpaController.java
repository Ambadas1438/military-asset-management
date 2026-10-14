package com.military.assets.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Fallback controller: any request that is NOT under /api and NOT a static
 * asset is forwarded to index.html so React Router handles navigation.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
            "/",
            "/dashboard",
            "/purchases",
            "/transfers",
            "/assignments",
            "/audit",
            "/login"
    })
    public String forward() {
        return "forward:/index.html";
    }

    // Catch-all for any other non-API path
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String forwardAll() {
        return "forward:/index.html";
    }
}
