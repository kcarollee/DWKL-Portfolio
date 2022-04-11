let MAX_TRIGSUM_NUM = 4;
let canvas;
class TrigSum{
  constructor(posx, posy){
    this.posx = posx;
    this.posy = posy;
    this.length = random(300, 500);
    this.divNum = int(random(50, 100));
    this.divLength = this.length / this.divNum;
    this.amplitude1 = random(50, 100);
    this.amplitude2 = random(50, 100);
    this.period1 = random(2, 7);
    this.period2 = random(2, 7);
    this.update();
  }
  
  getYVal1(x){
    return this.amplitude1 * sin(x * this.period1 + frameCount * 0.01);
  }
  
  getYVal2(x){
    return this.amplitude2 * cos(x * this.period2 + frameCount * 0.01);
  }
  
  display(){
    for (let i = 0; i < this.divNum; i++){
      let y1 = this.yArr1[i];
      let y2 = this.yArr2[i];
      let x = this.xArr[i];
      if (y1 > y2) stroke(255, 0, 0);
      else stroke(0, 255, 0);
      
      line(x, y1, x, y2);
    }
  }
  
  update(){
    this.xArr = [];
    this.yArr1 = [];
    this.yArr2 = [];
    for (let i = 0; i < this.divNum; i++){
      let x = this.posx - this.length * 0.5 + i * this.divLength;
      let y1 = this.posy + this.getYVal1(x);
      let y2 = this.posy + this.getYVal2(x);
      this.xArr.push(x);
      this.yArr1.push(y1);
      this.yArr2.push(y2);
    }
  }
  
}
let trigSumArr = [];
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1');
  
}

function draw() {
  background(0, 30);
  if (trigSumArr.length != 0){
    trigSumArr.forEach(function(t){
      t.display();
      t.update();
    });
  }
  
  if (trigSumArr.length > MAX_TRIGSUM_NUM){
    trigSumArr.splice(0, 1)
  }
}

function mousePressed(){
  let trigSum = new TrigSum(mouseX, mouseY);
  trigSumArr.push(trigSum);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}