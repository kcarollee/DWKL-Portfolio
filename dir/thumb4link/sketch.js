let leafShader, leafShader2, flowShader, combineShader;
let pgBranch, pgLeafTexture, pgLeafIdleTexture, pgLeaves, pgFlow, pgFlowFeedback;
let pgLeafTextureArr = [];
let pgLeafTextureArrFilled = false;
let pgLeafTextureNum = 50;
let captureCur, capturePrev;
let loadCount = 0;
let leafTexVideo;

let idleLeafTex;
function preload(){
  // 움직이는 나뭇잎의 텍스쳐를 그려줄 셰이더
  leafShader = loadShader('shaders/leafShader.vert', 'shaders/leafShader.frag');
  // 움직이지 않는 나뭇잎을 그려줄 셰이더
  leafShader2 = loadShader('shaders/leafShader2.vert', 'shaders/leafShader2.frag');
  // optical flow 셰이더
  flowShader = loadShader('shaders/flowShader.vert', 'shaders/flowShader.frag');
  // pgBranch, pgLeaves, pgFlow를 합칠 셰이더
  combineShader = loadShader('shaders/combineShader.vert', 'shaders/combineShader.frag');

  // 움직이지 않는 나뭇잎 텍스쳐로 쓸 이미지
  idleLeafTex = loadImage('assets/eyeIdle.png');
}

let testTree;

function setup(){
  createCanvas(800, 800, WEBGL);
  // 가지들을 그릴 WEBGL 캔버스
  pgBranch = createGraphics(800, 800, WEBGL);
  
  // 나뭇잎 텍스쳐를 그릴  WEBGL 캔버스
  pgLeafTexture = createGraphics(200, 200, WEBGL);
  pgLeafIdleTexture = createGraphics(200, 200, WEBGL);
  
  // 나뭇잎들을 그릴 WEBGL 캔버스
  pgLeaves = createGraphics(800, 800, WEBGL);
  pgLeaves.rectMode(pgLeaves.CENTER);
  pgLeaves.noStroke();

  // 나뭇잎 텍스쳐로 쓸 비디오
  leafTexVideo = createVideo('assets/eye.mp4');
  leafTexVideo.autoplay();
  leafTexVideo.loop();
  leafTexVideo.hide();
  leafTexVideo.volume(0);
  // optical flow 텍스쳐를 위한 WEBGL 캔버스
  pgFlow = createGraphics(800, 800, WEBGL);

  // 테스트용 LSystemTree()
  testTree = new LSystemTree();
  testTree.generateFinalRule();
  testTree.generateLeaves();
  
  imageMode(CENTER);

  // 현재 웹캠 프레임
  captureCur = createCapture(VIDEO);
  captureCur.size(800, 800);
  captureCur.hide();
  // 전 웹캠 프레임을 저장할 캔버스. 
  // capturePrev = captureCur.get()방식을 사용하면 스케치가 30초 정도 지나 WEBGL CONTEXT LOST 에러가 나서 튕긴다. 
  capturePrev = createGraphics(800, 800);
  // feedback loop을 위해  pgFlow의 전 프레임을 저장할 캔버스
  pgFlowFeedback = createGraphics(800, 800);
  
  
  
}

function draw(){

  // BRANCHES
  // pgBranch에서 background()를 콜하지 않는다
  // 매 프레임마다 가지를 그리는 것은 매우 비효율적이기 때문에 
  // 한번만 렌더한다. displayBranches()함수내의 this.singleRun 플래그가 한번만 렌더되게 한다. 
  pgBranch.stroke(255, 0, 0);
  testTree.displayBranches(pgBranch);
  generateNewTree();
  
  
  // leafShader는 나뭇잎 텍스쳐를 그려준다. 
  pgLeafTexture.shader(leafShader);
  leafShader.setUniform('resolution', [pgLeafTexture.width, pgLeafTexture.height]);
  leafShader.setUniform('time', frameCount * 0.01);
  leafShader.setUniform('texture', leafTexVideo);
  pgLeafTexture.quad(-1, -1, 1, -1, 1, 1, -1, 1);

  
  // leafShader2는 idle 상태의 나뭇잎 텍스쳐를 그려준다. 
  // p5에서는 두개 이상의 WEBGL Context가 하나의 셰이더를 공유를 못하는 것 같다. 
  pgLeafIdleTexture.shader(leafShader2);
  leafShader2.setUniform('resolution', [pgLeafIdleTexture.width, pgLeafIdleTexture.height]);
  leafShader2.setUniform('time', frameCount * 0.01);
  leafShader2.setUniform('texture', idleLeafTex);
  pgLeafIdleTexture.quad(-1, -1, 1, -1, 1, 1, -1, 1);
  
  // pgLeafTexture.loadPixels();
  // loadCount가 어느 정도 지나야 pgLeafTextureArr에 빈 프레임이 안들어간다. 
  if (loadCount > 10){
    if (pgLeafTextureArr.length < pgLeafTextureNum){
      let pgLeafCopy = pgLeafTexture.get();
      pgLeafTextureArr.push(pgLeafCopy);
    }

    else {
      let pgLeafTemp = pgLeafTextureArr.shift();
      pgLeafTextureArr.push(pgLeafTemp);
      pgLeafTextureArrFilled = true;
    }
  } 
  
  //pgLeafTexture.updatePixels();
  
  //console.log(pgLeafTextureArr.length);

  //image(pgLeafTexture, 0, 0);
  

  // OPTICAL FLOW 
  
  pgFlow.shader(flowShader);
  flowShader.setUniform('resolution', [width, height]);
  flowShader.setUniform('tex0', captureCur);
  flowShader.setUniform('tex1', capturePrev);
  flowShader.setUniform('backbuffer', pgFlowFeedback);
  flowShader.setUniform('offset', 1.0);
  flowShader.setUniform('time', frameCount * 0.01);
  pgFlow.rect(0, 0, 10, 10);
  
  // 웹캠 캡쳐 이전 프레임
  capturePrev.image(captureCur, 0, 0, 800, 800);
  
  // diffuse효과를 주기위해 pgFlow캔버스의 이전 프레임을 저장한다. 
  pgFlowFeedback.image(pgFlow, 0, 0);
  
  //image(pgFlow, 0, -400, 400, 800);

  // LEAVES

  pgLeaves.background(0);
  pgLeaves.stroke(255);
  pgFlow.loadPixels();
  loadCount < 40 ? loadCount++ : testTree.updateLeaves(pgFlow);
  //testTree.updateLeaves(pgFlow);
  testTree.displayLeaves(pgLeaves, pgLeafTextureArr);

  
  // COMBINE EVERYTHING
  shader(combineShader);
  combineShader.setUniform('resolution', [width, height]);
  combineShader.setUniform('leavesTex', pgLeaves);
  combineShader.setUniform('branchTex', pgBranch);
  combineShader.setUniform('flowTex', pgFlow);
  combineShader.setUniform('time', frameCount * 0.01);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);

  
}

function generateNewTree(){
  if (testTree.leavesArr.length < testTree.initialLeavesNum * 0.25){
    pgBranch.clear();
    testTree.reset();
  }
}