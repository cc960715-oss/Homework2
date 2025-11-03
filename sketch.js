/*
By Okazz
新增滑動選單功能與中央標題 (使用標楷體) - 選單鎖定模式
(最終版本: IFRAME 佔螢幕 80% 並居中，新增 '單元一作品'、'單元一筆記' 與 '題目測驗' 連結)
*/
//顏色設定
let colors = ['#7fc8f8', '#ffe45e', '#ff6392', '#17bebb'];
let ctx;
let motions = [];
let motionClasses = [];
let sceneTimer = 0;
let maxT2 = 0; 
let resetTime = 0; 

// 選單相關變數
let menuWidth;
let menuStateX; 
let targetMenuX; 
let triggerZone = 50; 
const menuItems = ["單元一作品", "單元一筆記", "單元二作品", "單元二筆記","題目測驗", "關閉選單/筆記"]; 
let menuLocked = false; 

// 字體變數
const BIAU_KAI_FONT = 'BiauKai'; 

// ✨ 更新：選單連結地圖，新增了「題目測驗」連結
const MENU_LINKS = {
    "單元一作品": "https://cc960715-oss.github.io/-balloon/",
    "單元一筆記": "https://hackmd.io/@S4T5MKJKTv2-p0tlVJuczw/ry7eYO1hgl",
    "題目測驗": "https://cc960715-oss.github.io/20251028/"
};

// 新增：用於顯示外部網站的 iframe 元素
let contentIframe; 

// Iframe 目標尺寸變數
const IFRAME_SCALE = 0.8; // 佔螢幕的 80%


function setup() {
    createCanvas(windowWidth, windowHeight); 
    rectMode(CENTER); 
    ctx = drawingContext; 
    
    // 初始化選單寬度和狀態
    menuWidth = width / 5;
    menuStateX = -menuWidth; 
    targetMenuX = -menuWidth;
    
    textAlign(CENTER, CENTER);
    
    // 創建 IFRAME (使用 p5.dom)
    contentIframe = createElement('iframe');
    contentIframe.style('display', 'none'); 
    contentIframe.style('border', '4px solid #000000'); 
    contentIframe.style('z-index', 10); 
    contentIframe.parent(document.getElementById('defaultCanvas0').parentElement); 
    
    INIT();
    resetTime = maxT2; 
}

function draw() {
    // 1. 背景繪製與動畫更新
    background('#ffffffff'); 
    for (let m of motions) { 
        m.run(); 
    }
    
    // 動畫停止機制
    if (sceneTimer >= resetTime) {
        for (let m of motions) {
            m.run(); 
        }
    }
    
    let fadeOutTime = 30;
    let alph = 0; 
    if ((resetTime - fadeOutTime) < sceneTimer && sceneTimer < resetTime) {
        alph = map(sceneTimer, (resetTime - fadeOutTime), resetTime, 0, 255);
        background(255, alph); 
    }

    sceneTimer++;
    
    // 2. 選單邏輯
    updateMenu();
    drawMenu();
    
    // 3. 中央標題繪製
    drawTitle();
    
    // 4. 更新 iframe 佈局
    updateIframeLayout(); 
}

// ------------------------------------
// IFRAME 相關函式
// ------------------------------------

/**
 * 更新 iframe 的位置和大小，使其佔螢幕 80% 並居中
 *  * 優化：根據選單的實際平滑位置 (menuStateX) 來計算偏移量，
 * 確保 iframe 的居中位置能平滑過渡。
 */
function updateIframeLayout() {
    // 只有當 iframe 顯示時，才需要調整其位置
    if (contentIframe.style('display') === 'block') {
        
        // 計算目標尺寸 (80%)
        let targetWidth = width * IFRAME_SCALE;
        let targetHeight = height * IFRAME_SCALE;

        // 根據選單的實際平滑位置計算偏移量
        // currentMenuWidth 為目前實際顯示在畫布上的選單寬度 (從 0 到 menuWidth)
        let currentMenuWidth = menuStateX + menuWidth; 
        if (currentMenuWidth < 0) currentMenuWidth = 0; // 確保不小於 0

        // 計算可用空間 (整個畫布寬度 - 露出的選單寬度)
        let availableWidth = width - currentMenuWidth;
        let xOffset = currentMenuWidth; // iframe 應該從選單最右邊開始計算

        // 計算新的居中位置： (偏移量) + (可用空間的一半) - (iframe 寬度的一半)
        let iframeX = xOffset + availableWidth / 2 - targetWidth / 2;
        let iframeY = height / 2 - targetHeight / 2;

        // 設置 iframe 佈局
        contentIframe.position(iframeX, iframeY);
        contentIframe.size(targetWidth, targetHeight);
    }
}

/**
 * 執行選單項目對應的動作
 */
function executeMenuItemAction(item) {
    console.log("Clicked:", item); 
    
    if (item === "關閉選單/筆記") {
        targetMenuX = -menuWidth; 
        menuLocked = false;       
        contentIframe.style('display', 'none'); 
        contentIframe.attribute('src', '');     
        
    } else if (MENU_LINKS[item]) {
        // 點擊內容連結時
        contentIframe.attribute('src', MENU_LINKS[item]); 
        contentIframe.style('display', 'block');          
        
        targetMenuX = -menuWidth; 
        menuLocked = false;
        
    } else {
        alert(`點擊了：${item} (尚未設定連結)`);
    }
}

// ------------------------------------
// 其他互動與繪圖函式 (保持不變)
// ------------------------------------

function mousePressed() {
    if (menuStateX > -menuWidth + 10) { 
        handleMenuClick();
    }
}

function handleMenuClick() {
    let itemHeight = height / 10;
    let padding = menuWidth * 0.1;

    for (let i = 0; i < menuItems.length; i++) {
        let textY = padding + i * itemHeight;

        if (mouseX > menuStateX + padding && mouseX < menuStateX + menuWidth - padding &&
            mouseY > textY - itemHeight/4 && mouseY < textY + itemHeight/4 ) {
            
            executeMenuItemAction(menuItems[i]);
            return;
        }
    }
}

function drawTitle() {
    push();
    
    textFont(BIAU_KAI_FONT);
    fill(255); 
    
    // 標題: 程式設計
    textSize(width * 0.05); 
    text("程式設計", width / 2, height / 2 - 40); 
    
    // 副標題: 414730035
    textSize(width * 0.03); 
    text("414730035", width / 2, height / 2 + 10); 
    
    pop();
}

function updateMenu() {
    if (menuLocked) {
        targetMenuX = 0;
    } else {
        if (mouseX < triggerZone) {
            targetMenuX = 0;
            if (menuStateX <= -menuWidth + 10) { 
                 menuLocked = true;
            }
        } else {
            targetMenuX = -menuWidth;
        }
    }

    menuStateX = lerp(menuStateX, targetMenuX, 0.1); 
}

function drawMenu() {
    push();
    
    translate(menuStateX, 0); 

    // 繪製選單背景
    noStroke();
    fill(255, 153); 
    rectMode(CORNER);
    rect(0, 0, menuWidth, height); 
    
    // 繪製選單項目（新增懸停效果）
    let itemHeight = height / 10;
    let padding = menuWidth * 0.1;
    let isHovering = false; 
    
    if (menuLocked || menuStateX > -menuWidth + 10) { 
        for (let i = 0; i < menuItems.length; i++) {
            let textY = padding + i * itemHeight;
            let itemXStart = padding;
            let itemXEnd = menuWidth - padding;
            
            let localMouseX = mouseX - menuStateX; 

            if (localMouseX > itemXStart && localMouseX < itemXEnd &&
                mouseY > textY - itemHeight/4 && mouseY < textY + itemHeight/4) {
                
                // 懸停時的背景效果
                fill(0, 50); 
                rect(0, textY - itemHeight/2, menuWidth, itemHeight);
                isHovering = true;
            }
        }
    }
    
    // 繪製文字
    fill(0); 
    textFont(BIAU_KAI_FONT);
    textSize(menuWidth * 0.1); 
    textAlign(LEFT, TOP); 

    for (let i = 0; i < menuItems.length; i++) {
        let textY = padding + i * itemHeight;
        text(menuItems[i], padding, textY);
    }
    
    // 懸停時顯示手型游標
    if (isHovering) {
        cursor(HAND);
    } else {
        cursor(ARROW);
    }

    pop();
}

// ------------------------------------
// 核心動畫類別 (保持不變)
// ------------------------------------

function INIT() {
    sceneTimer = 0;
    maxT2 = 0; 
    motions = [];
    motionClasses = [Motion01, Motion02, Motion03, Motion04, Motion05];
    let drawingRegion = width * 0.75;
    let cellCount = 25;
    let cellSize = drawingRegion / cellCount;
    let clr = '#000000';
    for (let i = 0; i < cellCount; i++) {
        for (let j = 0; j < cellCount; j++) {
            let x = cellSize * j + (cellSize / 2) + (width - drawingRegion) / 2;
            let y = cellSize * i + (cellSize / 2) + (height - drawingRegion) / 2;
            let MotionClass = random(motionClasses);
            let t = -int(dist(x, y, width / 2, height / 2) * 0.7);
            
            let newMotion = new MotionClass(x, y, cellSize, t, clr);
            motions.push(newMotion);
            
            let endTime = newMotion.t2 + abs(t);
            if (endTime > maxT2) {
                maxT2 = endTime;
            }
        }
    }
}

function easeInOutQuint(x) {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

class Agent {
    constructor(x, y, w, t, clr) {
        this.x = x;
        this.y = y;
        this.w = w;

        this.t1 = int(random(30, 100));
        this.t2 = this.t1 + int(random(30, 100));
        this.t = t;
        this.clr2 = color(clr);
        this.clr1 = color(random(colors));
        this.currentColor = this.clr1;
    }

    show() {
    }

    move() {
        if (0 < this.t && this.t < this.t1) {
            let n = norm(this.t, 0, this.t1 - 1);
            this.updateMotion1(easeInOutQuint(n));
        } else if (this.t1 < this.t && this.t < this.t2) {
            let n = norm(this.t, this.t1, this.t2 - 1);
            this.updateMotion2(easeInOutQuint(n));
        } else if (this.t >= this.t2) {
            this.updateMotion1(1);
            this.updateMotion2(1); 
            this.t = this.t2; 
        }
        this.t++;
    }

    run() {
        this.show();
        this.move();
    }

    updateMotion1(n) {

    }
    updateMotion2(n) {

    }

}

class Motion01 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 3;
        this.ang = int(random(4)) * (TAU / 4);
        this.size = 0;
    }

    show() {
        noStroke();
        fill(this.currentColor);
        square(this.x + this.shift * cos(this.ang), this.y + this.shift * sin(this.ang), this.size);
    }

    updateMotion1(n) {
        this.shift = lerp(this.w * 3, 0, n);
        this.size = lerp(0, this.w, n);
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
    }
    updateMotion2(n) {
        this.shift = 0;
        this.size = this.w;
        this.currentColor = this.clr2; 
    }
}

class Motion02 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 2;
        this.ang = int(random(4)) * (TAU / 4);
        this.size = 0;
        this.corner = this.w / 2;
    }

    show() {
        noStroke();
        fill(this.currentColor);
        square(this.x + this.shift * cos(this.ang), this.y + this.shift * sin(this.ang), this.size, this.corner);
    }

    updateMotion1(n) {
        this.shift = lerp(0, this.w * 2, n);
        this.size = lerp(0, this.w / 2, n);
    }

    updateMotion2(n) {
        this.size = lerp(this.w / 2, this.w, n);
        this.shift = lerp(this.w * 2, 0, n);
        this.corner = lerp(this.w / 2, 0, n);
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
    }
}

class Motion03 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 2;
        this.ang = 0;
        this.size = 0
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(this.ang);
        noStroke();
        fill(this.currentColor);
        square(0, 0, this.size);
        pop();
    }

    updateMotion1(n) {
        this.ang = lerp(0, TAU, n);
        this.size = lerp(0, this.w, n);
        this.currentColor = lerpColor(this.clr1, this.clr2, n);

    }
    updateMotion2(n) {
        this.ang = TAU;
        this.size = this.w;
        this.currentColor = this.clr2; 
    }
}

class Motion04 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 2;
        this.ang = int(random(4)) * (TAU / 4);
        this.rot = PI;
        this.side = 0;
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(this.ang);
        translate(-this.w / 2, -this.w / 2);
        rotate(this.rot);
        fill(this.currentColor);
        rect(this.w / 2, (this.w / 2) - (this.w - this.side) / 2, this.w, this.side);
        pop();
    }

    updateMotion1(n) {
        this.side = lerp(0, this.w, n);
    }

    updateMotion2(n) {
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
        this.rot = lerp(PI, 0, n);
    }
}

class Motion05 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w / 2;
        this.size = 0;
    }

    show() {
        push();
        translate(this.x, this.y);
        for (let i = 0; i < 4; i++) {
            fill(this.currentColor);
            square((this.w / 4) + this.shift, (this.w / 4) + this.shift, this.size);
            rotate(TAU / 4);
        }
        pop();
    }

    updateMotion1(n) {
        this.size = lerp(0, this.w / 4, n);
    }

    updateMotion2(n) {
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
        this.shift = lerp(this.w / 2, 0, n);
        this.size = lerp(this.w / 4, this.w / 2, n);

    }
}