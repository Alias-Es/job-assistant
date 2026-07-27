package com.jobassistant.backend.application;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, UUID> {
}