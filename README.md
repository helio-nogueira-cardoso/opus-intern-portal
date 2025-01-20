# Opus Intern Portal
This project is being developed by Hélio Nogueira Cardoso during his internship at Opus Software while pursuing a bachelor's degree in Computer Science at ICMC-USP. The aim of this project is to consolidate his learnings of various technologies.

## Project Vision
The vision for this project is to develop a comprehensive portal to streamline Opus' internship program. The platform is designed to be adaptable and may evolve over time. Key features being considered include:

- **Mentor Tools:** Define study roadmaps, upload reading materials, and recommend courses.
- **Intern Tools:** Register projects, track study progress, and access resources.
- **Community Forum:** Facilitate questions and discussions among interns and mentors.
- **Project Archive:** Document and reference projects from previous programs for future interns.

This project is a work in progress and aims to incorporate feedback and new ideas as it develops.
## Getting Started

### Prerequisites
- Docker
- Docker Compose

### Setting Up

1. **Clone the repository:**
    ```sh
    git clone git@github.com:helio-nogueira-cardoso/opus-intern-portal.git
    cd opus-intern-portal
    ```

2. **Set environment variables:**
    - Copy the example environment file to the `/docker` directory:
      ```sh
      cp .env.example docker/.env
      ```
    - Edit the `docker/.env` file with your preferred settings.

3. **Run Docker Compose:**
    ```sh
    docker-compose up -d
    ```

### Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

### License

Distributed under the MIT License. See `LICENSE` for more information.

### Contact

Hélio Nogueira Cardoso - [cardoso.helio@outlook.com.br](mailto:cardoso.helio@outlook.com.br)
