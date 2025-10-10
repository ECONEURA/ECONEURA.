const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutos
const DEFAULT_MAX_MESSAGES = 20; // 10 intercambios (user+assistant)
const SWEEP_INTERVAL_MS = 60 * 1000;

class ConversationStore {
    constructor(options = {}) {
        this.ttlMs = options.ttlMs || DEFAULT_TTL_MS;
        this.maxMessages = options.maxMessages || DEFAULT_MAX_MESSAGES;
        this.store = new Map();
        this.lastSweep = Date.now();
    }

    _getKey(userId, agentId) {
        return `${userId}:${agentId}`;
    }

    _sweepIfNeeded() {
        const now = Date.now();
        if (now - this.lastSweep < SWEEP_INTERVAL_MS) {
            return;
        }
        this.lastSweep = now;
        for (const [key, entry] of this.store.entries()) {
            if (entry.expiresAt <= now) {
                this.store.delete(key);
            }
        }
    }

    getHistory(userId, agentId, limit = this.maxMessages / 2) {
        this._sweepIfNeeded();
        const key = this._getKey(userId, agentId);
        const entry = this.store.get(key);
        if (!entry) {
            return [];
        }
        const history = entry.messages;
        if (!history.length) {
            return [];
        }
        const sliceSize = Math.max(2, limit * 2);
        return history.slice(-sliceSize);
    }

    append(userId, agentId, userMessage, assistantMessage) {
        const key = this._getKey(userId, agentId);
        const now = Date.now();
        const entry = this.store.get(key) || { messages: [] };

        entry.messages.push({ role: 'user', content: userMessage, ts: now });
        entry.messages.push({ role: 'assistant', content: assistantMessage, ts: now });

        if (entry.messages.length > this.maxMessages) {
            entry.messages.splice(0, entry.messages.length - this.maxMessages);
        }

        entry.expiresAt = now + this.ttlMs;
        this.store.set(key, entry);

        return entry.messages;
    }

    purge(userId, agentId) {
        const key = this._getKey(userId, agentId);
        this.store.delete(key);
    }
}

const ttlFromEnv = Number(process.env.CONVERSATION_TTL_MS);
const maxMessagesFromEnv = Number(process.env.CONVERSATION_MAX_MESSAGES);

const conversationStore = new ConversationStore({
    ttlMs: Number.isFinite(ttlFromEnv) && ttlFromEnv > 0 ? ttlFromEnv : DEFAULT_TTL_MS,
    maxMessages: Number.isFinite(maxMessagesFromEnv) && maxMessagesFromEnv >= 2 ? maxMessagesFromEnv : DEFAULT_MAX_MESSAGES
});

module.exports = {
    ConversationStore,
    conversationStore
};
