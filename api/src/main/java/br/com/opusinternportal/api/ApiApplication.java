package br.com.opusinternportal.api;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiApplication {

	public static void main(String[] args) {
		loadEnvironmentVariables();
		SpringApplication.run(ApiApplication.class, args);
	}

	public static void loadEnvironmentVariables () {
		Dotenv dotenv = Dotenv.configure()
				.filename(".env")
				.load();
		dotenv.entries().forEach(entry -> {
			System.setProperty(entry.getKey(), entry.getValue());
			System.out.println("Loaded: " + entry.getKey() + " = " + entry.getValue());
		});
	}

}
