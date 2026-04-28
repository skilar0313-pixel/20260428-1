// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let bubbles = []; // 儲存所有水泡物件

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // 1. 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  // 2. 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  // 在左上方加上文字
  fill(0);
  noStroke();
  textSize(24);
  textAlign(LEFT, TOP);
  text("414730092 許詠鈐", 20, 20);

  // 3. 計算顯示影像的寬高為整個畫布寬高的 50%
  let displayW = width * 0.5;
  let displayH = height * 0.5;

  // 4. 計算置中位置
  let offsetX = (width - displayW) / 2;
  let offsetY = (height - displayH) / 2;

  // 5. 繪製縮放並置中的影像
  image(video, offsetX, offsetY, displayW, displayH);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 6. 預先計算並儲存所有映射後的座標點
        let mappedPoints = hand.keypoints.map(kp => ({
          x: map(kp.x, 0, video.width, offsetX, offsetX + displayW),
          y: map(kp.y, 0, video.height, offsetY, offsetY + displayH)
        }));

        // 設定線條與點的顏色（依左右手區分）
        let clr = hand.handedness === "Left" ? color(255, 0, 255) : color(255, 255, 0);
        stroke(clr);
        strokeWeight(4);
        noFill();

        // 7. 利用 line 指令串接指定的編號範圍
        drawFinger(mappedPoints, 0, 4);   // 大拇指
        drawFinger(mappedPoints, 5, 8);   // 食指
        drawFinger(mappedPoints, 9, 12);  // 中指
        drawFinger(mappedPoints, 13, 16); // 無名指
        drawFinger(mappedPoints, 17, 20); // 小拇指

        // 9. 在指尖產生水泡 (編號 4, 8, 12, 16, 20)
        let tips = [4, 8, 12, 16, 20];
        if (frameCount % 2 === 0) { // 控制產生頻率
          for (let index of tips) {
            let pt = mappedPoints[index];
            bubbles.push(new Bubble(pt.x, pt.y));
          }
        }

        // 8. 繪製關節點圓圈
        noStroke();
        fill(clr);
        for (let pt of mappedPoints) {
          circle(pt.x, pt.y, 12);
        }
      }
    }
  }

  // 更新並顯示所有水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].show();
    if (bubbles[i].isDead()) {
      bubbles.splice(i, 1); // 水泡破掉後從陣列移除
    }
  }
}

/**
 * 輔助函式：繪製連續的線段
 * @param {Array} points 映射後的座標陣列
 * @param {Number} start 起始索引
 * @param {Number} end 結束索引
 */
function drawFinger(points, start, end) {
  for (let i = start; i < end; i++) {
    // 確保點存在才繪製
    if (points[i] && points[i+1]) {
      line(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
    }
  }
}

// 水泡類別定義
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(5, 15);
    this.speed = random(2, 5);
    this.alpha = 200;
    this.popDistance = random(100, 300); // 往上飛多久會破掉
    this.startY = y;
    this.wobble = random(100); // 隨機晃動位移
  }

  update() {
    this.y -= this.speed;
    this.x += sin(frameCount * 0.1 + this.wobble) * 0.5; // 輕微晃動
    this.alpha -= 1.5; // 漸漸變透明
  }

  show() {
    stroke(255, this.alpha);
    strokeWeight(1.5);
    noFill();
    circle(this.x, this.y, this.r * 2);
  }

  isDead() {
    // 當透明度歸零、飛過頭或飛出畫布時判定為破掉
    return (this.startY - this.y > this.popDistance) || this.alpha <= 0 || this.y < 0;
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小以維持全螢幕
  resizeCanvas(windowWidth, windowHeight);
}
