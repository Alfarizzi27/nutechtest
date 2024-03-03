CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY,
	"email" varchar(50) NOT NULL UNIQUE,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"password" varchar(100)
);

CREATE TABLE IF NOT EXISTS "balances" (
	"id" serial PRIMARY KEY,
	"UserId" integer NOT NULL UNIQUE REFERENCES "users" ("id")
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	"balance" integer ,
	"createdAt" date,
	"updatedAt" date
);

CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL REFERENCES "users" ("id")
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	"service_id" integer REFERENCES "services" ("id")
		ON DELETE CASCADE
		ON UPDATE CASCADE,	
	"invoice_number" varchar(50),
	"transaction_type" varchar(10),
	"description" varchar(100),
	"total_amount" integer,
	"created_on" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "services" (
	"id" serial PRIMARY KEY,
	"service_code" varchar(20),
	"service_name" varchar(50),
	"service_icon" varchar(100),
	"service_tariff" integer
)
