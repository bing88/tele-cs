# Serverless Environment Limitations

## The Problem

In Vercel's serverless environment, you may notice inconsistent data when calling the same API endpoint multiple times. This is **expected behavior** due to how serverless functions work.

## Why This Happens

### Serverless Function Isolation

- Each API request can hit a **different serverless function instance**
- Each instance has its own **isolated memory**
- The in-memory store is **not shared** between instances
- This is different from local development where everything runs in a single process

### Example

```
Request 1 → Serverless Instance A (has 2 messages in memory)
Request 2 → Serverless Instance B (has 1 message in memory - different instance!)
```

Both requests hit the same endpoint, but get different data because they're hitting different instances with different memory states.

## Why It Works Locally

- Local development runs in a **single Node.js process**
- All API routes share the same memory
- Data is consistent across all requests

## Solutions

### For Production (Required)

You **MUST** use a shared database instead of in-memory storage:

1. **PostgreSQL** (recommended)
   - Reliable, ACID compliant
   - Works great with Prisma or Drizzle ORM

2. **MongoDB**
   - NoSQL, flexible schema
   - Good for rapid development

3. **Redis**
   - Fast, in-memory but shared
   - Good for caching + real-time data

4. **Vercel KV** (Redis-compatible)
   - Managed by Vercel
   - Easy integration

### Quick Fix for Demo

If you need consistent data for demo purposes:

1. **Use a single serverless function** (not recommended for production)
2. **Add a database** (recommended)
3. **Use Vercel KV** for simple key-value storage

## Current Implementation

The current implementation uses in-memory storage (`lib/store.ts`), which:
- ✅ Works perfectly in local development
- ⚠️ Shows inconsistencies in serverless (Vercel)
- ❌ Not suitable for production

## Migration Path

To migrate to a database:

1. Choose a database (PostgreSQL recommended)
2. Update `lib/store.ts` to use database queries instead of arrays
3. Replace `addMessage()`, `getMessagesByChatId()`, etc. with database calls
4. Deploy and test

Example with Prisma:

```typescript
// Instead of: messages.push(newMessage)
await prisma.message.create({ data: newMessage });

// Instead of: conversations.get(chatId)
await prisma.message.findMany({ where: { telegramChatId: chatId } });
```

## Summary

- **In-memory storage doesn't work in serverless** - each instance is isolated
- **This is expected behavior** for the current demo implementation
- **For production, use a database** - it's a requirement, not optional

