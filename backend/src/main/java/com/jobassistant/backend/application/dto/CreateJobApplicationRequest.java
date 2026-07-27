package com.jobassistant.backend.application.dto;

import java.time.OffsetDateTime;
import com.jobassistant.backend.application.JobApplicationStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateJobApplicationRequest(

        @NotBlank
        @Size(max = 150)
        String title,

        @NotBlank
        @Size(max = 150)
        String company,

        @NotBlank
        String offerUrl,

        @NotNull
JobApplicationStatus status,

        @NotNull
        OffsetDateTime appliedAt
) {
}