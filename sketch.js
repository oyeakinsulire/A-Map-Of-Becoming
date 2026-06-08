let data;
let becoming = 0;
let destinationBecoming = 0;
let zoff = 0;

let overrideMode = false;
let overrideState = 0;

let started = false;

let calmCurrents = [];
let restlness = [];

function preload() {
  data = loadTable("amob_data.", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(30);
  background(0);

  for (let i = 0; i < 70; i++) {
    calmCurrents.push({
      y: random(height),
      offset: random(1000),
      thickness: random(0.5, 2),
      speed: random(0.001, 0.006)
    });
  }

  for (let i = 0; i < 450; i++) {
    restlness.push(new ChaosPoint());
  }
}

function draw() {
  if (!started) {
    drawStartScreen();
    return;
  }

  readState();

  if (becoming < 0.6) {
    drawStillness();
  } else {
    drawChaos();
  }

  displayText();
  zoff += becoming < 0.6 ? 0.002 : 0.12;
}

function drawStartScreen() {
  background(2, 14, 35);

  noStroke();

  fill(0, 90, 150, 35);
  ellipse(width / 2, height / 2, width * 0.9, height * 0.55);

  fill(70, 190, 255, 18);
  ellipse(width * 0.35, height * 0.35, width * 0.5, height * 0.3);

  textAlign(CENTER, CENTER);

  fill(255);
  textSize(160);
  textFont("Cormorant Garamond")
  textStyle(BOLD);
  text("A MAP OF BECOMING", width / 2, height / 2 - 90);

  textSize(60);
  fill(210, 235, 255);
  textFont("Cormorant Garamond")
  text( "An exploration of the space between\nrestlessness and tranquility.", width / 2, height / 2 + 80);

  textSize(40);
  fill(150, 215, 255);
  textFont("Cormorant Garamond")
  text("Press SPACE to begin", width / 2, height / 2 + 240);

  textAlign(LEFT, BASELINE);
}

function readState() {
  if (overrideMode) {
    destinationBecoming = overrideState;
  } else {
    let rowIndex = frameCount % data.getRowCount();
    let row = data.getRow(rowIndex);

    let movement = row.getNum("movement");
    let sound = row.getNum("sound") / 100;

    //
    destinationBecoming = constrain((movement * 0.7) + (sound * 0.3), 0, 1);
  }

  becoming = lerp(becoming, destinationBecoming, 0.08);
}

// The State Of Restfulness (Calm)

function drawStillness() {
  background(2, 14, 35, 30);

  noStroke();
  fill(0, 90, 150, 15);
  ellipse(width * 0.5, height * 0.55, width * 1.6, height * 0.9);

  fill(70, 190, 255, 7);
  ellipse(width * 0.25, height * 0.25, width * 0.8, height * 0.45);

  noFill();

  for (let r of calmCurrents) {
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

// The State Of Restlessness (Chaos)

function drawChaos() {
  let intensity = map(becoming, 0.6, 1, 0, 1);

  background(0, 0, 0, 70);
  fill 

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

    for (let p of restlness) {
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

// UI

function displayText() {
  noStroke();
  fill(255, 150);
  textSize(24);
  textAlign(LEFT, BASELINE);

  text("A Map of Becoming", 30, 30);

  let label = becoming < 0.6 ? "Serenity" : "Wanderer";

  text(label, 30, 60);
  text("state: " + nf(becoming, 1, 2), 30, 90);
  text("keys: 1 Solace(Calm) | 2 Wanderer(chaos) | 3 Real-Time Data", 30, 120);
}

function keyPressed() {
  if (key === " ") {
    started = true;
    background(0);
  }

  if (key === "1") {
    started = true;
    overrideMode = true;
    overrideState = 0.02;
    becoming = 0.02;
  }

  if (key === "2") {
    started = true;
    overrideMode = true;
    overrideState = 1;
    becoming = 1;
  }

  if (key === "3") {
    started = true;
    overrideMode = false;
  }

  background(0);
}

function mousePressed() {
  if (!started) {
    started = true;
  }

  background(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
