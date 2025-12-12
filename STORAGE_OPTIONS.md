# Storage Options for Vercel Demo

## Quick Comparison

| Option | Setup Difficulty | Cost | Speed | Best For |
|--------|------------------|------|-------|----------|
| **Vercel KV** ⭐ | ⭐ Easy | Free tier | ⭐⭐⭐ Fast | **Demo (Recommended)** |
| **Vercel Postgres** | ⭐⭐ Medium | Free tier | ⭐⭐ Medium | Production-ready demo |
| **Upstash Redis** | ⭐⭐ Medium | Free tier | ⭐⭐⭐ Fast | Alternative Redis |
| **Supabase** | ⭐⭐ Medium | Free tier | ⭐⭐ Medium | Full-featured DB |
| **MongoDB Atlas** | ⭐⭐⭐ Harder | Free tier | ⭐⭐ Medium | NoSQL preference |

## Recommended: Upstash Redis ⭐

### Why Upstash Redis is Best for Demo

✅ **Serverless Redis** - Pay-as-you-go, no setup complexity  
✅ **Free tier** - 10,000 commands/day, 256 MB storage (plenty for demo)  
✅ **Fast** - In-memory Redis, sub-millisecond latency  
✅ **Shared** - Works across all serverless instances  
✅ **Simple API** - Easy to integrate  
✅ **No cold starts** - Data persists between function invocations  
✅ **Global distribution** - Low latency worldwide  
⚠️ **Note**: Vercel KV has been deprecated, Upstash Redis is the recommended alternative  

### Setup Steps

1. **Create Upstash Redis Database**
   - Go to [Upstash Console](https://console.upstash.com/)
   - Sign up (free account)
   - Click "Create Database"
   - Choose name and region
   - Copy REST API credentials

2. **Install Dependencies**
   ```bash
   npm install @upstash/redis
   ```

3. **Add Environment Variables to Vercel**
   - `UPSTASH_REDIS_REST_URL` (from Upstash console)
   - `UPSTASH_REDIS_REST_TOKEN` (from Upstash console)
   - Add to Production, Preview, Development

4. **Migration Path**
   - ✅ Already done! Code uses Upstash Redis
   - Just need to set up database and env vars
   - ~5 minutes of setup

### Code Example

```typescript
import { kv } from '@vercel/kv';

// Store message
await kv.lpush(`messages:${chatId}`, JSON.stringify(message));

// Get messages
const messages = await kv.lrange(`messages:${chatId}`, 0, -1);
```

---

## Option 2: Vercel Postgres

### Pros
- ✅ Built into Vercel
- ✅ Free tier (256 MB storage)
- ✅ Production-ready
- ✅ SQL queries
- ✅ ACID transactions

### Cons
- ⚠️ More setup (schema, migrations)
- ⚠️ Slower than KV (but still fast)
- ⚠️ Overkill for simple demo

### Best For
- If you want to learn SQL
- If you plan to scale to production
- If you need complex queries

### Setup
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Install: `npm install @vercel/postgres`
3. Create schema and migrations
4. More work than KV (~4-6 hours)

---

## Option 3: Upstash Redis

### Pros
- ✅ Serverless Redis (pay per request)
- ✅ Generous free tier
- ✅ Fast
- ✅ Works with Vercel KV API

### Cons
- ⚠️ External service (not built into Vercel)
- ⚠️ Need separate account

### Best For
- If Vercel KV is not available in your region
- If you need more control

---

## Option 4: Supabase

### Pros
- ✅ Free tier (500 MB database)
- ✅ PostgreSQL with real-time features
- ✅ Built-in auth (if needed later)
- ✅ Good documentation

### Cons
- ⚠️ External service
- ⚠️ More complex setup
- ⚠️ Overkill for simple demo

### Best For
- If you want PostgreSQL features
- If you need real-time subscriptions later

---

## Option 5: MongoDB Atlas

### Pros
- ✅ Free tier (512 MB)
- ✅ NoSQL flexibility
- ✅ Good for rapid prototyping

### Cons
- ⚠️ External service
- ⚠️ More setup
- ⚠️ NoSQL might be overkill

---

## Implementation Plan: Vercel KV

### Phase 1: Setup (15 minutes)
1. Enable Vercel KV in dashboard
2. Install `@vercel/kv` package
3. Verify environment variables are set

### Phase 2: Data Structure Design (30 minutes)

**Redis Keys:**
```
messages:{chatId}          → List of message IDs
message:{messageId}        → Hash with message data
conversations              → Set of chat IDs
conversation:{chatId}      → Hash with conversation metadata
```

**Alternative (Simpler):**
```
messages:{chatId}          → List of JSON strings (messages)
conversations              → Set of chat IDs
```

### Phase 3: Migration (2-3 hours)

**Replace `lib/store.ts` functions:**

1. `addMessage()` → Use `kv.lpush()` and `kv.hset()`
2. `getMessagesByChatId()` → Use `kv.lrange()` and `kv.hmget()`
3. `getAllConversations()` → Use `kv.smembers()` and `kv.hmget()`
4. `clearAll()` → Use `kv.flushdb()` (or delete specific keys)

### Phase 4: Testing (30 minutes)
1. Test locally with Vercel KV
2. Deploy and test on Vercel
3. Verify data persists across instances

### Estimated Total Time: 3-4 hours

---

## Quick Start: Vercel KV

### 1. Enable KV
```bash
# Via Vercel CLI (alternative to dashboard)
vercel kv create telegram-cs-kv
```

### 2. Install Package
```bash
npm install @vercel/kv
```

### 3. Update `lib/store.ts`

```typescript
import { kv } from '@vercel/kv';

// Store message
export async function addMessage(
  message: Omit<Message, 'id' | 'createdAt'>,
  createdAt?: Date
): Promise<Message> {
  const newMessage: Message = {
    ...message,
    id: generateId(),
    createdAt: createdAt || new Date(),
  };

  // Store message in list
  await kv.lpush(`messages:${message.telegramChatId}`, JSON.stringify(newMessage));
  
  // Store in conversations set
  await kv.sadd('conversations', message.telegramChatId);
  
  // Store conversation metadata
  await kv.hset(`conversation:${message.telegramChatId}`, {
    userId: message.telegramUserId,
    username: message.telegramUsername || '',
    lastActivity: newMessage.createdAt.toISOString(),
  });

  return newMessage;
}

// Get messages
export async function getMessagesByChatId(chatId: string): Promise<Message[]> {
  const messageStrings = await kv.lrange(`messages:${chatId}`, 0, -1);
  return messageStrings.map(str => JSON.parse(str) as Message);
}

// Get conversations
export async function getAllConversations(): Promise<Conversation[]> {
  const chatIds = await kv.smembers('conversations');
  const conversations: Conversation[] = [];
  
  for (const chatId of chatIds) {
    const messages = await getMessagesByChatId(chatId);
    if (messages.length > 0) {
      const metadata = await kv.hgetall(`conversation:${chatId}`);
      const sorted = [...messages].sort((a, b) => 
        a.createdAt.getTime() - b.createdAt.getTime()
      );
      
      conversations.push({
        chatId,
        userId: metadata.userId as number,
        username: metadata.username as string,
        lastMessage: sorted[sorted.length - 1],
        messageCount: messages.length,
        lastActivity: new Date(metadata.lastActivity as string),
      });
    }
  }
  
  return conversations.sort((a, b) => 
    b.lastActivity.getTime() - a.lastActivity.getTime()
  );
}
```

### 4. Update API Routes
- Make all store functions `async`
- Add `await` to all store calls
- Update route handlers to be async

---

## Cost Comparison

### Vercel KV (Free Tier)
- 30,000 reads/day
- 1,000 writes/day
- Perfect for demo

### Vercel Postgres (Free Tier)
- 256 MB storage
- Unlimited queries
- Good for demo

### Upstash Redis (Free Tier)
- 10,000 commands/day
- 256 MB storage
- Good for demo

---

## Recommendation

**For Demo: Use Vercel KV** ⭐

- Easiest setup
- Fastest to implement
- Built into Vercel
- Solves serverless isolation problem
- Free tier is sufficient

**For Production: Use Vercel Postgres**

- More robust
- Better for complex queries
- ACID transactions
- Better for scaling

---

## Next Steps

1. **Choose Vercel KV** (recommended for demo)
2. **Enable in Vercel Dashboard**
3. **Install package**: `npm install @vercel/kv`
4. **Migrate `lib/store.ts`** to use KV
5. **Test locally and deploy**

Would you like me to implement the Vercel KV migration?

