package br.com.opusinternportal.api.util;

import io.github.cdimascio.dotenv.Dotenv;

public class EnvironmentVariablesLoader {
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
