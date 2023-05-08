import { promisify } from "node:util";
const LOG_WAIT_MS = 10 * 1000;
const SPIN_WAIT_DELAY_MS = 1;
const sleep = promisify(setTimeout);

export interface ProducerQueueOptions {
  length: number;
  maxPending: number;
}

export class ProducerQueue<Type> {
  consumerPendingLogTs: number;
  maxPending: number;
  producerPendingLogTs: number;
  pendingCount: number;
  produceFn: () => Promise<Type>;
  queue: Array<Promise<Type>>;

  constructor(
    produceFn: () => Promise<Type>,
    { length, maxPending }: ProducerQueueOptions
  ) {
    this.consumerPendingLogTs = 0;
    this.maxPending = maxPending;
    this.pendingCount = 0;
    this.produceFn = produceFn;
    this.producerPendingLogTs = 0;
    this.queue = [];
    for (let i = 0; i < length; ++i) {
      this.readyEnqueueJob();
    }
  }

  async produce(): Promise<Type> {
    ++this.pendingCount;
    const result = await this.produceFn();
    --this.pendingCount;
    return result;
  }

  async readyEnqueueJob() {
    while (this.pendingCount >= this.maxPending) {
      const now = Date.now();
      if (now > this.producerPendingLogTs) {
        this.producerPendingLogTs = now + LOG_WAIT_MS;
        console.log(
          `Producer(s) waiting due to hitting pending job limit (${this.maxPending} jobs)`
        );
      }
      await sleep(SPIN_WAIT_DELAY_MS);
    }
    this.queue.push(this.produce());
  }

  async next(): Promise<Type> {
    this.readyEnqueueJob();
    while (this.queue.length <= 0) {
      const now = Date.now();
      if (now > this.consumerPendingLogTs) {
        this.consumerPendingLogTs = now + LOG_WAIT_MS;
        console.log(
          `Consumer(s) waiting due to hitting pending job limit (${this.maxPending} jobs)`
        );
      }
      await sleep(SPIN_WAIT_DELAY_MS);
      // There doesn't seem to be a way to FIFO-queue waiting, unfortunately.
    }
    return this.queue.shift()!;
  }
}
