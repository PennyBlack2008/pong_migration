export default class Countdown {
  defaultCount: number;

  createdAt: number;

  action: () => void;

  constructor(count?: number) {
    this.defaultCount = count || 10;
    this.createdAt = Date.now();
    this.action = null;
  }

  update(): void {
    const count = this.defaultCount - Math.floor((Date.now() - this.createdAt) / 1000);
    if (count < 0) {
      this.action();
    }
  }
}
