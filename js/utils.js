/**
 * 游戏工具函数库
 */

/**
 * 随机数生成器
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 随机整数生成器
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机整数
 */
function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

/**
 * 随机颜色生成器
 * @param {number} alpha - 透明度 (0-1)
 * @returns {string} RGBA颜色字符串
 */
function randomColor(alpha = 1) {
    const r = Math.floor(random(0, 255));
    const g = Math.floor(random(0, 255));
    const b = Math.floor(random(0, 255));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 两点之间的距离
 * @param {number} x1 - 点1的x坐标
 * @param {number} y1 - 点1的y坐标
 * @param {number} x2 - 点2的x坐标
 * @param {number} y2 - 点2的y坐标
 * @returns {number} 距离
 */
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 矩形碰撞检测
 * @param {Object} rect1 - 矩形1 {x, y, width, height}
 * @param {Object} rect2 - 矩形2 {x, y, width, height}
 * @returns {boolean} 是否碰撞
 */
function rectCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

/**
 * 圆形碰撞检测
 * @param {Object} circle1 - 圆形1 {x, y, radius}
 * @param {Object} circle2 - 圆形2 {x, y, radius}
 * @returns {boolean} 是否碰撞
 */
function circleCollision(circle1, circle2) {
    const dist = distance(circle1.x, circle1.y, circle2.x, circle2.y);
    return dist < circle1.radius + circle2.radius;
}

/**
 * 圆形与矩形碰撞检测
 * @param {Object} circle - 圆形 {x, y, radius}
 * @param {Object} rect - 矩形 {x, y, width, height}
 * @returns {boolean} 是否碰撞
 */
function circleRectCollision(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const dist = distance(circle.x, circle.y, closestX, closestY);
    return dist < circle.radius;
}

/**
 * 线性插值
 * @param {number} start - 起始值
 * @param {number} end - 结束值
 * @param {number} t - 插值因子 (0-1)
 * @returns {number} 插值结果
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * 角度转弧度
 * @param {number} degrees - 角度
 * @returns {number} 弧度
 */
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * 弧度转角度
 * @param {number} radians - 弧度
 * @returns {number} 角度
 */
function radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
}

/**
 * 限制数值在范围内
 * @param {number} value - 数值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的数值
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * 缓动函数 - 平滑开始和结束
 * @param {number} t - 进度 (0-1)
 * @returns {number} 缓动后的值
 */
function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * 缓动函数 - 平滑开始
 * @param {number} t - 进度 (0-1)
 * @returns {number} 缓动后的值
 */
function easeIn(t) {
    return t * t;
}

/**
 * 缓动函数 - 平滑结束
 * @param {number} t - 进度 (0-1)
 * @returns {number} 缓动后的值
 */
function easeOut(t) {
    return 1 - (1 - t) * (1 - t);
}

/**
 * 从数组中随机选择一个元素
 * @param {Array} arr - 数组
 * @returns {*} 随机元素
 */
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 洗牌算法
 * @param {Array} arr - 数组
 * @returns {Array} 洗牌后的数组
 */
function shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * 防抖函数
 * @param {Function} func - 函数
 * @param {number} wait - 等待时间(ms)
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 函数
 * @param {number} limit - 时间限制(ms)
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 颜色工具函数 - 生成渐变色
 * @param {string} color1 - 起始颜色 (hex)
 * @param {string} color2 - 结束颜色 (hex)
 * @param {number} steps - 步数
 * @returns {Array} 颜色数组
 */
function generateGradient(color1, color2, steps) {
    const start = hexToRgb(color1);
    const end = hexToRgb(color2);
    const colors = [];
    
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const r = Math.round(lerp(start.r, end.r, t));
        const g = Math.round(lerp(start.g, end.g, t));
        const b = Math.round(lerp(start.b, end.b, t));
        colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    return colors;
}

/**
 * Hex颜色转RGB
 * @param {string} hex - Hex颜色
 * @returns {Object} RGB对象 {r, g, b}
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * RGB颜色转Hex
 * @param {number} r - 红色分量
 * @param {number} g - 绿色分量
 * @param {number} b - 蓝色分量
 * @returns {string} Hex颜色
 */
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
