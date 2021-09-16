import { RectangleType } from '../types/Game';

export default class CanvasManager {
  ctx: CanvasRenderingContext2D;

  settings;

  constructor(ctx: CanvasRenderingContext2D, settings) {
    this.ctx = ctx;
    this.settings = settings;
  }

  drawRect(rect: RectangleType): void {
    if (!rect.color) return;
    this.ctx.save();
    this.ctx.beginPath();

    this.ctx.globalAlpha = 1;
    if (rect.color.fill) {
      this.ctx.fillStyle = rect.color.fill;
      this.ctx.fillRect(rect.x - rect.width / 2, rect.y - rect.height / 2, rect.width, rect.height);
    }
    this.ctx.restore();
  }

  drawBackground(): void {
    this.ctx.save();
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = this.settings.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.settings.WIDTH, this.settings.HEIGHT);
    this.ctx.restore();
  }

  drawBorder(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.settings.WIDTH, this.settings.BORDER_WIDTH);
    this.ctx.fillRect(0, this.settings.HEIGHT - this.settings.BORDER_WIDTH,
      this.settings.WIDTH, this.settings.BORDER_WIDTH);
  }

  drawNet(): void {
    const num = 10;
    const height = this.settings.HEIGHT / ((num + 1) * 2);
    let y = height / 2;
    const x = (this.settings.WIDTH - this.settings.NET.WIDTH) / 2;
    this.ctx.fillStyle = '#000000';
    while (y < this.settings.HEIGHT) {
      this.ctx.fillRect(x, y, this.settings.NET.WIDTH, height);
      y += height * 2;
    }
  }
}
