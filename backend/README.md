# fastfood backend (Java + Spring Boot + MySQL)

REST + WebSocket backend for the `front-end` React app. It implements the exact API
contract declared in `front-end/src/api/endpoints.js`, so the frontend can run against
real data by setting `VITE_USE_MOCKS=false`.

## Stack

| Concern | Choice |
| --- | --- |
| Language | Java 23 |
| Framework | Spring Boot 3.5 (Web, Security, Data JPA, Validation, WebSocket) |
| Database | MySQL 8 (`ddl-auto=update`, auto-created schema) |
| Auth | Stateless JWT (HS256) + BCrypt password hashing |
| Realtime | STOMP over SockJS at `/ws` |
| Build | Maven |

## Prerequisites

- JDK 23 (`java -version`)
- Maven 3.9+ (`mvn -v`)
- MySQL 8 running locally (`MySQL80` service on Windows)

## 1. Create the database (optional)

The app connects with `createDatabaseIfNotExist=true`, so the schema appears on first
run. To use a dedicated user instead of `root`:

```bash
mysql -u root -p < db/setup.sql
```

## 2. Configure

Defaults live in `src/main/resources/application.yml` and can be overridden with
environment variables:

| Variable | Default | Meaning |
| --- | --- | --- |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `fastfood` | Database name |
| `DB_USERNAME` | `root` | MySQL user |
| `DB_PASSWORD` | `root` | MySQL password |
| `SERVER_PORT` | `8080` | HTTP port (must match `VITE_API_BASE_URL`) |
| `JWT_SECRET` | dev secret | HS256 key (>= 32 chars) |
| `JWT_EXPIRATION_MS` | `86400000` | Token lifetime (24 h) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:8443,...` | Allowed browser origins |
| `SEED_DATA` | `true` | Load demo data on first start |

Example (PowerShell):

```powershell
$env:DB_PASSWORD = "your-mysql-password"
```

## 3. Run

```bash
mvn spring-boot:run
```

Or, to be prompted for your MySQL password automatically (PowerShell):

```powershell
.\run.ps1
# or non-interactively:
.\run.ps1 -DbUser fastfood -DbPassword fastfood
```

The API is then available at `http://localhost:8080`. On the first start the seeder
inserts 16 restaurants, ~150 dishes, 4 promo codes, reviews and demo accounts.

## 4. Point the frontend at it

In `front-end/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCKS=false
```

## Demo accounts

Password for all seeded accounts is `password`.

| Role | Email | Notes |
| --- | --- | --- |
| Customer | `customer@fastfood.app` | Owns the seeded order history |
| Restaurant owner | `owner@fastfood.app` | Manages `r1` (Stacked & Smashed) |
| Delivery partner | `rider@fastfood.app` | Has assigned/active deliveries |
| Admin | `admin@fastfood.app` | Users + restaurant approval |

Extra users `avery@example.com` (active) and `noah@example.com` (suspended) populate
the admin Users tab.

## API reference

Base path `/api`. `Authorization: Bearer <token>` is required where noted.

### Auth (public)

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/auth/register` | `{ name, email, password, role }` | `{ token, user }` |
| POST | `/auth/login` | `{ email, password, role? }` | `{ token, user }` |

`role` is `CUSTOMER`, `RESTAURANT_OWNER` or `DELIVERY_PARTNER`. `ADMIN` cannot be
self-registered. The response always carries the account's real role.

### Restaurants (public reads)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/restaurants` | Query: `search, cuisine, veg, freeDelivery, topRated, price, sort, page`. Returns `{ content, page, totalPages, totalElements }` |
| GET | `/restaurants/popular-dishes` | Bestselling dishes flattened with `restaurant: { id, name, deliveryFee, eta }` |
| GET | `/restaurants/{id}` | Restaurant detail |
| GET | `/restaurants/{id}/menu` | Menu with option groups |
| GET | `/restaurants/{id}/reviews` | `[{ name, rating, text, date }]` |
| POST | `/restaurants/menu-items` | Owner only. Create a dish |
| PUT | `/restaurants/menu-items` | Owner only. Update a dish |
| DELETE | `/restaurants/menu-items/{id}` | Owner only. Delete a dish |

### Orders (authenticated)

| Method | Path | Role | Notes |
| --- | --- | --- | --- |
| POST | `/orders` | customer | Place an order; totals are recomputed server-side |
| GET | `/orders/my` | customer | Own order history |
| GET | `/orders/restaurant` | owner, admin | Orders for the owner's restaurant |
| GET | `/orders/{id}` | any (scoped) | Customers see their own; owners their restaurant; riders their assigned jobs |
| PUT | `/orders/{id}/status` | owner, admin | `{ status }`; broadcasts on the WebSocket topic |

### Promotions, payments, delivery, admin

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| POST | `/promos/validate` | public | `{ code, subtotal }` -> `{ code, type, value, label }`; invalid codes return 400 |
| POST | `/payments/create` | authenticated | `{ amount, currency }` -> payment intent |
| POST | `/payments/verify` | authenticated | payment object -> `{ verified, paymentId, status }` |
| GET | `/delivery/assigned` | delivery partner | Active jobs for the signed-in rider |
| PUT | `/delivery/{orderId}/status` | delivery partner | `{ status }`; claims unassigned jobs |
| GET | `/admin/users` | admin | All accounts |
| PUT | `/admin/restaurants/{id}/approve` | admin | `{ id, approved }` |

### WebSocket

Connect with SockJS to `http://localhost:8080/ws` and subscribe to
`/topic/orders/{orderId}`. Every status change publishes:

```json
{ "id": "FR-4821", "status": "PREPARING", "date": "Today, 7:24 PM" }
```

## Project layout

```
backend
├── db/setup.sql                     # optional database + app user
├── pom.xml
└── src/main/java/com/fastfood
    ├── FastFoodApplication.java
    ├── config/      SecurityConfig, WebSocketConfig, seeder + seed data
    ├── domain/      JPA entities (User, Restaurant, MenuItem, Order, ...) and enums
    ├── repository/  Spring Data repositories
    ├── dto/         Request/response records (field names match the frontend)
    ├── security/    JWT service, filter, UserDetails adapter, 401/403 handlers
    ├── service/     Business logic per domain
    ├── util/        Date formatting helpers
    ├── web/         REST controllers
    └── exception/   ApiException + global handler
```

## Security notes

- Passwords are BCrypt hashed; tokens are stateless and validated on every request.
- All `/api/**` routes require authentication except auth, promo validation and
  restaurant reads (the catalog is public, matching the frontend's public pages).
- Role checks are enforced both in `SecurityConfig` matchers and via
  `@PreAuthorize` on the admin/owner/delivery endpoints.
- Unauthenticated requests get a JSON `401`; wrong-role requests get a JSON `403`.

## Useful commands

```bash
mvn -DskipTests compile     # compile
mvn spring-boot:run         # run
mvn -DskipTests package     # build a runnable jar in target/
java -jar target/fastfood-backend-1.0.0.jar
```
