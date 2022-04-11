class PicTile{
  constructor(posx, posy, w, h){
    this.initPosx = posx;
    this.initPosy = posy;
    this.posx = posx;
    this.posy = posy;
    this.imgPosx = this.posx;
    this.imgPosy = this.posy;
    this.width = w;
    this.height = h;
    this.selected = false;
    this.showGrid = false;
  }
  
  setImage(img){
    this.image = img.get(this.imgPosx, this.imgPosy, this.width, this.height);
  }
  changePos(newx, newy){
    this.imgPosx = newx;
    this.imgPosy = newy;
  }
  
  display(img){
    //let im = img.get(this.imgPosx, this.imgPosy, this.width, this.height);
    image(this.image, this.posx, this.posy);
    if (this.showGrid) {
      rect(this.posx, this.posy, this.width, this.height);
    }
  }
  
  reset(){
    this.imgPosx = this.initPosx;
    this.imgPosy = this.initPosy;
  }

  
  mouseIn(){
    if (mouseX > this.posx && mouseX < this.posx + this.width){
      if (mouseY > this.posy && mouseY < this.posy + this.height) return true;
      else return false;
    }
    else return false;
  }
}

PicTile.shuffleArray = [];
PicTile.posCopyArray = [];


let img;
let picTileArray = [];



let picTileWidth = 50;
let picTileHeight = 50;
let picTileWidthNum, picTileHeightNum;
function preload(){
  img = loadImage('assets/images/pic.jpg');
}
function setup() {
  createCanvas(800, 800);
  textSize(15);
  img.resize(width, height);
  picTileWidthNum = width / picTileWidth;
  picTileHeightNum = height / picTileHeight;
  
  for (let j = 0; j < picTileHeightNum; j++){
    for (let i = 0; i < picTileWidthNum; i++){
      let x = i * picTileWidth;
      let y = j * picTileHeight;
      let tile = new PicTile(x, y, picTileWidth, picTileHeight);
      tile.setImage(img);
      picTileArray.push(tile);
    }
  }

  
}

function draw() {
  background(220);
  
  noFill();
  stroke(0);
  let imgr = img;
  img.loadPixels();
  picTileArray.forEach(function(p){
    p.display(imgr);
  })
  fill(255);
  text("CLICK AND DRAG MOUSE TO SELECT TILES TO SHUFFLE", 10, 20);
  text("PRESS 's' TO SHUFFLE SELECTED TILES", 10, 40);
  text("PRESS 'r' TO RESET ARRAY OF TILES TO SHUFFLE", 10, 60);
}

function keyPressed(){
  switch(key){
    case 's':
      //shuffle(PicTile.posCopyArray, true);
      PicTile.posCopyArray.push(PicTile.posCopyArray.shift());
      PicTile.shuffleArray.forEach(function(p, i){
        let pos = PicTile.posCopyArray[i];
        p.changePos(pos[0], pos[1]);
        p.setImage(img);
        p.showGrid = false;
        p.selected = false;
      })
      break;
    case 'r':
      PicTile.shuffleArray.forEach(function(p){
        p.showGrid = false;
        p.selected = false;
      });
      PicTile.shuffleArray = [];
      PicTile.posCopyArray = [];
      break;

    case 'q':
      picTileArray.forEach(function(p){
        p.showGrid = false;
        p.selected = false;
        p.reset();
        p.setImage(img);
      });
      PicTile.shuffleArray = [];
      PicTile.posCopyArray = [];
      break;
  }
}

function mouseDragged(){
  picTileArray.forEach(function(p, i){
    if (p.mouseIn() && !p.selected){
      p.selected = true;
      p.showGrid = true;
      PicTile.shuffleArray.push(p);
      PicTile.posCopyArray.push([p.posx, p.posy]);
     
    }
  })
}