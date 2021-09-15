/* eslint-disable no-use-before-define */
import SETTINGS from '../../myProject/SETTINGS';
import { DynamicType, ServeType } from '../types/Ball';
import { RectangleType } from '../types/Game';
import BaseObject from './BaseObject';
import Point from './Point';
import Room from './Room';

export enum CollusionType {
  NO_COLLUSION = -1,
  UP,
  RIGHT,
  DOWN,
  LEFT,
  SMASH_TYPE_1,
  SMASH_TYPE_2,
  STRAIGHT,
}

export enum Quadrant { FIRST = 1, SECOND, THIRD, FOURTH }

export const TO = {
  RIGHT: 'RIGHT', LEFT: 'LEFT', UP: 'UP', DOWN: 'DOWN',
};

export default class Ball extends BaseObject {
  playerId: string[];

  speed: number;

  boostCount: number;

  boostCountMax: number;

  serve: ServeType;

  dynamic: DynamicType | null;

  constructor(leftPlayerId: string, rightPlayerId: string) {
    super();
    this.playerId = [leftPlayerId, rightPlayerId];
    this.speed = SETTINGS.BALL.DEFAULT_SPEED;
    this.boostCount = 0;
    this.boostCountMax = 100;
    this.dynamic = null;
    this.serve = serve(leftPlayerId, -1);
    this.object = {
      x: SETTINGS.WIDTH / 2,
      y: SETTINGS.HEIGHT / 2,
      width: SETTINGS.BALL.WIDTH,
      height: SETTINGS.BALL.HEIGHT,
      color: { fill: '#000000' },
    };
    super.update = this.setUpdate;
  }

  setUpdate(room: Room): void {
    const ball = this.object;
    const keys = Object.keys(room.players);
    let playerStat: RectangleType;
    if (this.serve && this.serve.isOn) {
      keys.forEach((key) => {
        const object = room.players[key];
        if (object.id === this.serve.player) {
          playerStat = room.players[object.id].object;
          ball.y = playerStat.y;
          if (playerStat.x < SETTINGS.WIDTH / 2) {
            ball.x = playerStat.x + ball.width / 2 + playerStat.width / 2;
          } else {
            ball.x = playerStat.x - ball.width / 2 - playerStat.width / 2;
          }
          if (room.status === 'playing') this.serve.count -= 1;
          if (room.status === 'playing' && this.serve.count < 0) {
            this.serve.isOn = false;
            let newAngle: number;
            if (playerStat.x < SETTINGS.WIDTH / 2 && playerStat.y < SETTINGS.HEIGHT / 2) {
              newAngle = -SETTINGS.SERVE_ANGLE;
            } else if (playerStat.x < SETTINGS.WIDTH / 2 && playerStat.y > SETTINGS.HEIGHT / 2) {
              newAngle = +SETTINGS.SERVE_ANGLE;
            } else if (playerStat.x < SETTINGS.WIDTH / 2 && playerStat.y === SETTINGS.HEIGHT / 2) {
              newAngle = getRandomSign() * SETTINGS.SERVE_ANGLE;
            } else if (playerStat.x > SETTINGS.WIDTH / 2 && playerStat.y < SETTINGS.HEIGHT / 2) {
              newAngle = 180 + SETTINGS.SERVE_ANGLE;
            } else if (playerStat.x > SETTINGS.WIDTH / 2 && playerStat.y > SETTINGS.HEIGHT / 2) {
              newAngle = 180 - SETTINGS.SERVE_ANGLE;
            } else if (playerStat.x > SETTINGS.WIDTH / 2 && playerStat.y === SETTINGS.HEIGHT / 2) {
              newAngle = 180 + getRandomSign() * SETTINGS.SERVE_ANGLE;
            }
            this.dynamic = angleToVelocity(newAngle);
          }
        }
      });
    } else if (room.status === 'playing') {
      if (this.boostCount > 0) {
        this.boostCount -= 1;
        let boost;
        if (this.boostCount > (this.boostCountMax / 2)) {
          this.object.color.fill = '#FF0000';
          boost = 2 * this.speed;
        } else {
          this.object.color.fill = '#000000';
          boost = 2 * this.speed * ((this.boostCount * 2) / this.boostCountMax);
        }
        ball.x += this.dynamic.xVel * (this.speed + boost);
        ball.y += this.dynamic.yVel * (this.speed + boost);
      } else {
        ball.x += this.dynamic.xVel * this.speed;
        ball.y += this.dynamic.yVel * this.speed;
      }
      if (ball.x <= 0 - ball.width * 2) {
        // eslint-disable-next-line no-param-reassign
        room.players[this.playerId[1]].score += 1;
        this.serve = serve(this.playerId[0]);
        ball.color.fill = '#000000';
        this.boostCount = 0;
      }
      if (ball.x >= SETTINGS.WIDTH + ball.width * 2) {
        // eslint-disable-next-line no-param-reassign
        room.players[this.playerId[0]].score += 1;
        this.serve = serve(this.playerId[1]);
        ball.color.fill = '#000000';
        this.boostCount = 0;
      }
      if (ball.y - ball.height / 2 <= 0 + SETTINGS.BORDER_WIDTH) {
        this.dynamic = bounce(0, this.dynamic.angle);
      }

      if (ball.y + ball.height / 2 >= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH) {
        this.dynamic = bounce(0, this.dynamic.angle);
      }

      keys.forEach((key) => {
        playerStat = room.players[key].object;
        const collusion = ballCollusionCheck(ball, playerStat, this.dynamic.angle);

        switch (collusion) {
          case CollusionType.NO_COLLUSION:
            break;
          case CollusionType.UP:
            if (getUpDown(this.dynamic.angle) === TO.DOWN) {
              this.dynamic = bounce(0, this.dynamic.angle);
            } else this.dynamic = angleToVelocity(this.dynamic.angle - 5);
            // console.log("UP");
            break;
          case CollusionType.DOWN:
            if (getUpDown(this.dynamic.angle) === TO.UP) {
              this.dynamic = bounce(0, this.dynamic.angle);
            } else this.dynamic = angleToVelocity(this.dynamic.angle + 5);
            // console.log("DOWN");
            break;
          case CollusionType.LEFT:
            if (getLeftRight(this.dynamic.angle) === TO.RIGHT) {
              this.dynamic = bounce(90, this.dynamic.angle);
            }
            // console.log("LEFT");
            break;
          case CollusionType.RIGHT:
            if (getLeftRight(this.dynamic.angle) === TO.LEFT) {
              this.dynamic = bounce(90, this.dynamic.angle);
            }
            // console.log("RIGHT");
            break;
          case CollusionType.SMASH_TYPE_1:
            this.dynamic = smash(this.dynamic.angle);
            this.boostCount = this.boostCountMax;
            // console.log("SMASH_TYPE_1");
            break;
          case CollusionType.SMASH_TYPE_2:
            this.dynamic = slide(this.dynamic.angle);
            this.boostCount = this.boostCountMax;
            // console.log("SMASH_TYPE_2");
            break;
          case CollusionType.STRAIGHT:
            this.dynamic = straight(this.dynamic.angle);
            // console.log("STRAIGHT");
            break;
          default:
            break;
        }
      });
    }
  }
}

function straight(angle: number) {
  let newAngle = getBouncedAngle(90, angle);
  if (angle === 180 || angle === 0) {
    newAngle = getRandomSign() * SETTINGS.STRAIGHT_ADJUST;
  } else {
    const adj = getRandomSign() * SETTINGS.STRAIGHT_ADJUST;
    switch (getQuadrant(newAngle)) {
      case Quadrant.FIRST:
      case Quadrant.THIRD:
        newAngle += adj;
        break;
      case Quadrant.SECOND:
      case Quadrant.FOURTH:
      default:
        newAngle -= adj;
        break;
    }
  }
  return angleToVelocity(newAngle);
}

function serve(playerId: string, count?: number) {
  return {
    isOn: true,
    player: playerId,
    count: count || 100,
  };
}

function bounce(surfaceAngle: number, angle: number) {
  const newAngle = getBouncedAngle(surfaceAngle, angle);
  return angleToVelocity(newAngle);
}

function getBouncedAngle(surfaceAngle: number, angle: number) {
  return surfaceAngle * 2 - angle;
}

function slide(angle: number) {
  let newAngle = getBouncedAngle(90, angle);
  const adj = SETTINGS.EDGE_SHOOT_ANGLE_ADJUST;
  switch (getQuadrant(newAngle)) {
    case Quadrant.FIRST:
    case Quadrant.THIRD:
      newAngle += adj;
      break;
    case Quadrant.SECOND:
    case Quadrant.FOURTH:
    default:
      newAngle -= adj;
      break;
  }
  return angleToVelocity(newAngle);
}

function smash(angle: number) {
  let newAngle = trimAngle(angle + 180);
  const adj = SETTINGS.EDGE_SHOOT_ANGLE_ADJUST;
  switch (getQuadrant(newAngle)) {
    case Quadrant.FIRST:
    case Quadrant.THIRD:
      newAngle -= adj;
      break;
    case Quadrant.SECOND:
    case Quadrant.FOURTH:
    default:
      newAngle += adj;
      break;
  }
  return angleToVelocity(newAngle);
}

function trimAngle(argAngle: number) {
  let angle = argAngle % 360;
  if (angle < 0) angle += 360;
  return angle;
}

function angleToVelocity(angle) {
  return {
    angle: trimAngle(angle),
    xVel: Math.cos((angle / 180) * Math.PI),
    yVel: -Math.sin((angle / 180) * Math.PI),
  };
}

function ballCollusionCheck(ballStat, playerStat: RectangleType, angle: number): CollusionType {
  const ballAngle = trimAngle(angle);
  const points = [
    new Point(ballStat.x - ballStat.width / 2, ballStat.y - ballStat.height / 2),
    new Point(ballStat.x + ballStat.width / 2, ballStat.y - ballStat.height / 2),
    new Point(ballStat.x - ballStat.width / 2, ballStat.y + ballStat.height / 2),
    new Point(ballStat.x + ballStat.width / 2, ballStat.y + ballStat.height / 2),
  ];
  const collusions = [];
  points.forEach((point) => {
    if (pointSquareCollusionCheck(point.x, point.y, playerStat)) {
      collusions.push(new Point(point.x, point.y));
    }
  });
  let type = CollusionType.NO_COLLUSION;
  const sAngle = SETTINGS.STRAIGHT_ANGLE;
  const eAngle = SETTINGS.EDGE_ANGLE;

  if (collusions.length === 0) return type;
  const p2bAngle = getAngle(playerStat, ballStat);
  const p2bLeftRight = getLeftRight(p2bAngle);
  const p2bUpDown = getUpDown(p2bAngle);
  const bLeftRight = getLeftRight(ballAngle);
  const bUpDown = getUpDown(ballAngle);
  switch (collusions.length) {
    case 1:
      if (bLeftRight === p2bLeftRight) {
        type = (p2bUpDown === TO.UP) ? CollusionType.UP : CollusionType.DOWN;
      } else if ((ballAngle > eAngle && ballAngle < 180 - eAngle)
        || (ballAngle > 180 + eAngle && ballAngle < 360 - eAngle)) {
        type = (bUpDown !== p2bUpDown) ? CollusionType.SMASH_TYPE_1 : CollusionType.SMASH_TYPE_2;
      } else type = (p2bLeftRight === TO.LEFT) ? CollusionType.LEFT : CollusionType.RIGHT;
      break;
    case 2:
      if (collusions[0].x === collusions[1].x) {
        if (ballAngle < sAngle || ballAngle > 360 - sAngle
          || (ballAngle < 180 + sAngle && ballAngle > 180 - sAngle)) {
          type = CollusionType.STRAIGHT;
        } else type = (p2bLeftRight === TO.LEFT) ? CollusionType.LEFT : CollusionType.RIGHT;
      } else {
        type = (p2bUpDown === TO.UP) ? CollusionType.UP : CollusionType.DOWN;
      }
      break;
    case 3: // it will never happen
    case 4: // you can put recursive function here if you want to be perfect
    default:
      break;
  }
  return type;
}

function getQuadrant(argAngle: number) {
  const angle = trimAngle(argAngle);
  if (angle >= 0 && angle < 90) {
    return Quadrant.FIRST;
  } if (angle >= 90 && angle < 180) {
    return Quadrant.SECOND;
  } if (angle >= 180 && angle < 270) {
    return Quadrant.THIRD;
  }
  return Quadrant.FOURTH;
}

function getLeftRight(argAngle: number) {
  const angle = trimAngle(argAngle);
  if (angle < 90 || angle > 270) return TO.RIGHT;
  return TO.LEFT;
}

function getUpDown(argAngle: number) {
  const angle = trimAngle(argAngle);
  if (angle > 0 && angle < 180) return TO.UP;
  return TO.DOWN;
}

function getAngle(player: RectangleType, end: Point) {
  let angle = (Math.atan(-(end.y - player.y) / (end.x - player.x)) / Math.PI) * 180;
  if (player.x > end.x) {
    angle += Math.sign(angle) * 180;
  }
  if (angle < 0) angle += 360;
  return angle;
}

function getRandomSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

function pointSquareCollusionCheck(x: number, y: number, square: RectangleType) {
  if (x >= square.x - square.width / 2
    && x <= square.x + square.width / 2
    && y >= square.y - square.height / 2
    && y <= square.y + square.height / 2) return true;
  return false;
}
