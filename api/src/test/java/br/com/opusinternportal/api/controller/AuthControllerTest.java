package br.com.opusinternportal.api.controller;

import br.com.opusinternportal.api.dto.GenericMessage;
import br.com.opusinternportal.api.dto.RegisterRequest;
import br.com.opusinternportal.api.entity.PortalUser;
import br.com.opusinternportal.api.entity.Role;
import br.com.opusinternportal.api.repository.PortalUserRepository;
import br.com.opusinternportal.api.util.EnvironmentVariablesLoader;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.json.AutoConfigureJsonTesters;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureJsonTesters
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JacksonTester<RegisterRequest> registerRequestJson;

    @Autowired
    private JacksonTester<GenericMessage> genericMessageJson;

    @Value("${opusinternportal.email-domain}")
    String emailDomain;

    @BeforeAll
    static void setUp() throws Exception {
        EnvironmentVariablesLoader.loadEnvironmentVariables();
    }

    @MockitoBean
    private Optional<PortalUser> portalUserOptional;

    @MockitoBean
    private PortalUserRepository portalUserRepository;

    @Test
    @DisplayName("Registration of an intern with correct email format and extension should return successful message")
    void registerTestScenario1() throws Exception {
        // Arrange
        Mockito.when(portalUserOptional.isPresent()).thenReturn(false);

        var registerRequest = new RegisterRequest("user" + emailDomain, "password123", Role.INTERN);

        // Act
        var response = mockMvc
                .perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(registerRequestJson.write(registerRequest).getJson())
                )
                .andReturn().getResponse();


        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.OK.value());

        var expectedResponse = genericMessageJson.write(
                new GenericMessage("User registered successfully!")
        ).getJson();

        assertThat(response.getContentAsString()).isEqualTo(expectedResponse);
    }

    @Test
    @DisplayName("Registration of a mentor with correct email format and extension should return successful message")
    void registerTestScenario2() throws Exception {
        // Arrange
        Mockito.when(portalUserOptional.isPresent()).thenReturn(false);

        var registerRequest = new RegisterRequest("user" + emailDomain, "password123", Role.MENTOR);

        // Act
        var response = mockMvc
                .perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(registerRequestJson.write(registerRequest).getJson())
                )
                .andReturn().getResponse();


        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.OK.value());

        var expectedResponse = genericMessageJson.write(
                new GenericMessage("User registered successfully!")
        ).getJson();

        assertThat(response.getContentAsString()).isEqualTo(expectedResponse);
    }


    @Test
    @DisplayName("Registration of an intern with incorrect email extension should return error message")
    void registerTestScenario3() throws Exception {
        // Arrange
        Mockito.when(portalUserOptional.isPresent()).thenReturn(false);

        var registerRequest = new RegisterRequest("user" + emailDomain + ".other", "password123", Role.INTERN);

        // Act
        var response = mockMvc
                .perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(registerRequestJson.write(registerRequest).getJson())
                )
                .andReturn().getResponse();


        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());

        var expectedResponse = genericMessageJson.write(
                new GenericMessage("Email must belong to the domain: " + emailDomain)
        ).getJson();

        assertThat(response.getContentAsString()).isEqualTo(expectedResponse);
    }

    @Test
    @DisplayName("Trying to register an administrator should return error message")
    void registerTestScenario4() throws Exception {
        // Arrange
        Mockito.when(portalUserOptional.isPresent()).thenReturn(false);

        var registerRequest = new RegisterRequest("user" + emailDomain, "password123", Role.ADMIN);

        // Act
        var response = mockMvc
                .perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(registerRequestJson.write(registerRequest).getJson())
                )
                .andReturn().getResponse();


        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());

        var expectedResponse = genericMessageJson.write(
                new GenericMessage("Cannot register as an administrator!")
        ).getJson();

        assertThat(response.getContentAsString()).isEqualTo(expectedResponse);
    }


    @Test
    @DisplayName("Trying to register with registered email should return error message")
    void registerTestScenario5() throws Exception {
        // Arrange
        Mockito.when(portalUserRepository.findByEmail(Mockito.any()))
                .thenReturn(Optional.of(new PortalUser(null, "email", "pass", Role.INTERN)));

        var registerRequest = new RegisterRequest("user" + emailDomain, "password123", Role.MENTOR);

        // Act
        var response = mockMvc
                .perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(registerRequestJson.write(registerRequest).getJson())
                )
                .andReturn().getResponse();


        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());

        var expectedResponse = genericMessageJson.write(
                new GenericMessage("Email is already in use!")
        ).getJson();

        assertThat(response.getContentAsString()).isEqualTo(expectedResponse);
    }
}
