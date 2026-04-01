import { prisma } from '../server.js';

/**
 * Search indexer for messages
 * This is a simple implementation. For production, consider using Elasticsearch
 */
class SearchIndexer {
  constructor() {
    this.index = new Map(); // word -> Set of messageIds
    this.isInitialized = false;
  }

  /**
   * Initialize index with existing messages
   */
  async initialize() {
    if (this.isInitialized) return;

    console.log('🔍 Initializing search index...');

    const messages = await prisma.message.findMany({
      where: {
        isDeletedForUsers: false,
        content: { not: null }
      },
      select: {
        id: true,
        content: true
      },
      take: 10000 // Limit for performance
    });

    for (const message of messages) {
      this.indexMessage(message.id, message.content);
    }

    this.isInitialized = true;
    console.log(`✅ Search index initialized with ${messages.length} messages`);
  }

  /**
   * Extract words from text
   */
  extractWords(text) {
    if (!text) return [];
    
    // Convert to lowercase and remove punctuation
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    
    // Split into words and filter short words
    return cleanText.split(/\s+/).filter(word => word.length >= 2);
  }

  /**
   * Add message to index
   */
  indexMessage(messageId, content) {
    const words = this.extractWords(content);
    
    for (const word of words) {
      if (!this.index.has(word)) {
        this.index.set(word, new Set());
      }
      this.index.get(word).add(messageId);
    }
  }

  /**
   * Remove message from index
   */
  removeFromIndex(messageId, content) {
    const words = this.extractWords(content);
    
    for (const word of words) {
      const messageSet = this.index.get(word);
      if (messageSet) {
        messageSet.delete(messageId);
        if (messageSet.size === 0) {
          this.index.delete(word);
        }
      }
    }
  }

  /**
   * Update message in index
   */
  updateInIndex(messageId, oldContent, newContent) {
    this.removeFromIndex(messageId, oldContent);
    this.indexMessage(messageId, newContent);
  }

  /**
   * Search messages by query
   */
  search(query, limit = 50) {
    if (!query || query.length < 2) return [];
    
    const searchWords = this.extractWords(query);
    if (searchWords.length === 0) return [];
    
    // Find messages that contain all search words
    let resultSets = null;
    
    for (const word of searchWords) {
      const messageSet = this.index.get(word);
      if (!messageSet) {
        return []; // Word not found
      }
      
      if (resultSets === null) {
        resultSets = new Set(messageSet);
      } else {
        resultSets = new Set([...resultSets].filter(id => messageSet.has(id)));
      }
    }
    
    if (!resultSets) return [];
    
    return Array.from(resultSets).slice(0, limit);
  }

  /**
   * Get search suggestions for partial query
   */
  getSuggestions(partialQuery, limit = 5) {
    if (!partialQuery || partialQuery.length < 2) return [];
    
    const query = partialQuery.toLowerCase();
    const suggestions = [];
    
    for (const [word, messageSet] of this.index.entries()) {
      if (word.startsWith(query) && suggestions.length < limit) {
        suggestions.push({
          word,
          count: messageSet.size
        });
      }
    }
    
    return suggestions.sort((a, b) => b.count - a.count);
  }

  /**
   * Get index statistics
   */
  getStats() {
    return {
      uniqueWords: this.index.size,
      totalMessages: Array.from(this.index.values()).reduce(
        (sum, set) => sum + set.size,
        0
      ),
      isInitialized: this.isInitialized
    };
  }

  /**
   * Clear index
   */
  clear() {
    this.index.clear();
    this.isInitialized = false;
  }

  /**
   * Rebuild index
   */
  async rebuild() {
    console.log('🔨 Rebuilding search index...');
    this.clear();
    await this.initialize();
    console.log('✅ Search index rebuilt');
  }
}

// Singleton instance
const searchIndexer = new SearchIndexer();

/**
 * Initialize search indexer
 */
export async function initSearchIndexer() {
  await searchIndexer.initialize();
}

/**
 * Index a new message
 */
export async function indexMessage(messageId, content) {
  searchIndexer.indexMessage(messageId, content);
}

/**
 * Remove message from index
 */
export async function removeFromIndex(messageId, content) {
  searchIndexer.removeFromIndex(messageId, content);
}

/**
 * Update message in index
 */
export async function updateInIndex(messageId, oldContent, newContent) {
  searchIndexer.updateInIndex(messageId, oldContent, newContent);
}

/**
 * Search messages
 */
export async function searchMessages(query, limit = 50) {
  return searchIndexer.search(query, limit);
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(partialQuery, limit = 5) {
  return searchIndexer.getSuggestions(partialQuery, limit);
}

/**
 * Get search index stats
 */
export async function getSearchIndexStats() {
  return searchIndexer.getStats();
}

/**
 * Rebuild search index
 */
export async function rebuildSearchIndex() {
  await searchIndexer.rebuild();
}

/**
 * Index all messages (for batch processing)
 */
export async function indexAllMessages() {
  console.log('📚 Indexing all messages...');
  
  let cursor = null;
  let indexed = 0;
  const batchSize = 1000;
  
  while (true) {
    const messages = await prisma.message.findMany({
      where: {
        isDeletedForUsers: false,
        content: { not: null }
      },
      select: {
        id: true,
        content: true
      },
      take: batchSize,
      ...(cursor && { cursor: { id: cursor }, skip: 1 })
    });
    
    if (messages.length === 0) break;
    
    for (const message of messages) {
      searchIndexer.indexMessage(message.id, message.content);
      indexed++;
    }
    
    cursor = messages[messages.length - 1].id;
  }
  
  console.log(`✅ Indexed ${indexed} messages`);
  return indexed;
}