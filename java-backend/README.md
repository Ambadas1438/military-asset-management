# Military Asset Management System - Java Spring Boot Backend

This is the Java Spring Boot 3.2.x replacement for the Node.js backend.

## Prerequisites
- Java 17+
- Maven 3.6+

## Running the Application

```bash
cd java-backend
mvn spring-boot:run
```

The server starts on **port 5000** (same as the Node.js backend).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login with email/password |
| GET | /api/auth/me | Get current user (x-user-id header) |
| GET | /api/auth/users | List all users |
| GET | /api/dashboard/metrics | Dashboard metrics with filters |
| GET | /api/bases | List all bases |
| GET | /api/bases/:id | Get base by ID |
| GET | /api/purchases | List purchases |
| POST | /api/purchases | Record a purchase |
| GET | /api/transfers | List transfers |
| POST | /api/transfers | Initiate a transfer |
| GET | /api/assignments | List assignments |
| POST | /api/assignments | Create assignment |
| PATCH | /api/assignments/:id/return | Return an assignment |
| POST | /api/assignments/expenditures | Record expenditure |
| GET | /api/audit/logs | Audit logs (admin only) |
| GET | /api/health | Health check |

## Database

Uses H2 in-memory database. H2 console available at http://localhost:5000/h2-console
- JDBC URL: `jdbc:h2:mem:militaryassets`
- Username: `sa`
- Password: (empty)

## Demo Users

| Email | Role |
|-------|------|
| a.vance@military.gov | admin |
| s.miller@sentinel.mil | commander (base-alpha) |
| j.hayes@valor.mil | commander (base-bravo) |
| a.carter@logistics.mil | logistics (base-alpha) |

(Password: any value is accepted in demo mode)
