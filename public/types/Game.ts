export type GameStatusType = 'none' | 'ready' | 'countdown' | 'playing' | 'gameOver';

export type RectangleType = {
  x: number,
  y: number,
  width: number,
  height: number,
  color: { fill: string },
};

export type PlayerPositionType = 'LEFT' | 'RIGHT';

export type EmitStatusType = {
  status: GameStatusType,
  object: RectangleType,
};
