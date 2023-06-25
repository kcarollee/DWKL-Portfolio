// 한번에 생길 최대 파티클 갯수
let particlesNumThreshold = 50;
// 현재 프레임
let capture;
//전 프레임
let prevCapture;
// 파티클들의 생성 위치를 저장할 배열
let posArr = [];
// 파티클 배열
let particleArr = [];
// 색상을 미리 저장
let colors = [
  [149, 219, 229],
  [7, 130, 130],
  [51, 158, 102]
];


class Segment{
  constructor(mode, posx, posy){
    this.posx = posx;
    this.posy = posy;
    
    // 0: 알아서 움직이기
    // 1: 다른 Segment객체의 위치에 따라서 움직이기
    this.mode = mode; 
    
    // 랜덤한 속력
    this.posxDisplacement = random(0, 10);
    this.posyDisplacement = random(0, 10);
    
    this.posxDispMapped = map(this.posxDisplacement, 0, 10, -1, 1);
    this.posyDispMapped = map(this.posyDisplacement, 0, 10, -1, 1);
    
    // 랜덤한 각도 시작점
    this.degOffset = random(0, TWO_PI);
    // 각도 증가 수치
    this.degInc = map(random() * Segment.speed, 0, Segment.speed, -Segment.speed, Segment.speed);
    
    this.prevSeg = null;
  }
  
  // 자기가 알아서 움직일때 이 함수 쓰기
  moveOnOwn(){
    this.posx += this.posxDispMapped;
    this.posy += this.posyDispMapped;
  }
  
  // 다른 객체 주변을 돌때 이 함수 쓰기
  moveBasedOnAnotherSegment(segment, radius){
    // 앞선 객체
    this.prevSeg = segment;
    // 앞선 객체 주변을 원형으로 돌도록 위치 설정
    this.posx = segment.posx + radius * cos(this.degOffset);
    this.posy = segment.posy + radius * sin(this.degOffset);
  }
  
  updateDegree(){
    this.degOffset += this.degInc;
  }
  
  display(){
    if (this.mode == 0){
      circle(this.posx, this.posy, Segment.size);
    }
    
    else{
      rect(this.posx, this.posy, Segment.size, Segment.size);
      beginShape();
      vertex(this.posx, this.posy);
      vertex(this.prevSeg.posx, this.prevSeg.posy);
      endShape(CLOSE);
    }
  }
}

Segment.size = 2;
Segment.speed = 0.05;


class Particle{
  constructor(posx, posy){
    this.posx = posx;
    this.posy = posy;
    
    // 파티클매다 생성될 Segment 객체 수를 랜덤하게 지정
    this.segNum = int(random(2, 5));
    // Segment 배열
    this.segmentArr = [];
    
    // 파티클 수명
    this.lifeSpan = random(30, 60);
    // 파티클 수명 카운트
    this.lifeCount = 0;
    
    this.color = colors[this.segNum % 3];
    this.opacity = 255;
  }
  
  initialize(){
    let prevSegment;
    //console.log(this.segmentArr);
    for (let i = 0; i < this.segNum; i++){
      let seg;
      // 첫 세그먼트는 모드 0. 혼자 알아서 움직임
      if (i == 0) seg = new Segment(0, this.posx, this.posy);
      else {
      // 그 다음 세그먼트들은 모드 1. 앞선 세그먼트들을 기준으로 움직임
        prevSegment = this.segmentArr[i - 1];
        seg = new Segment(1, this.posx, this.posy);
        seg.moveBasedOnAnotherSegment(prevSegment, Particle.segmentLength);
      }
      this.segmentArr.push(seg);
      
    }
  }
  
  update(){
    this.lifeCount++;
    this.opacity = map(this.lifeSpan - this.lifeCount, 0, this.lifeSpan, 0, 255);
    let prevSeg;
    let currentSeg;
    for (let i = 0; i < this.segNum; i++){
      currentSeg = this.segmentArr[i];
      if (i == 0){
        currentSeg.moveOnOwn();
      }
      else{
        prevSeg = this.segmentArr[i - 1];
        currentSeg.moveBasedOnAnotherSegment(prevSeg, Particle.segmentLength);
        currentSeg.updateDegree();
      }
    }
  }
  
  display(){
    stroke(this.color[0], this.color[1], this.color[2], this.opacity);
    this.segmentArr.forEach(function(s){
      s.display();
    });
  }
}

// Segment 객체들 사이의 거리
Particle.segmentLength = 20;


function setup() {
  createCanvas(600, 600);
  
  capture = createCapture(VIDEO);
  capture.size(600, 600);
  

  rectMode(CENTER);
  
}

function draw() {
  background(50, 20);
  
  rectMode(CORNER);
  noStroke();
  
  // 웹캠 피드가 로드될때까지 시간이 소요
  if (frameCount  > 240) {
    capture.loadPixels();
    prevCapture.loadPixels();
    for (let j = 0; j < capture.height; j += 10){
      for (let i = 0; i < capture.width; i += 10){
        let idx = 4 * (i + j * capture.width);
        let cPixArr = capture.pixels;
        let pPixArr = prevCapture.pixels;
        
        // 현재 프레임 픽셀의 그레이 스케일
        let cGrey = (cPixArr[idx] + cPixArr[idx + 1] + cPixArr[idx + 2]) / 3.0;
        // 전 프레임 픽셀의 그레이 스케일
        let pGrey = (pPixArr[idx] + pPixArr[idx + 1] + pPixArr[idx + 2]) / 3.0;
        
        // 위 두 값의 차이
        let diffVal = abs(cGrey - pGrey);
        
        // 위 값의 차이가 10을 넘으면 파티클이 생성될 위치를 배열에 넣기
        if (diffVal > 10) {
          fill(diffVal, 10);
          posArr.push([i, j]);  
        }
        else fill(0, 0); 
        rect(i, j, 10, 10);
      }
    }
  }
  rectMode(CENTER);
  
  // particleArr의 길이가 particlesNumThreshold보다 작을때
  if (particleArr.length < particlesNumThreshold){
    for (let i = 0; i < posArr.length; i++){
      let pos = posArr[i];
      // posArr에다가 넣어둔 위치를 기반으로 파티클 생성
      let particle = new Particle(pos[0], pos[1]);
      particle.initialize();
      particleArr.push(particle);
    } 
  }
  
  prevCapture = capture.get();
  // posArr 초기화
  posArr = [];
  
  let pa = particleArr;
  
  particleArr.forEach(function(p){
    p.update();
    p.display();
    //pa (particleArr)에서 p의 인덱스
    let idx = pa.indexOf(p);
    // 파티클의 수명이 다했을떄 배열에서 제거해주기
    if (p.lifeCount > p.lifeSpan){
      pa.splice(idx, 1);
    }
  });
}
