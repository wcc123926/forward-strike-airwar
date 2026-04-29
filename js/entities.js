/**
 * 游戏实体类定义
 */

/**
 * 道具类型枚举
 */
const PowerUpType = {
    FIRE_UP: 'fireUp',
    SHIELD: 'shield',
    HEALTH: 'health',
    BOMB: 'bomb'
};

/**
 * 道具配置
 */
const PowerUpConfig = {
    [PowerUpType.FIRE_UP]: {
        color: '#ff6b35',
        glowColor: 'rgba(255, 107, 53, 0.6)',
        symbol: 'P',
        name: '火力升级'
    },
    [PowerUpType.SHIELD]: {
        color: '#00d4ff',
        glowColor: 'rgba(0, 212, 255, 0.6)',
        symbol: 'S',
        name: '获得护盾'
    },
    [PowerUpType.HEALTH]: {
        color: '#44ff44',
        glowColor: 'rgba(68, 255, 68, 0.6)',
        symbol: '+',
        name: '生命恢复'
    },
    [PowerUpType.BOMB]: {
        color: '#ff44ff',
        glowColor: 'rgba(255, 68, 255, 0.6)',
        symbol: 'B',
        name: '获得炸弹'
    }
};

/**
 * 火力等级配置 - 5档火力系统
 */
const FireLevelConfig = {
    1: {
        name: '基础火力',
        shootDelay: 8,
        bulletCount: 1,
        bulletSpread: 0,
        bulletWidth: 6,
        bulletHeight: 20,
        description: '单发射击'
    },
    2: {
        name: '强化火力',
        shootDelay: 7,
        bulletCount: 2,
        bulletSpread: 15,
        bulletWidth: 7,
        bulletHeight: 22,
        description: '双发射击'
    },
    3: {
        name: '火力全开',
        shootDelay: 6,
        bulletCount: 3,
        bulletSpread: 20,
        bulletWidth: 8,
        bulletHeight: 24,
        description: '三发射击 + 射速提升'
    },
    4: {
        name: '火力狂暴',
        shootDelay: 5,
        bulletCount: 4,
        bulletSpread: 25,
        bulletWidth: 9,
        bulletHeight: 26,
        description: '四发散射 + 弹道变宽'
    },
    5: {
        name: '火力MAX',
        shootDelay: 4,
        bulletCount: 5,
        bulletSpread: 30,
        bulletWidth: 10,
        bulletHeight: 28,
        description: '五发扇形 + 极限射速'
    }
};

const MAX_FIRE_LEVEL = 5;

/**
 * 星星背景类
 */
class Star {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.reset(true);
    }
    
    reset(initial = false) {
        this.x = random(0, this.canvasWidth);
        this.y = initial ? random(0, this.canvasHeight) : -random(10, 50);
        this.size = random(0.5, 2.5);
        this.speed = this.size * random(0.8, 1.5);
        this.alpha = random(0.3, 1);
        this.twinkleSpeed = random(0.01, 0.05);
        this.twinkleDirection = random(0, 1) > 0.5 ? 1 : -1;
    }
    
    update() {
        this.y += this.speed;
        
        // 闪烁效果
        this.alpha += this.twinkleDirection * this.twinkleSpeed;
        if (this.alpha >= 1) {
            this.alpha = 1;
            this.twinkleDirection = -1;
        } else if (this.alpha <= 0.3) {
            this.alpha = 0.3;
            this.twinkleDirection = 1;
        }
        
        if (this.y > this.canvasHeight + 10) {
            this.reset();
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
        
        // 光晕效果
        if (this.size > 1.5) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 220, 255, ${this.alpha * 0.2})`;
            ctx.fill();
        }
    }
}

/**
 * 星云背景类
 */
class Nebula {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.reset(true);
    }
    
    reset(initial = false) {
        this.x = random(0, this.canvasWidth);
        this.y = initial ? random(0, this.canvasHeight) : -random(200, 400);
        this.radius = random(80, 200);
        this.speed = random(0.3, 0.8);
        this.color = randomChoice([
            { r: 100, g: 50, b: 150 },
            { r: 50, g: 100, b: 150 },
            { r: 150, g: 50, b: 100 },
            { r: 50, g: 150, b: 150 }
        ]);
        this.alpha = random(0.05, 0.15);
    }
    
    update() {
        this.y += this.speed;
        
        if (this.y > this.canvasHeight + this.radius) {
            this.reset();
        }
    }
    
    draw(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

/**
 * 玩家飞机类
 */
class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.width = 50;
        this.height = 60;
        this.x = canvasWidth / 2;
        this.y = canvasHeight - 120;
        this.targetX = this.x;
        this.targetY = this.y;
        this.speed = 8;
        this.health = 100;
        this.maxHealth = 100;
        this.shootCooldown = 0;
        this.shootDelay = 8;
        this.invincible = false;
        this.invincibleTime = 0;
        this.invincibleDuration = 60;
        this.engineParticles = [];
        this.score = 0;
        this.kills = 0;
        
        // 火力等级系统
        this.fireLevel = 1;
        this.maxFireLevel = MAX_FIRE_LEVEL;
        
        // 护盾系统
        this.shield = new ShieldEffect();
        
        // 炸弹系统
        this.bombs = 0;
        this.maxBombs = 3;
        
        // 统计信息
        this.stats = {
            maxFireLevelReached: 1,
            powerUpsCollected: 0,
            damageDealt: 0,
            damageTaken: 0,
            bombsUsed: 0
        };
    }
    
    reset() {
        this.x = this.canvasWidth / 2;
        this.y = this.canvasHeight - 120;
        this.targetX = this.x;
        this.targetY = this.y;
        this.health = 100;
        this.maxHealth = 100;
        this.shootCooldown = 0;
        this.invincible = false;
        this.invincibleTime = 0;
        this.engineParticles = [];
        this.score = 0;
        this.kills = 0;
        
        // 重置火力和道具
        this.fireLevel = 1;
        this.shootDelay = FireLevelConfig[1].shootDelay;
        this.shield = new ShieldEffect();
        this.bombs = 0;
        
        // 重置统计
        this.stats = {
            maxFireLevelReached: 1,
            powerUpsCollected: 0,
            damageDealt: 0,
            damageTaken: 0,
            bombsUsed: 0
        };
    }
    
    updateTarget(mouseX, mouseY) {
        this.targetX = mouseX;
        this.targetY = mouseY;
        
        // 限制目标位置在画布内
        this.targetX = clamp(
            this.targetX,
            this.width / 2,
            this.canvasWidth - this.width / 2
        );
        this.targetY = clamp(
            this.targetY,
            this.height / 2,
            this.canvasHeight - this.height / 2
        );
    }
    
    update() {
        // 平滑移动到目标位置
        this.x = lerp(this.x, this.targetX, 0.15);
        this.y = lerp(this.y, this.targetY, 0.15);
        
        // 射击冷却
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
        
        // 无敌时间
        if (this.invincible) {
            this.invincibleTime--;
            if (this.invincibleTime <= 0) {
                this.invincible = false;
            }
        }
        
        // 更新护盾
        this.shield.update();
        
        // 引擎粒子
        this.updateEngineParticles();
    }
    
    updateEngineParticles() {
        // 根据火力等级调整粒子效果
        const particleRate = 0.3 + (this.fireLevel - 1) * 0.05;
        
        // 生成新粒子
        if (Math.random() > 1 - particleRate) {
            const particleCount = Math.floor(this.fireLevel / 2) + 1;
            
            for (let i = 0; i < particleCount; i++) {
                this.engineParticles.push({
                    x: this.x + random(-8, 8),
                    y: this.y + this.height / 2,
                    size: random(3, 6) + this.fireLevel * 0.5,
                    speedY: random(2, 4) + this.fireLevel * 0.3,
                    alpha: random(0.5, 0.8),
                    color: randomChoice([
                        { r: 255, g: 150, b: 50 },
                        { r: 255, g: 100, b: 50 },
                        { r: 255, g: 200, b: 100 }
                    ])
                });
            }
        }
        
        // 更新粒子
        for (let i = this.engineParticles.length - 1; i >= 0; i--) {
            const p = this.engineParticles[i];
            p.y += p.speedY;
            p.size -= 0.1;
            p.alpha -= 0.02;
            
            if (p.size <= 0 || p.alpha <= 0) {
                this.engineParticles.splice(i, 1);
            }
        }
    }
    
    canShoot() {
        return this.shootCooldown <= 0;
    }
    
    shoot() {
        this.shootCooldown = this.shootDelay;
    }
    
    // 火力升级
    upgradeFire() {
        if (this.fireLevel < this.maxFireLevel) {
            this.fireLevel++;
            const config = FireLevelConfig[this.fireLevel];
            this.shootDelay = config.shootDelay;
            this.stats.maxFireLevelReached = Math.max(this.stats.maxFireLevelReached, this.fireLevel);
            this.stats.powerUpsCollected++;
            return true;
        }
        return false;
    }
    
    // 激活护盾
    activateShield() {
        this.shield.activate();
        this.stats.powerUpsCollected++;
    }
    
    // 恢复生命值
    heal(amount) {
        const healed = Math.min(amount, this.maxHealth - this.health);
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.stats.powerUpsCollected++;
        return healed;
    }
    
    // 增加炸弹
    addBomb() {
        if (this.bombs < this.maxBombs) {
            this.bombs++;
            this.stats.powerUpsCollected++;
            return true;
        }
        return false;
    }
    
    // 使用炸弹
    useBomb() {
        if (this.bombs > 0) {
            this.bombs--;
            this.stats.bombsUsed++;
            return true;
        }
        return false;
    }
    
    takeDamage(amount) {
        if (this.invincible) return false;
        
        // 护盾优先吸收伤害
        const remainingDamage = this.shield.takeDamage(amount);
        this.stats.damageTaken += (amount - remainingDamage);
        
        if (remainingDamage > 0) {
            this.health -= remainingDamage;
            this.stats.damageTaken += remainingDamage;
            this.invincible = true;
            this.invincibleTime = this.invincibleDuration;
        }
        
        return this.health <= 0;
    }
    
    getCollisionRect() {
        // 使用更小的碰撞盒，让游戏更友好
        return {
            x: this.x - this.width / 4,
            y: this.y - this.height / 4,
            width: this.width / 2,
            height: this.height / 2
        };
    }
    
    draw(ctx) {
        // 绘制引擎粒子
        this.engineParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
            ctx.fill();
        });
        
        // 无敌时闪烁
        if (this.invincible && Math.floor(this.invincibleTime / 5) % 2 === 0) {
            return;
        }
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 飞机主体 - 现代战斗机风格
        // 机身阴影
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2 + 5);
        ctx.lineTo(-this.width / 2.5, this.height / 2);
        ctx.lineTo(-this.width / 4, this.height / 3);
        ctx.lineTo(0, this.height / 2.5);
        ctx.lineTo(this.width / 4, this.height / 3);
        ctx.lineTo(this.width / 2.5, this.height / 2);
        ctx.closePath();
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        
        // 机身主体
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(-this.width / 2.5, this.height / 2 - 5);
        ctx.lineTo(-this.width / 4, this.height / 3 - 5);
        ctx.lineTo(0, this.height / 2.5 - 5);
        ctx.lineTo(this.width / 4, this.height / 3 - 5);
        ctx.lineTo(this.width / 2.5, this.height / 2 - 5);
        ctx.closePath();
        
        const bodyGradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        bodyGradient.addColorStop(0, '#4a6fa5');
        bodyGradient.addColorStop(0.5, '#2c3e50');
        bodyGradient.addColorStop(1, '#1a252f');
        ctx.fillStyle = bodyGradient;
        ctx.fill();
        ctx.strokeStyle = '#64b5f6';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 驾驶舱
        ctx.beginPath();
        ctx.ellipse(0, -this.height / 6, 8, 15, 0, 0, Math.PI * 2);
        const cockpitGradient = ctx.createLinearGradient(0, -this.height / 6 - 15, 0, -this.height / 6 + 15);
        cockpitGradient.addColorStop(0, '#90caf9');
        cockpitGradient.addColorStop(0.5, '#42a5f5');
        cockpitGradient.addColorStop(1, '#1e88e5');
        ctx.fillStyle = cockpitGradient;
        ctx.fill();
        ctx.strokeStyle = '#bbdefb';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 机翼装饰
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(-this.width / 2.8, this.height / 6, 8, 3);
        ctx.fillRect(this.width / 2.8 - 8, this.height / 6, 8, 3);
        
        // 引擎发光
        const engineGlow = ctx.createRadialGradient(0, this.height / 2.5, 0, 0, this.height / 2.5, 15);
        engineGlow.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
        engineGlow.addColorStop(0.5, 'rgba(255, 150, 50, 0.4)');
        engineGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.beginPath();
        ctx.arc(0, this.height / 2.5, 15, 0, Math.PI * 2);
        ctx.fillStyle = engineGlow;
        ctx.fill();
        
        ctx.restore();
    }
}

/**
 * 玩家子弹类
 */
class Bullet {
    constructor(x, y, angle = 0, width = 6, height = 20) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 12;
        this.damage = 25;
        this.active = true;
        this.angle = angle;
        
        // 根据角度计算速度分量
        this.vx = Math.sin(angle) * this.speed;
        this.vy = -Math.cos(angle) * this.speed;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.y < -this.height || this.x < -this.width || this.x > 500) {
            this.active = false;
        }
    }
    
    getCollisionRect() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // 子弹光晕
        const glowSize = 12 + this.width;
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        glow.addColorStop(0, 'rgba(100, 200, 255, 0.6)');
        glow.addColorStop(1, 'rgba(100, 200, 255, 0)');
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        
        // 子弹主体
        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#64b5f6');
        gradient.addColorStop(1, '#1976d2');
        
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.restore();
    }
}

/**
 * 敌机类型枚举
 */
const EnemyType = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    ELITE: 'elite'
};

/**
 * 敌机配置
 */
const EnemyConfig = {
    [EnemyType.SMALL]: {
        width: 35,
        height: 40,
        speed: 3,
        health: 50,
        score: 100,
        color: '#e74c3c',
        canShoot: false
    },
    [EnemyType.MEDIUM]: {
        width: 50,
        height: 55,
        speed: 2,
        health: 100,
        score: 250,
        color: '#9b59b6',
        canShoot: true,
        shootDelay: 90
    },
    [EnemyType.LARGE]: {
        width: 70,
        height: 80,
        speed: 1.5,
        health: 200,
        score: 500,
        color: '#e67e22',
        canShoot: true,
        shootDelay: 60
    },
    [EnemyType.ELITE]: {
        width: 60,
        height: 70,
        speed: 2.5,
        health: 150,
        score: 400,
        color: '#f39c12',
        canShoot: true,
        shootDelay: 45,
        movesSideways: true
    }
};

/**
 * 敌机类
 */
class Enemy {
    constructor(x, y, type, canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.type = type;
        
        const config = EnemyConfig[type];
        this.width = config.width;
        this.height = config.height;
        this.x = x;
        this.y = y;
        this.speed = config.speed;
        this.health = config.health;
        this.maxHealth = config.health;
        this.score = config.score;
        this.color = config.color;
        this.canShoot = config.canShoot;
        this.shootDelay = config.shootDelay || 0;
        this.shootCooldown = 0;
        this.movesSideways = config.movesSideways || false;
        this.sidewaysDirection = Math.random() > 0.5 ? 1 : -1;
        this.sidewaysSpeed = 1.5;
        this.active = true;
        this.explosionParticles = [];
    }
    
    update() {
        this.y += this.speed;
        
        // 横向移动
        if (this.movesSideways) {
            this.x += this.sidewaysDirection * this.sidewaysSpeed;
            if (this.x <= this.width / 2 || this.x >= this.canvasWidth - this.width / 2) {
                this.sidewaysDirection *= -1;
            }
        }
        
        // 射击冷却
        if (this.canShoot) {
            if (this.shootCooldown > 0) {
                this.shootCooldown--;
            }
        }
        
        // 检查是否超出屏幕
        if (this.y > this.canvasHeight + this.height) {
            this.active = false;
        }
    }
    
    canEnemyShoot() {
        return this.canShoot && this.shootCooldown <= 0;
    }
    
    shoot() {
        this.shootCooldown = this.shootDelay;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
    
    getCollisionRect() {
        return {
            x: this.x - this.width / 2.5,
            y: this.y - this.height / 2.5,
            width: this.width / 1.25,
            height: this.height / 1.25
        };
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 飞机主体 - 敌机风格
        const config = EnemyConfig[this.type];
        
        // 机身阴影
        ctx.beginPath();
        ctx.moveTo(0, this.height / 2 + 5);
        ctx.lineTo(-this.width / 2.5, -this.height / 2);
        ctx.lineTo(-this.width / 4, -this.height / 3);
        ctx.lineTo(0, -this.height / 2.5);
        ctx.lineTo(this.width / 4, -this.height / 3);
        ctx.lineTo(this.width / 2.5, -this.height / 2);
        ctx.closePath();
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        
        // 机身主体
        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        ctx.lineTo(-this.width / 2.5, -this.height / 2 + 5);
        ctx.lineTo(-this.width / 4, -this.height / 3 + 5);
        ctx.lineTo(0, -this.height / 2.5 + 5);
        ctx.lineTo(this.width / 4, -this.height / 3 + 5);
        ctx.lineTo(this.width / 2.5, -this.height / 2 + 5);
        ctx.closePath();
        
        const bodyGradient = ctx.createLinearGradient(0, this.height / 2, 0, -this.height / 2);
        bodyGradient.addColorStop(0, this.color);
        bodyGradient.addColorStop(0.5, this.darkenColor(this.color, 30));
        bodyGradient.addColorStop(1, this.darkenColor(this.color, 60));
        ctx.fillStyle = bodyGradient;
        ctx.fill();
        ctx.strokeStyle = this.lightenColor(this.color, 30);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 核心装饰
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 6, 0, Math.PI * 2);
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 6);
        coreGradient.addColorStop(0, this.lightenColor(this.color, 50));
        coreGradient.addColorStop(1, this.color);
        ctx.fillStyle = coreGradient;
        ctx.fill();
        ctx.strokeStyle = this.lightenColor(this.color, 70);
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 血条
        if (this.health < this.maxHealth) {
            const barWidth = this.width;
            const barHeight = 4;
            const barY = -this.height / 2 - 10;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
            
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff44' : '#ff4444';
            ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
        }
        
        ctx.restore();
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    lightenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

/**
 * 敌机子弹类
 */
class EnemyBullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;
        this.speed = 6;
        this.damage = 20;
        this.active = true;
    }
    
    update() {
        this.y += this.speed;
        
        if (this.y > 720 + this.height) {
            this.active = false;
        }
    }
    
    getCollisionRect() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
    
    draw(ctx) {
        // 子弹光晕
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 12);
        glow.addColorStop(0, 'rgba(255, 100, 100, 0.6)');
        glow.addColorStop(1, 'rgba(255, 100, 100, 0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        
        // 子弹主体
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.width / 2);
        gradient.addColorStop(0, '#ffaaaa');
        gradient.addColorStop(0.5, '#ff4444');
        gradient.addColorStop(1, '#cc0000');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

/**
 * 爆炸效果类
 */
class Explosion {
    constructor(x, y, size = 1) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.particles = [];
        this.active = true;
        this.lifetime = 30;
        this.maxLifetime = 30;
        
        this.initParticles();
    }
    
    initParticles() {
        const particleCount = Math.floor(15 * this.size);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + random(-0.2, 0.2);
            const speed = random(2, 5) * this.size;
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: random(3, 8) * this.size,
                maxSize: random(3, 8) * this.size,
                alpha: 1,
                color: randomChoice([
                    { r: 255, g: 200, b: 100 },
                    { r: 255, g: 150, b: 50 },
                    { r: 255, g: 100, b: 50 },
                    { r: 255, g: 50, b: 50 }
                ])
            });
        }
    }
    
    update() {
        this.lifetime--;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.size -= 0.15;
            p.alpha = this.lifetime / this.maxLifetime;
            
            if (p.size <= 0 || p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        if (this.lifetime <= 0 && this.particles.length === 0) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        // 中心闪光
        if (this.lifetime > this.maxLifetime * 0.6) {
            const glowAlpha = (this.lifetime - this.maxLifetime * 0.6) / (this.maxLifetime * 0.4);
            const glowSize = 30 * this.size * glowAlpha;
            
            const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
            glow.addColorStop(0, `rgba(255, 255, 200, ${glowAlpha * 0.8})`);
            glow.addColorStop(0.5, `rgba(255, 200, 100, ${glowAlpha * 0.4})`);
            glow.addColorStop(1, 'rgba(255, 100, 50, 0)');
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();
        }
        
        // 粒子
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0, p.size), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
            ctx.fill();
        });
    }
}

/**
 * 受击效果类
 */
class HitEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.lifetime = 15;
        this.maxLifetime = 15;
        this.active = true;
    }
    
    update() {
        this.lifetime--;
        if (this.lifetime <= 0) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        const progress = 1 - this.lifetime / this.maxLifetime;
        const size = 20 + progress * 30;
        const alpha = 1 - progress;
        
        // 白色闪光
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size);
        glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
        glow.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.4})`);
        glow.addColorStop(1, 'rgba(100, 150, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
    }
}

/**
 * 道具类
 */
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.active = true;
        this.angle = 0;
        this.bobOffset = 0;
        this.bobSpeed = 0.1;
        
        const config = PowerUpConfig[type];
        this.color = config.color;
        this.glowColor = config.glowColor;
        this.symbol = config.symbol;
    }
    
    update() {
        this.y += this.speed;
        this.angle += 0.05;
        this.bobOffset = Math.sin(this.angle) * 3;
        
        if (this.y > 720 + this.height) {
            this.active = false;
        }
    }
    
    getCollisionRect() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + this.bobOffset);
        ctx.rotate(this.angle * 0.5);
        
        // 光晕
        const glowSize = 25 + Math.sin(this.angle * 2) * 5;
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        glow.addColorStop(0, this.glowColor);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        
        // 圆形背景
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 40));
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 符号
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);
        
        ctx.restore();
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

/**
 * 文字提示类
 */
class TextNotification {
    constructor(x, y, text, color = '#ffffff', duration = 90) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.duration = duration;
        this.lifetime = duration;
        this.active = true;
        this.fontSize = 18;
        this.startY = y;
    }
    
    update() {
        this.lifetime--;
        this.y -= 0.8;
        
        if (this.lifetime <= 0) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        const progress = this.lifetime / this.duration;
        const alpha = Math.min(1, progress * 2);
        const scale = 1 + (1 - progress) * 0.2;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);
        
        // 文字阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, 2, 2);
        
        // 文字主体
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);
        
        ctx.restore();
    }
}

/**
 * 护盾效果类
 */
class ShieldEffect {
    constructor() {
        this.active = false;
        this.health = 0;
        this.maxHealth = 50;
        this.angle = 0;
        this.pulsePhase = 0;
    }
    
    activate() {
        this.active = true;
        this.health = this.maxHealth;
    }
    
    deactivate() {
        this.active = false;
        this.health = 0;
    }
    
    takeDamage(amount) {
        if (!this.active) return amount;
        
        const absorbed = Math.min(this.health, amount);
        this.health -= absorbed;
        
        if (this.health <= 0) {
            this.deactivate();
        }
        
        return amount - absorbed;
    }
    
    update() {
        this.angle += 0.02;
        this.pulsePhase += 0.05;
    }
    
    draw(ctx, playerX, playerY, playerWidth, playerHeight) {
        if (!this.active) return;
        
        const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.05;
        const shieldRadius = Math.max(playerWidth, playerHeight) * 0.75 * pulseScale;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.save();
        ctx.translate(playerX, playerY);
        ctx.rotate(this.angle);
        
        // 外光环
        const outerGlow = ctx.createRadialGradient(0, 0, shieldRadius * 0.5, 0, 0, shieldRadius * 1.5);
        outerGlow.addColorStop(0, `rgba(0, 212, 255, ${0.15 * healthPercent})`);
        outerGlow.addColorStop(1, 'rgba(0, 212, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();
        
        // 主护盾
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        
        const shieldGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shieldRadius);
        shieldGradient.addColorStop(0, `rgba(0, 212, 255, ${0.1 * healthPercent})`);
        shieldGradient.addColorStop(0.7, `rgba(0, 212, 255, ${0.3 * healthPercent})`);
        shieldGradient.addColorStop(1, `rgba(0, 212, 255, ${0.5 * healthPercent})`);
        
        ctx.fillStyle = shieldGradient;
        ctx.fill();
        
        // 护盾边框
        ctx.strokeStyle = `rgba(100, 220, 255, ${healthPercent})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 装饰线
        ctx.strokeStyle = `rgba(150, 230, 255, ${0.4 * healthPercent})`;
        ctx.lineWidth = 1;
        
        // 六边形装饰
        for (let i = 0; i < 6; i++) {
            const angle1 = (Math.PI * 2 * i) / 6;
            const angle2 = (Math.PI * 2 * (i + 1)) / 6;
            
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle1) * shieldRadius * 0.8, Math.sin(angle1) * shieldRadius * 0.8);
            ctx.lineTo(Math.cos(angle2) * shieldRadius * 0.8, Math.sin(angle2) * shieldRadius * 0.8);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

/**
 * 首领敌机类型枚举
 */
const BossType = {
    MINI: 'mini',
    ELITE: 'elite'
};

/**
 * 首领配置
 */
const BossConfig = {
    [BossType.MINI]: {
        width: 100,
        height: 100,
        speed: 1,
        health: 800,
        score: 2000,
        color: '#ff4444',
        shootDelay: 40,
        specialShootDelay: 120,
        name: '突击队长'
    },
    [BossType.ELITE]: {
        width: 120,
        height: 120,
        speed: 0.8,
        health: 1500,
        score: 5000,
        color: '#ff00ff',
        shootDelay: 35,
        specialShootDelay: 100,
        name: '精英指挥官'
    }
};
