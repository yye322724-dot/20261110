const stopFrameCount = 10; // 設定站立精靈表中的動畫影格總數為十張
const walkFrameCount = 9; // 設定走路精靈表中的動畫影格總數為九張
const pushFrameCount = 4; // 設定推動精靈表中的動畫影格總數為四張
const effectFrameCount = 5; // 設定特效精靈表中的動畫影格總數為五張
const animationFps = 10; // 設定動畫每秒切換十張影格
const movementSpeedRatio = 0.18; // 設定角色每秒移動的距離占畫布寬度的比例
const effectSpeedRatio = 0.7; // 設定特效每秒移動的距離占畫布寬度的比例
let stopSpriteSheet; // 宣告用來存放站立動畫精靈表的變數
let walkSpriteSheet; // 宣告用來存放走路動畫精靈表的變數
let pushSpriteSheet; // 宣告用來存放推動動畫精靈表的變數
let effectSpriteSheet; // 宣告用來存放特效動畫精靈表的變數
let characterCenterX; // 宣告用來記錄角色水平中心位置的變數
let facingLeft = false; // 記錄角色目前是否朝向左方
let pushFacingLeft = false; // 記錄推動動畫開始時角色的朝向
let isPushing = false; // 記錄角色是否正在播放推動動畫
let pushStartedAt = 0; // 記錄推動動畫開始播放的時間
let effectIsActive = false; // 記錄特效是否正在畫面中移動
let effectCenterX = 0; // 記錄特效目前的水平中心位置
let effectDirection = 1; // 記錄特效目前的移動方向
let effectStartedAt = 0; // 記錄特效動畫開始播放的時間

function preload() { // 在建立畫布前先載入角色圖片
  stopSpriteSheet = loadImage("1/stop/stop.png"); // 載入角色一的十格站立精靈表
  walkSpriteSheet = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈表
  pushSpriteSheet = loadImage("1/push/push.png"); // 載入角色一的四格推動精靈表
  effectSpriteSheet = loadImage("1/特效/特效.png"); // 載入角色推動時使用的五格特效精靈表
} // 結束圖片預載入函式

function setup() { // 設定畫布與動畫的初始狀態
  createCanvas(windowWidth, windowHeight); // 建立符合目前視窗尺寸的畫布
  imageMode(CORNER); // 使用圖片左上角作為繪製座標
  frameRate(60); // 提高畫面更新頻率以讓角色移動更平順
  characterCenterX = width * (2 / 3); // 將角色初始位置設定在畫布寬度的三分之二處
} // 結束初始設定函式

function draw() { // 每次畫面更新時繪製背景與角色影格
  background(218, 204, 242); // 以淡紫色清除畫面並繪製背景
  const moveLeft = !isPushing && keyIsDown(LEFT_ARROW); // 推動期間以外按左方向鍵時讓角色往左移動
  const moveRight = !isPushing && keyIsDown(RIGHT_ARROW); // 推動期間以外按右方向鍵時讓角色往右移動
  const isWalking = moveLeft || moveRight; // 判斷是否有按下左右方向鍵
  const spriteSheet = isPushing ? pushSpriteSheet : isWalking ? walkSpriteSheet : stopSpriteSheet; // 依推動、移動或靜止狀態選擇角色精靈表
  const activeFrameCount = isPushing ? pushFrameCount : isWalking ? walkFrameCount : stopFrameCount; // 依角色目前狀態選擇影格總數
  const frameWidth = spriteSheet.width / activeFrameCount; // 根據精靈表寬度計算單格影格的寬度
  const frameHeight = spriteSheet.height; // 取得目前精靈表的影格高度
  const scaleFactor = min((height * 0.92) / frameHeight, (width * 0.6) / frameWidth); // 依畫布高寬計算保持比例的縮放倍率
  const characterWidth = frameWidth * scaleFactor; // 計算縮放後單格角色的顯示寬度
  const characterHeight = frameHeight * scaleFactor; // 計算縮放後角色的顯示高度
  const movementDirection = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0); // 根據按鍵狀態計算角色移動方向
  characterCenterX += movementDirection * width * movementSpeedRatio * (deltaTime / 1000); // 依畫布寬度與時間更新角色水平位置
  characterCenterX = constrain(characterCenterX, characterWidth / 2, width - characterWidth / 2); // 限制角色不會移出畫布左右邊界
  if (moveLeft && !moveRight) facingLeft = true; // 角色往左移動時切換為朝左
  if (moveRight && !moveLeft) facingLeft = false; // 角色往右移動時切換為朝右
  const currentFrame = isPushing ? min(floor(((millis() - pushStartedAt) / 1000) * animationFps), pushFrameCount - 1) : floor((millis() / 1000) * animationFps) % activeFrameCount; // 推動動畫只播放一次，其餘動畫循環播放
  const sourceX = currentFrame * frameWidth; // 計算目前影格在精靈表中的水平起點
  const characterFacingLeft = isPushing ? pushFacingLeft : facingLeft; // 推動時固定使用開始動作時的朝向
  push(); // 暫存繪圖狀態以便只翻轉角色圖片
  translate(characterCenterX, height - characterHeight); // 將繪圖原點移至角色中心與畫布底部
  if (characterFacingLeft) scale(-1, 1); // 面向左方時水平翻轉角色精靈
  image(spriteSheet, -characterWidth / 2, 0, characterWidth, characterHeight, sourceX, 0, frameWidth, frameHeight); // 繪製貼底且依方向翻轉的角色影格
  pop(); // 還原繪圖狀態避免影響其他畫面
  if (isPushing && millis() - pushStartedAt >= (pushFrameCount / animationFps) * 1000) { // 推動影格播完後開始產生特效
    isPushing = false; // 結束推動動畫並讓角色回到一般狀態
    effectIsActive = true; // 啟動推動完成後的移動特效
    effectDirection = pushFacingLeft ? -1 : 1; // 依推動開始時角色的朝向決定特效方向
    effectCenterX = characterCenterX + effectDirection * characterWidth * 0.4; // 將特效放在角色面向的一側
    effectStartedAt = millis(); // 記錄特效動畫的起始時間
  } // 結束推動動畫與特效的狀態切換
  if (effectIsActive) { // 特效啟動時更新位置並繪製目前影格
    const effectFrameWidth = effectSpriteSheet.width / effectFrameCount; // 計算特效精靈表中每格影格的寬度
    const effectFrameHeight = effectSpriteSheet.height; // 取得特效影格的原始高度
    const effectWidth = effectFrameWidth * scaleFactor; // 依角色縮放倍率計算特效顯示寬度
    const effectHeight = effectFrameHeight * scaleFactor; // 依角色縮放倍率計算特效顯示高度
    effectCenterX += effectDirection * width * effectSpeedRatio * (deltaTime / 1000); // 依推動方向持續移動特效
    if ((effectDirection > 0 && effectCenterX - effectWidth / 2 > width) || (effectDirection < 0 && effectCenterX + effectWidth / 2 < 0)) effectIsActive = false; // 特效完全離開畫布後將其隱藏
    if (effectIsActive) { // 特效仍在畫布範圍內時繪製影格
      const effectFrame = floor(((millis() - effectStartedAt) / 1000) * animationFps) % effectFrameCount; // 讓五格特效在移動期間循環播放
      const effectSourceX = effectFrame * effectFrameWidth; // 計算目前特效影格在精靈表中的水平起點
      push(); // 暫存繪圖狀態以便設定特效方向
      translate(effectCenterX, height - characterHeight * 0.62); // 將特效放在角色上半身高度並定位水平中心
      if (effectDirection < 0) scale(-1, 1); // 特效往左移動時水平翻轉光束
      image(effectSpriteSheet, -effectWidth / 2, -effectHeight / 2, effectWidth, effectHeight, effectSourceX, 0, effectFrameWidth, effectFrameHeight); // 繪製目前特效影格
      pop(); // 還原繪圖狀態避免影響其他畫面
    } // 結束特效仍可見時的繪製區塊
  } // 結束特效更新與繪製區塊
} // 結束每幀繪製函式

function keyPressed() { // 接收方向鍵按下事件並避免瀏覽器捲動畫面
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) return false; // 阻止方向鍵觸發瀏覽器預設捲動
  if (keyCode === 32 && !isPushing && !effectIsActive) { // 按下空白鍵且目前沒有推動或特效時開始動作
    isPushing = true; // 啟動只播放一次的推動動畫
    pushStartedAt = millis(); // 記錄推動動畫的起始時間
    pushFacingLeft = facingLeft; // 記住角色開始推動時的面向
    return false; // 阻止空白鍵觸發瀏覽器預設捲動
  } // 結束空白鍵推動動作判斷
} // 結束鍵盤按下事件函式

function windowResized() { // 當視窗或裝置方向改變時重新調整畫布
  const positionRatio = characterCenterX / width; // 記錄角色目前相對於畫布寬度的位置
  const effectPositionRatio = effectCenterX / width; // 記錄特效目前相對於畫布寬度的位置
  resizeCanvas(windowWidth, windowHeight); // 將畫布尺寸更新為最新視窗尺寸
  characterCenterX = positionRatio * width; // 依新畫布寬度保留角色原本的相對位置
  if (effectIsActive) effectCenterX = effectPositionRatio * width; // 畫布尺寸改變時保留特效原本的相對位置
} // 結束視窗尺寸變更處理函式
