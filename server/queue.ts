// eslint-disable-next-line import/named -- Can't find LimitFunction for some reason.
import pLimit, { LimitFunction } from "p-limit";
import logger from "./logger";

export interface ProducerQueueOptions {
  length: number;
  maxPending: number;
}

export class ProducerQueue<Type> {
  maxPending: number;
  pendingCount: number;
  produceFn: () => Promise<Type>;
  queue: Array<Promise<Type>>;
  limit: LimitFunction;

  constructor(
    produceFn: () => Promise<Type>,
    { length, maxPending }: ProducerQueueOptions,
  ) {
    this.maxPending = maxPending;
    this.pendingCount = 0;
    this.produceFn = produceFn;
    this.queue = [];

    this.limit = pLimit(this.maxPending);
    for (let i = 0; i < length; ++i) {
      this.enqueueJob();
    }

    setInterval(() => {
      const pendingCount = this.limit.pendingCount;
      if (pendingCount > 0) {
        logger.warn(
          `Jobs queueing due to job limit: ${pendingCount} queued, ${this.limit.activeCount} active`,
        );
      }
    }, 10000);
  }

  enqueueJob() {
    this.queue.push(this.limit(() => this.produceFn()));
  }

  next(): Promise<Type> {
    this.enqueueJob();
    return this.queue.shift()!;
  }
}
