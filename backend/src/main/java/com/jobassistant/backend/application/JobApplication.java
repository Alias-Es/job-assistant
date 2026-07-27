package com.jobassistant.backend.application;

import java.time.OffsetDateTime;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    private UUID id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 150)
    private String company;

    @Column(name = "offer_url", nullable = false)
    private String offerUrl;

    @Enumerated(EnumType.STRING)
@Column(nullable = false, length = 30)
private JobApplicationStatus status;

    @Column(name = "applied_at", nullable = false)
    private OffsetDateTime appliedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected JobApplication() {
    }

    public static JobApplication create(
        String title,
        String company,
        String offerUrl,
        JobApplicationStatus status,
        OffsetDateTime appliedAt
) {
    OffsetDateTime now = OffsetDateTime.now();

    JobApplication application = new JobApplication();

    application.id = UUID.randomUUID();
    application.title = title;
    application.company = company;
    application.offerUrl = offerUrl;
    application.status = status;
    application.appliedAt = appliedAt;
    application.createdAt = now;
    application.updatedAt = now;

    return application;
}

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getCompany() {
        return company;
    }

    public String getOfferUrl() {
        return offerUrl;
    }

    public JobApplicationStatus getStatus() {
        return status;
    }

    public OffsetDateTime getAppliedAt() {
        return appliedAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}