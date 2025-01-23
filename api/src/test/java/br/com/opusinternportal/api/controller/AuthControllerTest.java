package br.com.opusinternportal.api.controller;

import br.com.opusinternportal.api.util.EnvironmentVariablesLoader;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Transactional
@Rollback
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @BeforeAll
    static void setUp() throws Exception {
        EnvironmentVariablesLoader.loadEnvironmentVariables();
    }

    @Test
    @DisplayName("Registration of an intern with correct email format and extension show return successful message")
    void registerTestScenario1() throws Exception {
        String registerRequestJson = """
                {
                    "email": "user@opus-software.com.br",
                    "password": "password",
                    "role": "INTERN"
                }
        """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequestJson))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {
                            "message": "User registered successfully!"
                        }
                """));
    }


    @Test
    @DisplayName("Registration of mentor with correct email format and extension show return successful message")
    void registerTestScenario2() throws Exception {
        String registerRequestJson = """
                {
                    "email": "user@opus-software.com.br",
                    "password": "password",
                    "role": "MENTOR"
                }
        """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequestJson))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {
                            "message": "User registered successfully!"
                        }
                """));
    }

    @Test
    @DisplayName("Registration of an Administrator should not be allowed")
    void registerTestScenario3() throws Exception {
        String registerRequestJson = """
                {
                    "email": "user@opus-software.com.br",
                    "password": "password",
                    "role": "ADMIN"
                }
        """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequestJson))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {
                        	"message": "Cannot register as an administrator!"
                        }
                """));
    }
}