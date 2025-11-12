/**
 * OpenAI Request Queue
 * Manages OpenAI API calls to prevent rate limiting
 * Processes requests sequentially with delays to stay under TPM limits
 */

class OpenAIQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.concurrency = 1; // Process ONE request at a time
    this.delayBetweenRequests = 800; // 0.8 seconds between requests to spread token usage (as per requirements)
    this.activeRequests = 0;
    this.lastRequestTime = 0; // Track last request time to ensure minimum delay
  }

  /**
   * Add request to queue
   * @param {Function} requestFn - Function that returns a Promise
   * @returns {Promise}
   */
  async enqueue(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        resolve,
        reject,
        timestamp: Date.now()
      });

      this.processQueue();
    });
  }

  /**
   * Process queue sequentially
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0 || this.activeRequests >= this.concurrency) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.concurrency) {
      const item = this.queue.shift();
      this.activeRequests++;

      try {
        // ⚠️ CRITICAL: Ensure minimum delay between requests to prevent rate limiting
        // Calculate time since last request
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const delayNeeded = Math.max(0, this.delayBetweenRequests - timeSinceLastRequest);
        
        if (delayNeeded > 0) {
          console.log(`[OpenAI Queue] Waiting ${delayNeeded}ms before processing next request (to prevent rate limits)`);
          await new Promise(resolve => setTimeout(resolve, delayNeeded));
        }
        
        // Update last request time
        this.lastRequestTime = Date.now();

        const result = await item.requestFn();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      } finally {
        this.activeRequests--;
        // Update last request time even on error to maintain rate limit spacing
        this.lastRequestTime = Date.now();
      }
    }

    this.processing = false;

    // Continue processing if queue is not empty
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), this.delayBetweenRequests);
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      activeRequests: this.activeRequests
    };
  }
}

// Global queue instance
export const openaiQueue = new OpenAIQueue();

