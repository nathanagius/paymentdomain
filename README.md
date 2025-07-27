# Payment Initiation App (BIAN/DDD Example)

A full-stack reference implementation for Payment Initiation in a UK retail banking context, following Domain-Driven Design (DDD) and BIAN standards.

## Overview
- **Frontend**: React + Material UI (payment journey UI)
- **Backend**: Node.js/TypeScript, DDD, BIAN-aligned Payment Initiation domain
- **Customer Mock Service**: Node.js/TypeScript, provides customer/account data
- **Database**: Postgres (Dockerized)
- **Orchestration**: Docker Compose

## Architecture
```
+-----------+        +---------------------+        +-------------------+
|  Frontend | <----> | Payment Initiation  | <----> |     Postgres      |
|  (React)  |        |   API (DDD/BIAN)    |        |   (payment db)    |
+-----------+        +---------------------+        +-------------------+
      |                        ^
      v                        |
+-------------------+          |
| Customer Mock API | <--------+
+-------------------+
```

- **Frontend**: Guides user through payment journey (select account, enter details, review, confirm, result)
- **Payment Initiation API**: Handles payment logic, persists instructions
- **Customer Mock API**: Provides mock customer and account data

## Running the App

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) installed

### Start All Services
```sh
docker compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Payment API: [http://localhost:4000/api](http://localhost:4000/api)
- Customer Mock: [http://localhost:4001](http://localhost:4001)

### Stopping
```sh
docker compose down
```

## API Endpoints

### Payment Initiation API (`:4000/api`)
- `POST /payments` — Initiate a payment
- `GET /payments` — List all payments
- `GET /payments/:id` — Get payment by ID

### Customer Mock API (`:4001`)
- `GET /customers` — List customers
- `GET /customers/:id` — Get customer by ID
- `GET /accounts?customerId=xxx` — List accounts for a customer

## Payment Journey (Frontend)
1. **Select Account** — Choose source account (fetched from mock API)
2. **Enter Payment Details** — Recipient IBAN, amount, currency, reference
3. **Review** — Confirm details
4. **Confirm** — Initiate payment (calls backend)
5. **Result** — See payment status

## BIAN & DDD
- Payment Initiation domain modeled after [BIAN Payment Initiation](https://bian.org/servicedomain/payment-initiation/)
- Business logic separated from infrastructure (DDD)
- Customer/account data is external to payment domain (clean boundaries)

---

**For demo purposes, the customer is hardcoded as `cust1`.**

Feel free to extend the domain, add authentication, or connect to real banking APIs!