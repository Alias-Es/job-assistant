package com.jobassistant.backend.application;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.jobassistant.backend.application.dto.CreateJobApplicationRequest;
import com.jobassistant.backend.application.dto.JobApplicationResponse;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(JobApplicationController.class)
class JobApplicationControllerTest {

    private final MockMvc mockMvc;

    @MockitoBean
    private JobApplicationService service;

    @Autowired
    JobApplicationControllerTest(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    void shouldRejectInvalidApplication() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .contentType("application/json")
                        .content("""
                                {
                                  "title": "",
                                  "company": "",
                                  "offerUrl": "",
                                  "status": "",
                                  "appliedAt": null
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
    @Test
void shouldRejectInvalidStatus() throws Exception {
    mockMvc.perform(post("/api/applications")
                    .contentType("application/json")
                    .content("""
                            {
                              "title": "Développeur Java",
                              "company": "Orange",
                              "offerUrl": "https://example.com/jobs/java",
                              "status": "BONJOUR",
                              "appliedAt": "2026-07-27T15:00:00+02:00"
                            }
                            """))
            .andExpect(status().isBadRequest());
}
    @Test
    void shouldCreateValidApplication() throws Exception {
        UUID id = UUID.fromString(
                "550e8400-e29b-41d4-a716-446655440000"
        );

        OffsetDateTime appliedAt =
                OffsetDateTime.parse("2026-07-27T15:00:00+02:00");

        JobApplicationResponse response = new JobApplicationResponse(
                id,
                "Développeur Java",
                "Orange",
                "https://example.com/jobs/java",
                JobApplicationStatus.APPLIED,
                appliedAt,
                appliedAt,
                appliedAt
        );

        when(service.create(any(CreateJobApplicationRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/applications")
                        .contentType("application/json")
                        .content("""
                                {
                                  "title": "Développeur Java",
                                  "company": "Orange",
                                  "offerUrl": "https://example.com/jobs/java",
                                  "status": "APPLIED",
                                  "appliedAt": "2026-07-27T15:00:00+02:00"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Développeur Java"))
                .andExpect(jsonPath("$.company").value("Orange"))
                .andExpect(jsonPath("$.status").value("APPLIED"));
    }
}