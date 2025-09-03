package com.example.learnspace.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

// For local dev we just log. Later you can switch to JavaMailSender or a provider.
@Service
@RequiredArgsConstructor
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    public void send(String to, String subject, String body) {
        log.info("DEV EMAIL => to: {}, subject: {}\n{}", to, subject, body);
    }
}
