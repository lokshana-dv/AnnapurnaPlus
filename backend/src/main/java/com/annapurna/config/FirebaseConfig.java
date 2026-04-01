package com.annapurna.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

/**
 * Firebase Configuration
 *
 * Initializes the Firebase Admin SDK on app startup.
 * This allows the backend to verify Firebase JWT tokens
 * sent by the frontend after login.
 *
 * SETUP STEPS:
 * 1. Go to Firebase Console > Project Settings > Service Accounts
 * 2. Click "Generate new private key"
 * 3. Save the JSON file as: src/main/resources/firebase-service-account.json
 */
@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.path}")
    private Resource firebaseConfigResource;

    @PostConstruct
    public void initializeFirebase() {
        try {
            // Only initialize once
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = firebaseConfigResource.getInputStream();

                FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase Admin SDK initialized successfully");
            }
        } catch (IOException e) {
            System.err.println("⚠️  Firebase config file not found. Auth verification disabled.");
            System.err.println("   Place firebase-service-account.json in src/main/resources/");
        }
    }
}
