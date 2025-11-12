/**
 * API Queue System
 * Manages concurrent API calls to prevent rate limiting
 * Processes requests sequentially with delays
 */

class APIQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.concurrentRequests = 0;
    this.maxConcurrent = 2; // Max 2 concurrent requests
    this.delayBetweenRequests = 1000; // 1 second delay between requests
    this.pendingRequests = new Map(); // Track pending requests by key to prevent duplicates
  }

  /**
   * Add request to queue
   * @param {string} key - Unique key to prevent duplicate requests
   * @param {Function} requestFn - Function that returns a Promise
   * @returns {Promise}
   */
  async enqueue(key, requestFn) {
    // If same request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      console.log(`[APIQueue] Request with key "${key}" already pending, returning existing promise`);
      return this.pendingRequests.get(key);
    }

    return new Promise((resolve, reject) => {
      const request = {
        key,
        requestFn,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.queue.push(request);
      this.pendingRequests.set(key, new Promise((res, rej) => {
        request.resolve = res;
        request.reject = rej;
      }));

      this.processQueue();
    });
  }

  /**
   * Process queue sequentially
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    if (this.concurrentRequests >= this.maxConcurrent) {
      // Wait a bit before checking again
      setTimeout(() => this.processQueue(), this.delayBetweenRequests);
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.concurrentRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      this.concurrentRequests++;

      try {
        // Execute request
        const result = await request.requestFn();
        request.resolve(result);
        this.pendingRequests.delete(request.key);
      } catch (error) {
        request.reject(error);
        this.pendingRequests.delete(request.key);
      } finally {
        this.concurrentRequests--;
        
        // Wait before processing next request
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.delayBetweenRequests));
        }
      }
    }

    this.processing = false;

    // Continue processing if queue is not empty
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), this.delayBetweenRequests);
    }
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = [];
    this.pendingRequests.clear();
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      concurrentRequests: this.concurrentRequests,
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Global queue instance
export const apiQueue = new APIQueue();

