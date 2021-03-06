// Not being used anymore
// Keeping for reference for the time being

const Util = require('./util.js');
const util = new Util();

class Square {
  constructor(centerX, centerY, width, height, color, colliders, ctx) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.width = width;
    this.height = height;
    this.color = color;

    this.colliders = colliders;

    this.moveX = 0;
    this.velX = 0;
    this.moveSpeed = 4;
    this.groundAcc = 0.105;
    this.airAcc = 0.045;

    this.velY = 0;
    this.minJumpVel = -3;
    this.maxJumpVel = -7.25;
    this.grav = 0.2;

    this.grounded = false;

    this.leftHeld = false;
    this.rightHeld = false;
    this.jumpPressed = false;

    this.ctx = ctx;
  }

  update(ctx) {
    this.handleInput();
    this.movePos();
    this.render(ctx);
    this.collisions(ctx);
  }

  handleInput() {
    if (!this.leftHeld && !this.rightHeld) {
      this.moveX = 0;
    }
    if (this.leftHeld && !this.rightHeld) {
      this.moveX = -1;
    }
    if (this.rightHeld && !this.leftHeld) {
      this.moveX = 1;
    }
    if (this.jumpPressed) {
      this.jump();
      this.jumpPressed = false;
    }
  }

  calcVelX() {
    if (this.grounded) {
      this.velX = util.lerp(this.velX, this.moveX, this.groundAcc);
    } else {
      this.velX = util.lerp(this.velX, this.moveX, this.airAcc);
    }
  }

  calcVelY() {
    this.velY += this.grav;
  }

  minJump() {
    if (this.velY < this.minJumpVel) {
      this.velY = this.minJumpVel;
    }
  }

  jump() {
    if (this.grounded) {
      this.velY = this.maxJumpVel;
    }
  }

  movePos() {
    this.calcVelX();
    this.centerX += (this.velX * this.moveSpeed);

    this.calcVelY();
    this.centerY += this.velY;
  }

  //---

  collisions(ctx) {
    this.horizontalCollisions(ctx);
    this.grounded = this.verticalCollisions(ctx);
  }

  horizontalCollisions(ctx) {
    const amount = 4;
    //Prevents a hit with a collider below the square
    const skin = 0.5;

    for (var i = 0; i < amount; i++) {
      let startX = 0;
      let endX = 0;

      let spacing = (i * ((this.height - skin) / (amount - 1)));

      if (this.velX > 0) {
        startX = [this.calcCenter()[0] + (this.width / 2), this.centerY + spacing];
        endX = [this.calcCenter()[0] + (this.width / 2) + Math.abs(this.velX), this.centerY + spacing];
      } else {
        startX = [this.calcCenter()[0] - (this.width / 2), this.centerY + spacing];
        endX = [this.calcCenter()[0] - (this.width / 2) - Math.abs(this.velX), this.centerY + spacing];
      }

      let hit = this.raycast(startX, endX, ctx, 'horizontal');

      if (hit) {
        if (this.velX > 0) {
          this.centerX = (hit.collider.calcCenter()[0] - hit.collider.width / 2) - this.width;
        } else {
          this.centerX = (hit.collider.calcCenter()[0] + hit.collider.width / 2);
        }
        this.velX = 0;
      }
    }
  }

  verticalCollisions(ctx) {
    const amount = 4;

    let anyCollisions = false;

    for (var i = 0; i < amount; i++) {
      let startY = 0;
      let endY = 0;

      let spacing = (i * (this.width / (amount - 1)));

      if (this.velY > 0) {
        startY = [this.centerX + spacing, this.calcCenter()[1] + (this.height / 2)];
        endY = [this.centerX + spacing, this.calcCenter()[1] + (this.height / 2) + Math.abs(this.velY)];
      } else {
        startY = [this.centerX + spacing, this.calcCenter()[1] - (this.height / 2)];
        endY = [this.centerX + spacing, this.calcCenter()[1] - (this.height / 2) - Math.abs(this.velY)];
      }

      let hit = this.raycast(startY, endY, ctx, 'vertical');

      if (hit) {
        if (this.velY > 0) {
          this.centerY = (hit.collider.calcCenter()[1] - hit.collider.height / 2) - this.height;
        } else {
          this.centerY = (hit.collider.calcCenter()[1] + hit.collider.height / 2);
        }

        anyCollisions = true;
        this.velY = 0;
      }

    }
    return anyCollisions;
  }

  checkCollision(point, type) {
    //checks if point is within any of the colliders
    let collision = false;

    for (var i = 0; i < this.colliders.length; i++) {
      if (point[1] > this.colliders[i].calcCenter()[1] - (this.colliders[i].height / 2) && point[1] < this.colliders[i].calcCenter()[1] + (this.colliders[i].height / 2)) {
        if (point[0] > this.colliders[i].calcCenter()[0] - (this.colliders[i].width / 2) && point[0] < this.colliders[i].calcCenter()[0] + (this.colliders[i].width / 2)) {
          return { collider: this.colliders[i]};
        }
      }
    }
  }

  //---

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.centerX, this.centerY, this.width, this.height);
  }

  calcCenter() {
    return [this.centerX + (this.width / 2), this.centerY + (this.height / 2)];
  }

  raycast(start, end, ctx, type) {
    if (type !== 'grounded') {
      this.renderRaycast(start, end, 'red', ctx);
    }
    return this.checkCollision(end, type);
  }

  renderRaycast(start, end, color, ctx) {
    ctx.beginPath();
    ctx.moveTo(start[0], start[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.stroke();
  }

}

module.exports = Square;
