import pLimit from "p-limit";
import type { LimitFunction } from "p-limit";
import { logger } from "./logger";

export interface ProducerQueueOptions {
  totalLength: number;
  perKindMinimum: number;
  maxPending: number;
  maxRetries: number;
  // How many extra items to queue when exhausted.
  queueExhaustionQueueCount: number;
}

export interface PerKindOptions<Type> {
  produceFn: () => Promise<Type>;
  preproduced: Array<Type>;
}

export interface ProducerFnData<Type> {
  produceFn: () => Promise<Type>;
  trafficCounter: number;
  queue: Array<Promise<Type>>;
}

export class ProducerQueue<Type> {
  options: ProducerQueueOptions;
  pendingCount: number;
  byKindData: Record<string, ProducerFnData<Type>>;
  limit: LimitFunction;
  trafficSum: number;
  queueSum: number;

  constructor(
    produceFns: Record<string, PerKindOptions<Type>>,
    options: ProducerQueueOptions,
  ) {
    if (!Object.keys(produceFns).length) {
      throw new Error("At least one kind to produce is required");
    }

    this.options = options;
    this.pendingCount = 0;
    this.byKindData = Object.fromEntries(
      Object.entries(produceFns).map(([kind, { produceFn, preproduced }]) => [
        kind,
        {
          produceFn,
          trafficCounter: 0,
          queue: preproduced.map((e) => Promise.resolve(e)),
        },
      ]),
    );
    this.trafficSum = 0;
    this.queueSum = Array.from(
      Object.values(this.byKindData),
      ({ queue }) => queue.length,
    ).reduce((prev, cur) => prev + cur);

    this.limit = pLimit(options.maxPending);
    for (let i = 0; i < options.totalLength - this.queueSum; ++i) {
      this.enqueueJob();
    }

    this.topUpPerKind();
    this.topUpAllKinds();
    setInterval(() => {
      const pendingCount = this.limit.pendingCount;
      if (pendingCount > 0) {
        logger.warn(
          `Jobs queueing due to job limit: ${pendingCount} queued, ${this.limit.activeCount} active`,
        );
      }

      this.topUpPerKind();
      this.topUpAllKinds();
    }, 10000);

    this.logQueueStatus();
    setInterval(() => this.logQueueStatus(), 300000);
  }

  /**
   * Per-kind top up. It's important this happens before the general top-up.
   */
  topUpPerKind() {
    for (const [kind, kindData] of Object.entries(this.byKindData)) {
      const queueLength = kindData.queue.length;
      const minimum = this.options.perKindMinimum;
      if (kindData.queue.length < this.options.perKindMinimum) {
        logger.info(`Topping up kind queue "${kind}" due to minimum`, {
          kind,
          queueLength,
          minimum,
        });
        for (let i = 0; i < minimum - queueLength; ++i) {
          this.enqueueKind(kind);
        }
      }
    }
  }

  /**
   * Top up to desired length, using usage ratios.
   */
  topUpAllKinds() {
    if (this.queueSum < this.options.totalLength) {
      const n = this.options.totalLength - this.queueSum;
      logger.info("Queue total under threshold; topping up", {
        n,
        currentSize: this.queueSum,
        targetSize: this.options.totalLength,
      });

      for (let i = 0; i < n; ++i) {
        this.enqueueJob();
      }
    }
  }

  logQueueStatus(): void {
    logger.info("Queue status", {
      trafficSum: this.trafficSum,
      queueSum: this.queueSum,
      byKindData: Object.fromEntries(
        Object.entries(this.byKindData).map(
          ([kind, { trafficCounter, queue }]) => [
            kind,
            { trafficCounter, queueLength: queue.length },
          ],
        ),
      ),
      jobs: {
        activeCount: this.limit.activeCount,
        pendingCount: this.limit.pendingCount,
      },
    });
  }

  /**
   * Decide what kind of item to generate next. Do this by comparing how many
   * items are produced versus the ideal ratio based on traffic.
   * @returns Kind to produce.
   */
  decideKind(): string {
    return Object.entries(this.byKindData)
      .map(([kind, kindData]) => {
        const queueRatio = kindData.queue.length / this.queueSum;
        const trafficRatio = kindData.trafficCounter / this.trafficSum;
        return { kind, productionRatio: queueRatio - trafficRatio };
      })
      .reduce((previous, current) =>
        current.productionRatio < previous.productionRatio ? current : previous,
      ).kind;
  }

  enqueueKind(kind: string) {
    logger.verbose("Generating kind", { kind });
    const kindData = this.byKindData[kind];
    if (!kindData) {
      logger.error("kind is not a valid produced kind", { kind });
      throw new Error("kindData not found: " + kind);
    }

    // Call this.produceFns, but retry on failure.
    let retries = 0;
    const reProduce: () => Promise<Type> = () => {
      return kindData.produceFn().catch((error) => {
        logger.error(`Production error`, { kind, error, retries });
        if (retries >= this.options.maxRetries) {
          logger.error(
            "Production is failing consistently; this should never happen",
          );
          throw error;
        }
        ++retries;
        return reProduce();
      });
    };
    ++this.queueSum;
    kindData.queue.push(this.limit(reProduce));
  }

  enqueueJob() {
    this.enqueueKind(this.decideKind());
  }

  next(kind: string): Promise<Type> {
    const kindData = this.byKindData[kind];
    if (!kindData) {
      logger.error("kind is not a valid produced kind", { kind });
      throw new Error("kindData not found: " + kind);
    }
    ++kindData.trafficCounter;
    ++this.trafficSum;

    // Extras may be queued by topping up of specific kinds or from a prior
    // instance with a higher limit, so we must check before enqueuing more to
    // not keep growing the queue.
    if (this.queueSum < this.options.totalLength) {
      this.enqueueJob();
    }

    const initialResult = kindData.queue.shift();

    if (!kindData.queue.length) {
      logger.warn("Queue exhaustion for kind; enqueueing extras", {
        kind,
        extraEnqueueCount: this.options.queueExhaustionQueueCount,
      });
      for (let i = 0; i < this.options.queueExhaustionQueueCount; ++i) {
        this.enqueueKind(kind);
      }
    }
    --this.queueSum;

    return initialResult || kindData.queue.shift()!;
  }
}
