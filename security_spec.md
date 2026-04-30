# Security Specification: NEURALX Threat Orchestrator

## Data Invariants
1. A `TrainingSession` cannot be created without a valid `userId` matching the authenticated user.
2. A `SecurityAlert` can only be viewed by the user who triggered the session or an admin.
3. Timestamps must be server-generated to prevent temporal manipulation.
4. `riskScore` must be a valid number between 0 and 100.

## The "Dirty Dozen" Payloads (Attack Vectors)

1. **Identity Spoofing**: Attempting to create a training session for another user ID.
   ```json
   { "userId": "attacker_id", "modelType": "ML", "status": "processing" }
   ```
2. **Privilege Escalation**: Attempting to flag an alert as "resolved" or "system-level" without permission.
   ```json
   { "message": "Threat Cleaned", "riskScore": 0, "systemVerified": true }
   ```
3. **Temporal Poisoning**: Sending a future timestamp to override alert order.
   ```json
   { "timestamp": "2099-01-01T00:00:00Z", "message": "Fake" }
   ```
4. **Denial of Wallet (ID Scraping)**: Requesting massive amounts of alerts using a broad query.
   ```javascript
   query(collection(db, "security_alerts")) // Without where(userId == auth.uid)
   ```
5. **Ghost Field Mutation**: Adding a `role: "admin"` to a user profile update.
   ```json
   { "role": "admin" }
   ```
6. **Relational Orphan**: Creating a training session for a non-existent dataset.
7. **Resource Exhaustion**: Sending 1MB strings in the `datasetName` field.
8. **Path ID Poisoning**: Using `../` or special characters in the Document ID.
9. **Update Gap**: Changing the `userId` of an existing alert.
10. **State Shortcut**: Setting a session status to `completed` directly on creation.
11. **PII Leak**: Accessing another user's email via the `/users` collection.
12. **System Override**: Modifying the `sessionId` after creation.

## Security Test Runner
Verified via `firestore.rules`.
