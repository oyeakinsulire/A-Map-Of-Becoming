let data;
let emotionalState = 0;
let targetState = 0;
let zoff = 0;

let overrideMode = false;
let overrideState = 0;

let ribbons = [];
let chaosPoints = [];

function preload() {
  data = loadTable("/amob_data.csv", "csv", "header"); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(30);
  background(0);

  for (let i = 0; i < 70; i++) {
    ribbons.push({
      y: random(height),
      offset: random(1000),
      thickness: random(0.5, 2),
      speed: random(0.001, 0.006)
    });
  }

  for (let i = 0; i < 450; i++) {
    chaosPoints.push(new ChaosPoint());
  }
}

function draw() {
  readState();

  if (emotionalState < 0.6) {
    drawCalmOcean();
  } else {
    drawChaosMirror();
  }

  displayText();
  zoff += emotionalState < 0.6 ? 0.002 : 0.12;
}

function readState() {
  if (overrideMode) {
    targetState = overrideState;
  } else {
    let rowIndex = frameCount % data.getRowCount();
    let row = data.getRow(rowIndex);

    let movement = row.getNum("movement");
    let sound = row.getNum("sound") / 100;

    targetState = constrain((movement * 0.55) + (sound * 0.45), 0, 1);
  }

  emotionalState = lerp(emotionalState, targetState, 0.08);
}


// CALM STATE

function drawCalmOcean() {
  background(2, 14, 35, 30);

  noStroke();
  fill(0, 90, 150, 15);
  ellipse(width * 0.5, height * 0.55, width * 1.6, height * 0.9);

  fill(70, 190, 255, 7);
  ellipse(width * 0.25, height * 0.25, width * 0.8, height * 0.45);

  noFill();

  for (let r of ribbons) {
    beginShape();
    stroke(90, 200, 255, 38);
    strokeWeight(r.thickness);

    let amplitude = 42;
    let frequency = 0.004;

    for (let x = -80; x <= width + 80; x += 20) {
      let n = noise(x * frequency, r.offset, zoff + r.offset);

      let y =
        r.y +
        map(n, 0, 1, -amplitude, amplitude) +
        sin(x * frequency * 2 + zoff * 8 + r.offset) * 12;

      curveVertex(x, y);
    }

    endShape();
    r.offset += r.speed;
  }

  drawCalmBreath();
}

function drawCalmBreath() {
  let breath = abs(sin(frameCount * 0.025));
  let pulse = pow(breath, 8);

  if (pulse > 0.65) {
    noFill();
    stroke(130, 220, 255, 14);
    strokeWeight(1);

    let size = map(pulse, 0.65, 1, 100, width * 0.75);
    ellipse(width / 2, height / 2, size, size * 0.45);
  }
}

//CHAOS STATE

function drawChaosMirror() {
  let intensity = map(emotionalState, 0.6, 1, 0, 1);

  background(0, 0, 0, 70);

  push();
  translate(width / 2, height / 2);

  if (intensity > 0.75) {
    translate(random(-10, 10) * intensity, random(-10, 10) * intensity);
  }

  drawRadialSpeedLines(intensity);
  drawMirroredNervousWeb(intensity);
  drawCardiacCore(intensity);

  pop();
}

function drawRadialSpeedLines(intensity) {
  let rays = floor(lerp(35, 150, intensity));

  for (let i = 0; i < rays; i++) {
    let angle = map(i, 0, rays, 0, TWO_PI);
    let wobble = random(-0.035, 0.035) * intensity;

    let inner = random(120, 260);
    let outer = random(width * 0.45, width * 0.85);

    stroke(255, random(60, 180) * intensity);
    strokeWeight(random(1, 5) * intensity);

    line(
      cos(angle + wobble) * inner,
      sin(angle + wobble) * inner,
      cos(angle + wobble) * outer,
      sin(angle + wobble) * outer
    );
  }
}

function drawMirroredNervousWeb(intensity) {
  let symmetry = 8;

  for (let s = 0; s < symmetry; s++) {
    push();
    rotate((TWO_PI / symmetry) * s);

    if (s % 2 === 1) {
      scale(1, -1);
    }

    for (let p of chaosPoints) {
      p.update(intensity);
      p.show(intensity);
    }

    pop();
  }
}

function drawCardiacCore(intensity) {
  noFill();

  let beat = abs(sin(frameCount * lerp(0.22, 0.95, intensity)));
  let pulse = pow(beat, 10);

  stroke(255, 220 * intensity);
  strokeWeight(lerp(1, 5, intensity));

  let rings = 4;

  for (let i = 0; i < rings; i++) {
    let size = map(pulse, 0, 1, 80, 360) + i * 80;
    ellipse(0, 0, size, size);
  }

  // sharp ECG rupture across centre
  stroke(255, 255);
  strokeWeight(lerp(1, 7, intensity));

  beginShape();

  for (let x = -width / 2; x <= width / 2; x += 14) {
    let spike = 0;

    if (random() < 0.18 * intensity) {
      spike = random(-260, 260) * intensity;
    }

    let y =
      sin(x * 0.03 + frameCount * 0.7) * 25 +
      noise(x * 0.01, zoff * 5) * 120 * intensity +
      spike;

    vertex(x, y);
  }

  endShape();
}

class ChaosPoint {
  constructor() {
    this.pos = p5.Vector.random2D().mult(random(60, 260));
    this.prev = this.pos.copy();
    this.vel = p5.Vector.random2D().mult(random(0.5, 2));
  }

  update(intensity) {
    this.prev = this.pos.copy();

    let angle =
      noise(this.pos.x * 0.01, this.pos.y * 0.01, zoff) *
        TWO_PI *
        8 +
      random(-3, 3) * intensity;

    let force = p5.Vector.fromAngle(angle);
    force.mult(lerp(0.3, 8, intensity));

    this.vel.add(force);
    this.vel.limit(lerp(2, 22, intensity));
    this.pos.add(this.vel);

    if (this.pos.mag() > min(width, height) * 0.36 || random() < 0.01) {
      this.reset();
    }
  }

  show(intensity) {
    stroke(255, random(45, 160) * intensity);
    strokeWeight(random(0.4, 2.8) * intensity);

    line(this.prev.x, this.prev.y, this.pos.x, this.pos.y);

    if (random() < 0.08 * intensity) {
      line(
        this.pos.x,
        this.pos.y,
        this.pos.x + random(-80, 80),
        this.pos.y + random(-80, 80)
      );
    }
  }

  reset() {
    this.pos = p5.Vector.random2D().mult(random(40, 220));
    this.prev = this.pos.copy();
    this.vel = p5.Vector.random2D().mult(random(1, 4));
  }
}

// ======================
// UI
// ======================

function displayText() {
  noStroke();
  fill(255, 150);
  textSize(24);

  text("A Map of Becoming", 30, 30);

  let label =
    emotionalState < 0.6
      ? "Serenity"
      : "Wanderer";

  text(label, 30, 60);
  text("state: " + nf(emotionalState, 1, 2), 30, 90);
  text("keys: 1 Solace(Calm) | 2 Wanderer(chaos) | 3 Real-Time Data", 30, 120);
}

function keyPressed() {
  if (key === "1") {
    overrideMode = true;
    overrideState = 0.02;
    emotionalState = 0.02;
  }

  if (key === "2") {
    overrideMode = true;
    overrideState = 1;
    emotionalState = 1;
  }

  if (key === "0") {
    overrideMode = false;
  }

  background(0);
}

function mousePressed() {
  background(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
