function setup() {
  createCanvas(400, 400);
  background(255);
}

function draw() {
  let r = map(mouseX, 0, windowWidth, 0, 255);
  let b = map(mouseY, 0, windowWidth, 0, 255);
  fill(r, 0, b, 20);
  stroke(r * 0.5, 0, b * 0.5, 10);
  ellipse(mouseX, mouseY, 150, 150);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}