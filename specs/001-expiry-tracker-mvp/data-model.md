# Data Model: Expiry Tracker MVP

**Feature**: 001-expiry-tracker-mvp
**Date**: 2026-01-23
**Database**: PostgreSQL 15+ (Neon)

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password_hash   │
│ role            │
│ status          │
│ created_at      │
│ updated_at      │
│ last_login_at   │
└─────────────────┘
        │
        │ 1:N
        ├──────────────────────────────┐
        │                              │
        ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│   food_items    │          │   documents     │
├─────────────────┤          ├─────────────────┤
│ id (PK)         │          │ id (PK)         │
│ user_id (FK)    │          │ user_id (FK)    │
│ name            │          │ type            │
│ category        │          │ number          │
│ expiry_date     │          │ expiry_date     │
│ quantity        │          │ file_path       │
│ storage_type    │          │ file_size       │
│ status          │          │ mime_type       │
│ remaining_days  │          │ status          │
│ created_at      │          │ remaining_days  │
│ updated_at      │          │ created_at      │
└─────────────────┘          │ updated_at      │
        │                    └─────────────────┘
        │ 1:N                        │ 1:N
        │                            │
        ▼                            ▼
┌─────────────────────────────────────────────┐
│           notifications                     │
├─────────────────────────────────────────────┤
│ id (PK)                                     │
│ user_id (FK)                                │
│ item_type (food_item | document)            │
│ item_id (FK to food_items or documents)     │
│ scheduled_time                              │
│ notification_message                        │
│ delivery_status (pending | sent | failed)   │
│ delivered_at                                │
│ created_at                                  │
└─────────────────────────────────────────────┘
```

## Table Schemas

### users

**Purpose**: Store user accounts with authentication credentials and role information

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

**Fields**:
- `id`: Auto-incrementing primary key
- `email`: Unique email address (RFC 5322 validated in application)
- `password_hash`: bcrypt hash of password (12+ rounds)
- `role`: User role (user | admin)
- `status`: Account status (active | deactivated)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
- `last_login_at`: Last successful login timestamp

**Validation Rules**:
- Email must be unique and valid format
- Password must meet requirements (8+ chars, uppercase, lowercase, number)
- Role must be 'user' or 'admin'
- Status must be 'active' or 'deactivated'

**Relationships**:
- One user has many food_items (1:N)
- One user has many documents (1:N)
- One user has many notifications (1:N)

---

### food_items

**Purpose**: Store food items with expiry dates and tracking information

```sql
CREATE TABLE food_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'Dairy', 'Meat', 'Vegetables', 'Fruits', 'Grains',
    'Beverages', 'Condiments', 'Frozen', 'Canned', 'Other'
  )),
  expiry_date DATE NOT NULL,
  quantity VARCHAR(100),
  storage_type VARCHAR(50) NOT NULL CHECK (storage_type IN (
    'Refrigerator', 'Freezer', 'Pantry', 'Counter'
  )),
  status VARCHAR(20) NOT NULL DEFAULT 'Safe' CHECK (status IN (
    'Expired', 'Expiring Soon', 'Safe'
  )),
  remaining_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_items_user_id ON food_items(user_id);
CREATE INDEX idx_food_items_expiry_date ON food_items(expiry_date);
CREATE INDEX idx_food_items_status ON food_items(status);
CREATE INDEX idx_food_items_user_expiry ON food_items(user_id, expiry_date);
```

**Fields**:
- `id`: Auto-incrementing primary key
- `user_id`: Foreign key to users table
- `name`: Item name (e.g., "Milk", "Chicken Breast")
- `category`: Predefined category (Dairy, Meat, Vegetables, etc.)
- `expiry_date`: Expiry date in ISO 8601 format (YYYY-MM-DD)
- `quantity`: Optional quantity (e.g., "1 liter", "500g")
- `storage_type`: Storage location (Refrigerator, Freezer, Pantry, Counter)
- `status`: Calculated status (Expired | Expiring Soon | Safe)
- `remaining_days`: Calculated days until expiry (can be negative)
- `created_at`: Item creation timestamp
- `updated_at`: Last update timestamp

**Validation Rules**:
- Name is required and max 255 characters
- Category must be one of predefined values
- Expiry date is required and must be valid date
- Storage type must be one of predefined values
- Status calculated based on remaining_days:
  - Expired: remaining_days < 0
  - Expiring Soon: 0 ≤ remaining_days ≤ 7
  - Safe: remaining_days > 7

**Calculated Fields**:
- `remaining_days`: EXTRACT(DAY FROM (expiry_date - CURRENT_DATE))
- `status`: Derived from remaining_days

**Relationships**:
- Many food_items belong to one user (N:1)
- One food_item has many notifications (1:N)

---

### documents

**Purpose**: Store important documents with expiry dates and optional file attachments

```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'Passport', 'Driver License', 'ID Card', 'Insurance Policy',
    'Medical Record', 'Visa', 'Vehicle Registration',
    'Professional License', 'Other'
  )),
  number VARCHAR(100) NOT NULL,
  expiry_date DATE NOT NULL,
  file_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'Safe' CHECK (status IN (
    'Expired', 'Expiring Soon', 'Safe'
  )),
  remaining_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_user_expiry ON documents(user_id, expiry_date);
CREATE INDEX idx_documents_type ON documents(type);
```

**Fields**:
- `id`: Auto-incrementing primary key
- `user_id`: Foreign key to users table
- `type`: Document type (Passport, Driver License, etc.)
- `number`: Document number (e.g., passport number)
- `expiry_date`: Expiry date in ISO 8601 format (YYYY-MM-DD)
- `file_path`: Cloud storage path to uploaded file (optional)
- `file_size`: File size in bytes (optional)
- `mime_type`: MIME type of uploaded file (optional)
- `status`: Calculated status (Expired | Expiring Soon | Safe)
- `remaining_days`: Calculated days until expiry (can be negative)
- `created_at`: Document creation timestamp
- `updated_at`: Last update timestamp

**Validation Rules**:
- Type must be one of predefined values
- Number is required and max 100 characters
- Expiry date is required and must be valid date
- File size max 10MB (10,485,760 bytes)
- MIME type must be PDF, JPG, JPEG, or PNG
- Status calculated same as food_items

**Calculated Fields**:
- `remaining_days`: EXTRACT(DAY FROM (expiry_date - CURRENT_DATE))
- `status`: Derived from remaining_days

**Relationships**:
- Many documents belong to one user (N:1)
- One document has many notifications (1:N)

---

### notifications

**Purpose**: Track scheduled and delivered push notifications for items and documents

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('food_item', 'document')),
  item_id INTEGER NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_message TEXT NOT NULL,
  delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (delivery_status IN (
    'pending', 'sent', 'failed'
  )),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_scheduled_time ON notifications(scheduled_time);
CREATE INDEX idx_notifications_delivery_status ON notifications(delivery_status);
CREATE INDEX idx_notifications_item ON notifications(item_type, item_id);
```

**Fields**:
- `id`: Auto-incrementing primary key
- `user_id`: Foreign key to users table
- `item_type`: Type of item (food_item | document)
- `item_id`: ID of the food_item or document
- `scheduled_time`: When notification should be sent
- `notification_message`: Message content
- `delivery_status`: Status (pending | sent | failed)
- `delivered_at`: Actual delivery timestamp
- `created_at`: Notification creation timestamp

**Validation Rules**:
- Item type must be 'food_item' or 'document'
- Scheduled time must be in the future when created
- Notification message is required
- Delivery status must be one of predefined values

**Relationships**:
- Many notifications belong to one user (N:1)
- Many notifications reference one food_item or document (N:1, polymorphic)

**Note**: This is a tracking table for backend logging. Actual notification scheduling happens on the mobile device via Expo Notifications.

---

## Database Views

### v_expiring_items

**Purpose**: Unified view of all expiring items (food + documents) for dashboard

```sql
CREATE VIEW v_expiring_items AS
SELECT
  'food_item' AS item_type,
  fi.id,
  fi.user_id,
  fi.name AS item_name,
  fi.category AS item_category,
  fi.expiry_date,
  fi.status,
  fi.remaining_days,
  fi.created_at
FROM food_items fi
UNION ALL
SELECT
  'document' AS item_type,
  d.id,
  d.user_id,
  d.type || ' - ' || d.number AS item_name,
  d.type AS item_category,
  d.expiry_date,
  d.status,
  d.remaining_days,
  d.created_at
FROM documents d;
```

**Usage**: Dashboard queries to get all expiring items across both tables

---

## Database Functions

### update_item_status()

**Purpose**: Trigger function to automatically update status and remaining_days

```sql
CREATE OR REPLACE FUNCTION update_item_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.remaining_days := EXTRACT(DAY FROM (NEW.expiry_date - CURRENT_DATE));

  IF NEW.remaining_days < 0 THEN
    NEW.status := 'Expired';
  ELSIF NEW.remaining_days <= 7 THEN
    NEW.status := 'Expiring Soon';
  ELSE
    NEW.status := 'Safe';
  END IF;

  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to food_items
CREATE TRIGGER trigger_update_food_item_status
BEFORE INSERT OR UPDATE OF expiry_date ON food_items
FOR EACH ROW
EXECUTE FUNCTION update_item_status();

-- Apply to documents
CREATE TRIGGER trigger_update_document_status
BEFORE INSERT OR UPDATE OF expiry_date ON documents
FOR EACH ROW
EXECUTE FUNCTION update_item_status();
```

**Purpose**: Automatically calculate and update status/remaining_days when expiry_date changes

---

## Seed Data

### Predefined Categories and Types

```sql
-- Food categories (enforced by CHECK constraint)
-- Dairy, Meat, Vegetables, Fruits, Grains, Beverages, Condiments, Frozen, Canned, Other

-- Storage types (enforced by CHECK constraint)
-- Refrigerator, Freezer, Pantry, Counter

-- Document types (enforced by CHECK constraint)
-- Passport, Driver License, ID Card, Insurance Policy, Medical Record,
-- Visa, Vehicle Registration, Professional License, Other

-- Create admin user (password: Admin123!)
INSERT INTO users (email, password_hash, role, status)
VALUES (
  'admin@expirytracker.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', -- Admin123!
  'admin',
  'active'
);
```

---

## Migration Strategy

### Migration Files

1. `001_create_users_table.sql`: Create users table with indexes
2. `002_create_food_items_table.sql`: Create food_items table with indexes
3. `003_create_documents_table.sql`: Create documents table with indexes
4. `004_create_notifications_table.sql`: Create notifications table with indexes
5. `005_create_views_and_functions.sql`: Create views and trigger functions
6. `006_seed_admin_user.sql`: Insert default admin user

### Rollback Strategy

Each migration should have a corresponding down migration:
- Drop tables in reverse order (notifications → documents → food_items → users)
- Drop views and functions before tables
- Use `IF EXISTS` clauses for safety

---

## Data Integrity Rules

### Constraints

1. **Foreign Keys**: All foreign keys use `ON DELETE CASCADE` to maintain referential integrity
2. **Check Constraints**: Enum-like fields use CHECK constraints for valid values
3. **Unique Constraints**: Email must be unique in users table
4. **Not Null**: Required fields enforce NOT NULL constraint
5. **Date Validation**: Application validates dates before insertion

### Transactions

All multi-step operations must use transactions:
- Creating item + scheduling notifications
- Updating item + rescheduling notifications
- Deleting item + canceling notifications

### Backup and Recovery

- Neon provides automatic backups with point-in-time recovery
- Export data regularly for additional safety
- Test restore procedures before production

---

## Performance Considerations

### Indexes

- Primary keys automatically indexed
- Foreign keys indexed for join performance
- Composite index on (user_id, expiry_date) for dashboard queries
- Status indexed for filtering expired/expiring items

### Query Optimization

- Use prepared statements for repeated queries
- Limit result sets with pagination
- Use views for complex joins
- Avoid N+1 queries (use joins or batch queries)

### Scaling

- Neon auto-scales based on load
- Connection pooling prevents connection exhaustion
- Consider read replicas for heavy read workloads (post-MVP)
- Archive old notifications periodically

---

## Security Considerations

### Data Protection

- Passwords hashed with bcrypt (never stored plain text)
- JWT tokens not stored in database (stateless auth)
- File paths use UUIDs to prevent enumeration
- Sensitive data encrypted at rest (Neon provides encryption)

### Access Control

- Row-level security via user_id foreign key
- Application enforces user can only access their own data
- Admin role can access all data
- Database user has minimal required permissions

### Audit Trail

- created_at and updated_at timestamps on all tables
- last_login_at tracks user activity
- Notification delivery status tracks notification history
- Consider audit log table for critical operations (post-MVP)
