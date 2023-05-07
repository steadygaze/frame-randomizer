export interface ProducerQueueOptions {
  length: number;
}

export class ProducerQueue<Type> {
  produceFn: () => Promise<Type>;
  queue: Array<Promise<Type>>;

  constructor(
    produceFn: () => Promise<Type>,
    { length }: ProducerQueueOptions
  ) {
    this.produceFn = produceFn;
    this.queue = [];
    for (let i = 0; i < length; ++i) {
      this.queue.push(produceFn());
    }
  }

  next(): Promise<Type> {
    this.queue.push(this.produceFn());
    return this.queue.shift()!;
  }
}
