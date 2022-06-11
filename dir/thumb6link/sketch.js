// 이미지의 배열
let imgArr = [];
let imgNum = 5;

// 현재 이미지의 인덱스
let imgIndex = 0;
let morphingMoverNum = 2000;

// MorphingMover 객체의 갯수
let morphingMoverArr = [];

// 현재 이미지
let currentImage;

// MorphingMover 클래스
class MorphingMover{
  constructor(posx, posy, radius, color){
    // 색깔은 RGBA배열이다
    this.color = color;
    this.posx = posx;
    this.posy = posy;
    this.radius = radius;
    
    this.destx = null;
    this.desty = null;
    this.destColor = null;
    this.destRadius = null;
  }
  
  // 목표 지점과 현재 지점사이에서의 위치를 계산
  static getEasedValue(currentVal, destVal, divisor){
    return currentVal += (destVal - currentVal) / divisor;
  }
  
  // 목표 색깔 세터
  setDestColor(destColor){
    this.destColor = destColor;
  }
  
  // 목표 반지름 세터
  setDestRadius(destRadius){
    this.destRadius = destRadius;
  }
  
  // 목표 위치 세터
  setDestPosition(destx, desty){
    this.destx = destx;
    this.desty = desty;
  }
  
  // 위치 업데이트
  updatePosition(){
    // 목표 위치가 정의 되어 있지 않으면 리턴
    if (this.destx == null) return;
    this.posx = MorphingMover.getEasedValue(this.posx, this.destx, 10);
    this.posy = MorphingMover.getEasedValue(this.posy, this.desty, 10);
  }
  
  // 색깔 업데이트
  updateColor(){
    if (this.destColor == null) return;
    
    // RGBA 배열 중 RGB만 업데이트
    for (let i = 0; i < 3; i++){
      this.color[i] = MorphingMover.getEasedValue(this.color[i], this.destColor[i], 10);
    }
    
  }
  
  // 사이즈 업데이트
  updateSize(){
    if (this.destRadius == null) return;
    this.radius = MorphingMover.getEasedValue(this.radius, this.destRadius, 10);
  }
  
  // draw() 함수에서 그림을 그리는 함수
  display(){
    fill(this.color[0], this.color[1], this.color[2], 100);
    rect(this.posx, this.posy, this.radius, this.radius);
  }
  
  // 마우스의 빠르기에 위치가 반응하게 하기
  applyMouseSpeed(mouseSpeed){
    let dx = mouseX - this.posx;
    let dy = mouseY - this.posy;
    
    // 현재 마우스의 위치와 객체의 위치사이의 거리
    let distance = sqrt(dx * dx + dy * dy);
    
    // 거리가 가까울수록, 마우스가 빠를수록 목표 위치는 더 많이 변한다.
    // dx, dy를 곱하는 이유: 마우스를 따라오는 듯한 연출을 위해
    this.destx += 1.0 / pow(distance, MorphingMover.disperseExponent) * dx * mouseSpeed;
    this.desty += 1.0 / pow(distance, MorphingMover.disperseExponent) * dy * mouseSpeed;
  }
}

MorphingMover.disperseExponent = 1.7; // 이 값이 클수록 덜 퍼진다. 


function preload(){
  // 이미지의 갯수 만큼 이미지들을 로딩해준다
  for (let i = 0; i < imgNum; i++){
    let img = loadImage('face' + (i + 1) + '.jpg');
    // 이미지들을 배열에 넣어준다. 
    imgArr.push(img);
  }
}


function setup() {
  createCanvas(600, 600);
  rectMode(CENTER);
  // 이미지들을 캔버스의 사이즈에 맞게 리사이즈 해준다
  imgArr.forEach(function(img){
    img.resize(width, height);
  });
  
  // currentImage가 현재 이미지를 가리키게 함
  currentImage = imgArr[0];
  
  // morphingMoverNum 만큼의 MorphingMover 객체 생성
  for (let i = 0; i < morphingMoverNum; i++){
    // 객체의 위치는 캔버스 내부의 랜덤한 좌표다. 
    let posx = int(random(0, width));
    let posy = int(random(0, height));
    
    // 위의 랜덤한 위치에 있는 사진 픽셀의 색상값을 가져온다.
    let colorArray = currentImage.get(posx, posy);
    // 위 색상의 그레이 스케일 값. 이 값에 따라 객체의 사이즈가 정해진다. 
    let g = getGreyScale(colorArray[0], colorArray[1], colorArray[2]);
    // 사이즈를 1과 4 사이의 값으로 조정
    g = map(g, 0, 255, 1,4);
    // 3승을 해줘서 차이가 더 드러나게 해준다. 
    g = pow(g, 3);
  
    let morphingMover = new MorphingMover(posx, posy, g, colorArray);
    morphingMover.setDestColor(colorArray);
    morphingMover.setDestRadius(g);
    morphingMover.setDestPosition(posx, posy);
    morphingMoverArr.push(morphingMover);
  }
}

function getGreyScale(r, g, b){
  return (r + g + b) / 3.0;
}

// 마우스 빠르기를 수치화해주는 함수.
function getMouseSpeed(){
  let dx = mouseX - pmouseX;
  let dy = mouseY - pmouseY;
  let dist = sqrt(dx * dx + dy * dy);
  return dist;
}

function draw() {
  background(40);
  noStroke();  
  let mf = getMouseSpeed();
  morphingMoverArr.forEach(function(cm){
    cm.updatePosition();
    cm.updateColor();
    cm.updateSize();
    cm.applyMouseSpeed(mf);
    cm.display();
  });
}

function keyPressed(){
  switch(key){
    case 's':
      // 이미지 인덱스를 1 높여준다
      imgIndex++;
      imgIndex %= imgNum;
      currentImage = imgArr[imgIndex];
      morphingMoverArr.forEach(function(cm){
        let posx = int(random(0, width));
        let posy = int(random(0, height));
    
        let colorArray = currentImage.get(posx, posy);
        let g = getGreyScale(colorArray[0], colorArray[1], colorArray[2]);
        g = map(g, 0, 255, 1,4);
        g = pow(g, 3);
        cm.setDestColor(colorArray);
        cm.setDestRadius(g);
        cm.setDestPosition(posx, posy);
      
      });
      break;
  }
}