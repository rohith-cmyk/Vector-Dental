# Vector Dental Shared

Shared types, constants, and utilities used across frontend and backend.

## Purpose

This package ensures type consistency and code reuse between the frontend and backend applications.

## Contents

- **types.ts** - Shared TypeScript type definitions
- **constants.ts** - Shared constants and configuration values

## Usage

### In Frontend or Backend

```typescript
import { ReferralStatus, DENTAL_SPECIALTIES, ApiResponse } from 'dental-referral-shared'

// Use shared types
const status: ReferralStatus = 'SENT'
const specialties = DENTAL_SPECIALTIES
```

## Building

```bash
npm run build
```

This will compile TypeScript to JavaScript in the `dist/` directory.

