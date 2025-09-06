# Learnspace

## Overview
Learnspace is a backend application designed to manage educational resources, assignments, alerts, submissions, and user profiles for an online learning platform. It provides RESTful APIs for client applications to interact with the system.

## Technologies Used
- **Java 17+**
- **Spring Boot**
- **Spring Security**
- **JPA/Hibernate**
- **Maven**
- **JWT** (for authentication)

## Features
- User authentication and authorization
- Assignment management
- Alert notifications
- File upload and download
- Class and member management
- Submission tracking
- Profile update and password change

## Architecture
- **Controller Layer**: Handles HTTP requests (e.g., `AssignmentController`, `AlertController`).
- **Service Layer**: Business logic (e.g., `AssignmentService`, `PersonService`).
- **Repository Layer**: Data access using Spring Data JPA (e.g., `AssignmentRepository`).
- **DTOs**: Data Transfer Objects for API communication.
- **Config**: Configuration files for security, cloud storage, etc.
- **Util**: Utility classes (e.g., JWT handling).

## Setup Instructions
1. **Prerequisites**:
   - Java 17 or higher
   - Maven
   - Cloudinary account (for file storage)
2. **Clone the repository**:
   ```sh
   git clone <your-repo-url>
   cd learnspace
   ```
3. **Configure Environment**:
   - Edit `src/main/resources/application.properties` with your database and Cloudinary credentials.
4. **Build the project**:
   ```sh
   ./mvnw clean install
   ```
5. **Run the application**:
   ```sh
   ./mvnw spring-boot:run
   ```
   The app will start on `http://localhost:8080` by default.

## Usage
- Use tools like Postman to interact with the REST API endpoints.
- Common endpoints:
  - `/api/auth` - Authentication
  - `/api/assignments` - Assignment management
  - `/api/alerts` - Alerts
  - `/api/classes` - Class management
  - `/api/submissions` - Submission management
  - `/api/profile` - Profile operations
- Refer to controller classes for detailed endpoint documentation.

## Testing
- Unit and integration tests are located in `src/test/java/com/example/learnspace/`
- Run tests with:
  ```sh
  ./mvnw test
  ```

## Deployment
- Package the app with:
  ```sh
  ./mvnw package
  ```
- Deploy the generated JAR file to your server or cloud provider.

## Contribution Guidelines
- Fork the repository and create a feature branch.
- Follow Java and Spring Boot best practices.
- Submit pull requests with clear descriptions.

## Troubleshooting
- **Build errors**: Ensure Java and Maven versions are correct.
- **Cloudinary issues**: Check your credentials in `application.properties`.
- **Database errors**: Verify your DB connection settings.

## Contact
For questions or support, contact the maintainer or open an issue in the repository.

