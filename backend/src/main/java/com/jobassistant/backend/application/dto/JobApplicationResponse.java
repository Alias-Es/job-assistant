package com.jobassistant.backend.application.dto;

import java.time.OffsetDateTime;
import com.jobassistant.backend.application.JobApplicationStatus;
import java.util.UUID;

import com.jobassistant.backend.application.JobApplication;

public record JobApplicationResponse(
        UUID id,
        String title,
        String company,
        String offerUrl,
        JobApplicationStatus status,
        OffsetDateTime appliedAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    public static JobApplicationResponse from(JobApplication application) {
        return new JobApplicationResponse(
                application.getId(),
                application.getTitle(),
                application.getCompany(),
                application.getOfferUrl(),
                application.getStatus(),
                application.getAppliedAt(),
                application.getCreatedAt(),
                application.getUpdatedAt()
        );
    }
}