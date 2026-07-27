package com.jobassistant.backend.application;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.jobassistant.backend.application.dto.CreateJobApplicationRequest;
import com.jobassistant.backend.application.dto.JobApplicationResponse;

@Service
public class JobApplicationService {

    private final JobApplicationRepository repository;

    public JobApplicationService(JobApplicationRepository repository) {
        this.repository = repository;
    }

    public List<JobApplicationResponse> findAll() {
        List<JobApplicationResponse> responses = new ArrayList<>();

        for (JobApplication application : repository.findAll()) {
            responses.add(JobApplicationResponse.from(application));
        }

        return responses;
    }

    public JobApplicationResponse create(CreateJobApplicationRequest request) {
        JobApplication application = JobApplication.create(
                request.title(),
                request.company(),
                request.offerUrl(),
                request.status(),
                request.appliedAt()
        );

        JobApplication savedApplication = repository.save(application);

        return JobApplicationResponse.from(savedApplication);
    }
}