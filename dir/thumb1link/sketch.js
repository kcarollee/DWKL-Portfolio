let tileSize = 15;
let threshold = 0.9;
let tileSideNum;
let mode = 0;
function sdfCenterCircle(x, y){
  let d = dist(x, y, mouseX, mouseY);
  d = sin(d * 0.05 + frameCount * 0.1);
  return map(d, -1, 1, 0, 1);
}

function sdf(x, y){
  let d = cos((x + mouseX * 0.1) * (y + mouseY * 0.1) * 0.001 + frameCount * 0.01 );
  return map(d, -1, 1, 0, 1);
}

function setup() {
  createCanvas(800, 800);
  
  tileSideNum = width / tileSize;
}

function draw() {
  background(0);
  stroke(255)
  strokeWeight(1);
   
  for (let i = 0; i < tileSideNum; i++){
    for (let j = 0; j < tileSideNum; j++){
      let x = i * tileSize;
      let y = j * tileSize;
      push();
      translate(x, y);
      if ((mode == 0 ? sdfCenterCircle(x, y) : sdf(x, y)) > threshold){
        line(0, tileSize * 0.5, tileSize * 0.5, 0);
        line(tileSize * 0.5, 0, tileSize, tileSize * 0.5);
      }
      else{
        line(0, tileSize * 0.5, tileSize, tileSize * 0.5);
      }
      pop();
    }
  }
}

function mousePressed(){
  mode++;
  mode %= 2;
}