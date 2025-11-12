/**
 * API Queue System
 * Manages concurrent API calls to prevent rate limiting
 * Handles high volume of requests (50+) gracefully
 * Processes requests sequentially with adaptive delays
 */

class APIQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.concurrentRequests = 0;
    this.maxConcurrent = 1; // Process ONE request at a time to prevent rate limiting
    this.baseDelay = 1500; // Base delay: 1.5 seconds between requests
    this.adaptiveDelay = 1500; // Adaptive delay that increases with queue size
    this.pendingRequests = new Map(); // Track pending requests by key to prevent duplicates
    this.failedRequests = new Map(); // Track failed requests to prevent retry loops
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: null,
      isOpen: false,
      threshold: 5, // Open circuit after 5 failures
      resetTimeout: 30000 // Reset after 30 seconds
    };
  }

  /**
   * Check circuit breaker status
   */
  checkCircuitBreaker() {
    if (this.circuitBreaker.isOpen) {
      const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime;
      if (timeSinceLastFailure > this.circuitBreaker.resetTimeout) {
        // Reset circuit breaker
        console.log('[APIQueue] Circuit breaker reset - resuming requests');
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failures = 0;
        return false; // Circuit is closed, can proceed
      }
      return true; // Circuit is open, block requests
    }
    return false; // Circuit is closed, can proceed
  }

  /**
   * Record failure for circuit breaker
   */
  recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.isOpen = true;
      console.warn(`[APIQueue] Circuit breaker OPEN - too many failures (${this.circuitBreaker.failures}). Will reset in ${this.circuitBreaker.resetTimeout / 1000}s`);
    }
  }

  /**
   * Record success for circuit breaker
   */
  recordSuccess() {
    if (this.circuitBreaker.failures > 0) {
      this.circuitBreaker.failures = Math.max(0, this.circuitBreaker.failures - 1);
    }
  }

  /**
   * Calculate adaptive delay based on queue size
   */
  getAdaptiveDelay() {
    const queueSize = this.queue.length;
    // Increase delay as queue grows: 1.5s base + 0.5s per 10 items in queue (max 5s)
    const additionalDelay = Math.min(queueSize * 50, 3500); // Max 3.5s additional
    return this.baseDelay + additionalDelay;
  }

  /**
   * Add request to queue
   * @param {string} key - Unique key to prevent duplicate requests
   * @param {Function} requestFn - Function that returns a Promise
   * @returns {Promise}
   */
  async enqueue(key, requestFn) {
    // Check circuit breaker
    if (this.checkCircuitBreaker()) {
      const waitTime = this.circuitBreaker.resetTimeout - (Date.now() - this.circuitBreaker.lastFailureTime);
      console.warn(`[APIQueue] Circuit breaker is OPEN - request "${key}" will be rejected. Wait ${Math.ceil(waitTime / 1000)}s`);
      return Promise.reject(new Error(`Circuit breaker is open. Please wait ${Math.ceil(waitTime / 1000)} seconds.`));
    }

    // If same request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      console.log(`[APIQueue] Request with key "${key}" already pending, returning existing promise`);
      return this.pendingRequests.get(key);
    }

    // If request failed recently, don't retry immediately
    if (this.failedRequests.has(key)) {
      const failedTime = this.failedRequests.get(key);
      const timeSinceFailure = Date.now() - failedTime;
      if (timeSinceFailure < 10000) { // Don't retry for 10 seconds
        console.log(`[APIQueue] Request "${key}" failed recently, skipping retry (${Math.ceil((10000 - timeSinceFailure) / 1000)}s remaining)`);
        return Promise.reject(new Error('Request failed recently, please wait before retrying'));
      } else {
        // Remove from failed list after timeout
        this.failedRequests.delete(key);
      }
    }

    return new Promise((resolve, reject) => {
      const request = {
        key,
        requestFn,
        resolve,
        reject,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: 2
      };

      this.queue.push(request);
      
      // Create promise that will be resolved/rejected when request completes
      const requestPromise = new Promise((res, rej) => {
        request.resolve = res;
        request.reject = rej;
      });
      
      this.pendingRequests.set(key, requestPromise);

      // Log queue status
      if (this.queue.length > 10) {
        console.log(`[APIQueue] Queue size: ${this.queue.length} requests pending`);
      }

      this.processQueue();
    });
  }

  /**
   * Process queue sequentially with adaptive delays
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    // Check circuit breaker
    if (this.checkCircuitBreaker()) {
      // Wait before checking again
      setTimeout(() => this.processQueue(), 5000);
      return;
    }

    if (this.concurrentRequests >= this.maxConcurrent) {
      // Wait a bit before checking again
      const delay = this.getAdaptiveDelay();
      setTimeout(() => this.processQueue(), delay);
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.concurrentRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      this.concurrentRequests++;

      try {
        // Execute request with retry logic
        let result;
        let lastError;
        
        for (let attempt = 0; attempt <= request.maxRetries; attempt++) {
          try {
            result = await request.requestFn();
            // Success - record it and break
            this.recordSuccess();
            break;
          } catch (error) {
            lastError = error;
            
            // If 429 (rate limit), wait longer before retry
            if (error.response?.status === 429) {
              if (attempt < request.maxRetries) {
                const retryDelay = Math.min(5000 * (attempt + 1), 15000); // 5s, 10s, 15s
                console.log(`[APIQueue] Rate limit (429) for "${request.key}", retrying in ${retryDelay}ms (attempt ${attempt + 1}/${request.maxRetries + 1})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
              }
            } else {
              // For other errors, don't retry
              break;
            }
          }
        }

        if (result) {
          request.resolve(result);
          this.pendingRequests.delete(request.key);
          this.failedRequests.delete(request.key); // Remove from failed list on success
        } else {
          // All retries failed
          this.recordFailure();
          this.failedRequests.set(request.key, Date.now());
          request.reject(lastError);
          this.pendingRequests.delete(request.key);
        }
      } catch (error) {
        // Unexpected error
        this.recordFailure();
        this.failedRequests.set(request.key, Date.now());
        request.reject(error);
        this.pendingRequests.delete(request.key);
      } finally {
        this.concurrentRequests--;
        
        // Calculate adaptive delay based on queue size
        const delay = this.getAdaptiveDelay();
        
        // Wait before processing next request
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.processing = false;

    // Continue processing if queue is not empty
    if (this.queue.length > 0) {
      const delay = this.getAdaptiveDelay();
      setTimeout(() => this.processQueue(), delay);
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
      pendingRequests: this.pendingRequests.size,
      failedRequests: this.failedRequests.size,
      circuitBreaker: {
        isOpen: this.circuitBreaker.isOpen,
        failures: this.circuitBreaker.failures,
        lastFailureTime: this.circuitBreaker.lastFailureTime
      },
      adaptiveDelay: this.getAdaptiveDelay()
    };
  }

  /**
   * Reset circuit breaker manually
   */
  resetCircuitBreaker() {
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailureTime = null;
    console.log('[APIQueue] Circuit breaker manually reset');
  }
}

// Global queue instance
export const apiQueue = new APIQueue();

