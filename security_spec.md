# Security Specification: KEEVO ERP

## Data Invariants
1. **User Residency**: Every user MUST have a `companyId`. Any document they create MUST belong to that specific `companyId`.
2. **Company Ownership**: A company document can only be modified by its `ownerId` (the user who created it).
3. **Immutable History**: `StockAdjustment` and `AuditLog` entries are append-only. Once written, they cannot be modified or deleted.
4. **Relational Integrity**: 
   - A `Product` must refer to a valid `Category` (if specified).
   - A `Sale` must refer to a valid `Customer` (Contact) if specified.
   - All accounting entries must have balanced debits and credits.
5. **Role-Based Access Control (RBAC)**:
   - `admin`: Full access to company data.
   - `accountant`: Full access except for user management and company settings.
   - `cashier`: Can read products and create sales; cannot view global reports or other accounting data.

## The "Dirty Dozen" Payloads (Attacker Strategy)

1. **Identity Spoofing (Foreign ID)**: User A attempts to create a product with `companyId` of User B.
2. **Escalation (Role Injection)**: A `cashier` attempts to update their own user profile to `role: 'admin'`.
3. **Orphan Creation**: Creating a `Product` with a random `categoryId` that doesn't exist.
4. **Financial Tampering**: A user attempts to update a terminal `Sale` record (status 'paid') to change the amount.
5. **Audit Erasure**: An admin attempts to delete a `StockAdjustment` entry to hide inventory theft.
6. **Denial of Wallet (ID Poisoning)**: Creating a document with a 2MB string as the ID.
7. **Temporal Fraud**: Setting `createdAt` to a date in the past via the client payload.
8. **Shadow Fields**: Adding a `isSystemAdmin: true` field to a user profile.
9. **Cross-Company Leak**: A user authenticated in Company X attempts to `list` sales from Company Y.
10. **Type Poisoning**: Sending a `quantity` as a `string` or a negative `number`.
11. **PII Leak**: An unauthenticated user attempts to read the `/users` collection.
12. **Status Shortcutting**: Attempting to skip 'Sent' and move straight from 'Draft' to 'Received' on a `PurchaseOrder`.

## Test Runner Plan
I will use `firebase-rules-generator` logic to ensure all these are blocked.
(Note: Real `test-runner` execution happens during my thought process/auditing).
