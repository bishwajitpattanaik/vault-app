package com.substring.chat.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "✅ Live");
        response.put("app", "Vault Chat API");
        response.put("version", "1.0.0");
        response.put("message", "Miles apart. Milliseconds away.");

        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("rooms", "/api/rooms");
        endpoints.put("messages", "/api/messages/{roomId}");
        endpoints.put("websocket", "/ws");
        response.put("endpoints", endpoints);

        return ResponseEntity.ok(response);
    }
}