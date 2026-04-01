package com.annapurna;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ANNAPURNA+ - Smart Food Rescue Platform
 * Main entry point for the Spring Boot application.
 */
@SpringBootApplication
public class AnnapurnaApplication {
    public static void main(String[] args) {
        SpringApplication.run(AnnapurnaApplication.class, args);
        System.out.println("===========================================");
        System.out.println("  ANNAPURNA+ Backend Started on port 8080");
        System.out.println("  Not just donating food — intelligently saving it.");
        System.out.println("===========================================");
    }
}
