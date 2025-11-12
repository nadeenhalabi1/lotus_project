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
    this.delayBetweenRequests = 2000; // 2 seconds between requests to spread token usage
    this.activeRequests = 0;
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
        // Add delay before processing (except first request)
        if (this.queue.length > 0 || this.activeRequests > 1) {
          await new Promise(resolve => setTimeout(resolve, this.delayBetweenRequests));
        }

        const result = await item.requestFn();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      } finally {
        this.activeRequests--;
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

