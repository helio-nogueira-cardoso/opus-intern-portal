package br.com.opusinternportal.api;

import br.com.opusinternportal.api.util.EnvironmentVariablesLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
public class ApiApplication {

	public static void main(String[] args) {
		EnvironmentVariablesLoader.loadEnvironmentVariables();
		SpringApplication.run(ApiApplication.class, args);
	}
}
