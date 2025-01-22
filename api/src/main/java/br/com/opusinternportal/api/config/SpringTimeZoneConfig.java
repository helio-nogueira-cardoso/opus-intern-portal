package br.com.opusinternportal.api.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.TimeZone;

@Configuration
public class SpringTimeZoneConfig {
    @Value("${opusinternportal.timezone}")
    String timeZone;

    @PostConstruct
    public void TimeZoneConfig() {
        TimeZone.setDefault(TimeZone.getTimeZone(timeZone));
    }
}
