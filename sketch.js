let faceapi;
let video;
let detections;
let cWidth, cHeight;
let stars = []
let starSize = 10
let loader
let findWho = 'unknown'


//detection options for the neural network script
const options = {
    withDescriptors: true,
    withFaceLandmarks: true,
    minConfidence: 0.3
}   



function setup() {
    cWidth = displayWidth/2;
    cHeight = displayHeight/2;
    loader = text('Press start', 19, 40);
    button = createButton('start');
    button.position(19, 60, 'relative');
    button.mousePressed(start);
    checkbox = createCheckbox('Duts only?', false);
    checkbox.position(19,80, 'relative');
    checkbox.changed(onCheck);
}

function onCheck(){
    if (this.checked()) {
        findWho = 'Duterte'
      } else {
        findWho = 'unknown'
      }
}


function start(){
    canvas = createCanvas(cWidth, cHeight);
    canvas.center();
    video = createCapture(VIDEO);
    video.size(128, 128);
    video.hide(); 
    // let loader = createDiv('').size(cWidth/3, cHeight/3)
    // loader.html('Loading models...', true) 
    image(video, 0, 0, width, height)
    loader = text('Loading models...', 19, 40);
    faceapi = ml5.faceApi(video, options, modelsReady) //initializing face-api.js through ml5js
    labeledDescriptors = [ new faceapi.model.LabeledFaceDescriptors('Duterte',digong.map(descriptor => new Float32Array(descriptor))) ] //facial descriptors to look for
    faceMatcher = new faceapi.model.FaceMatcher(labeledDescriptors); //initialize facematcher
    textAlign(RIGHT);
    download = createButton('Download');
    download.position(19, 100, 'relative');
    download.mousePressed(save);
}

function save(){
    saveCanvas('canvas', 'jpg');
}

function modelsReady() {
    console.log('ready!')
    console.log(faceapi)
    faceapi.detect(foundFace)

}

function foundFace(err, result) {
    if (err) {
        console.log(err)
        return
    }
    detections = result;
    image(video, 0, 0, width, height)
    if (detections) { 
        detections.forEach(fd => {
            const bestMatch = faceMatcher.findBestMatch(fd.descriptor)
            if (bestMatch.label == findWho ){drawBox(detections)}
          })
    }
    faceapi.detect(foundFace)
}

//generates an overlay on detected faces
function drawBox(detections) { 
    for (let i = 0; i < detections.length; i++) {
        const alignedRect = detections[i].alignedRect;
        const x = (alignedRect._box._x/video.width)*(cWidth)
        const y = (alignedRect._box._y/video.height)*(cHeight)
        const boxWidth = (alignedRect._box._width/video.width)*(cWidth)
        const boxHeight = (alignedRect._box._height/video.height)*(cHeight)

        noFill();
        stroke(255, 204, 0);
        strokeWeight(3);
        rect(x, y, boxWidth, boxHeight);
        drawLandmarks(detections)
    }

}
function drawLandmarks(detections) {
    noFill();
    stroke(161, 95, 251)
    strokeWeight(2)
 
    for (let i = 0; i < detections.length; i++) {
        setStarSize(detections[i]);
        // const mouth = detections[i].parts.mouth;
        // const nose = detections[i].parts.nose;
        const leftEye = detections[i].parts.leftEye;
        const rightEye = detections[i].parts.rightEye;
        // const rightEyeBrow = detections[i].parts.rightEyeBrow;
        // const leftEyeBrow = detections[i].parts.leftEyeBrow;
 
        // drawPart(mouth, true);
        // drawPart(nose, false);
        // drawPart(leftEye, true);
        // drawPart(leftEyeBrow, false);
        // drawPart(rightEye, true);
        // drawPart(rightEyeBrow, false);
        drawStar(leftEye, "L")
        drawStar(rightEye, "R")
    }
 
}
 
class Star {
    constructor(x, y, radius1, radius2, npoints, LR) {
        this.x = x
        this.y = y
        this.vy = (Math.random() + 1) * -10
        this.radius1 = radius1
        this.radius2 = radius2
        this.npoints = npoints
        this.color = color(Math.random() * 255, Math.random() * 255, Math.random() * 255)
        if (LR === "L") {
            this.vx = Math.random() * -10
        } else {
            this.vx = Math.random() * 10
        }
    }
 
    draw() {
        let angle = TWO_PI / this.npoints;
        let halfAngle = angle / 2.0;
        fill(this.color)
        noStroke()
        beginShape();
        for (let a = 0; a < TWO_PI; a += angle) {
            let sx = this.x + cos(a) * this.radius2;
            let sy = this.y + sin(a) * this.radius2;
            vertex(sx, sy);
            sx = this.x + cos(a + halfAngle) * this.radius1;
            sy = this.y + sin(a + halfAngle) * this.radius1;
            vertex(sx, sy);
        }
        endShape(CLOSE);
 
        this.vy += 3
        this.y += this.vy
        this.x += this.vx
    }
}
 
function drawStar(eye, LR) {
    const center = getCenter(eye)
    const star = new Star((center.avgX/video.width*cWidth), (center.avgY/video.height*cHeight), starSize / 3, starSize, 5, LR)
    stars.push(star)
    stars.forEach(star => {
        star.draw()
    })
    if (stars.length > 100) stars.shift()
}
 
function setStarSize(detection) {
    const alignedRect = detection.alignedRect;
    const boxHeight = (alignedRect._box._height/video.height)*(cHeight)
    starSize = boxHeight / 10
}
 
function getCenter(arr) {
    const sumX = arr.reduce((sum, item) => sum + item._x, 0)
    const sumY = arr.reduce((sum, item) => sum + item._y, 0)
    const avgX = sumX / arr.length
    const avgY = sumY / arr.length
    return {avgX, avgY}
}