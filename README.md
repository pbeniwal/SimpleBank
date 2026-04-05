# 🏦 Simple Local Bank Application

A full-stack banking domain website built with React, Node.js, and PostgreSQL. It allows users to create accounts, perform deposits/withdrawals, and view transaction history.

## 🛠 Required Software
Before running the application, ensure you have the following installed on your Windows laptop:
1. **Node.js** (LTS Version) https://nodejs.org/
2. **PostgreSQL** (with pgAdmin 4) https://www.postgresql.org/download/windows/
3. **Git** https://git-scm.com/download/win
4. **VS Code** https://code.visualstudio.com/

---

## 🚀 Getting Started

### 1. Database Setup
1. Open **pgAdmin 4** and create a database named `local_bank`.
2. Run the following SQL queries to create the tables:
```sql
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
### 2. Backend Setup(server)

#### 1. Open your terminal and navigate to the server folder:

#### Bash
```
cd server
npm install
```

#### 2. Create a file named .env in the server folder and add your PostgreSQL credentials
```
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_HOST=localhost
DB_DATABASE=local_bank
DB_PORT=5432
PORT=5000
```

#### 3. Start the backend server::
#### Bash
```
node index.js
```

### 2. Frontend Setup(client)

#### 1. Open your terminal and navigate to the client folder:

#### Bash
```
cd client
npm install
```

#### 2. Launch the React application:
#### Bash
```
npm run dev
```

#### 3. Open your browser and navigate to the local URL provided:

```
http://localhost:5173
```

## 📁 Project Structure
#### /client: React frontend built with Vite, React Router, and Lucide Icons.

#### /server: Node.js & Express backend using the pg (node-postgres) driver.

