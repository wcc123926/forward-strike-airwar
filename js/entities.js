/**
 * 游戏实体类定义
 */

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
        
        // 引擎粒子
        this.updateEngineParticles();
    }
    
    updateEngineParticles() {
        // 生成新粒子
        if (Math.random() > 0.3) {
            this.engineParticles.push({
                x: this.x + random(-8, 8),
                y: this.y + this.height / 2,
                size: random(3, 6),
                speedY: random(2, 4),
                alpha: random(0.5, 0.8),
                color: randomChoice([
                    { r: 255, g: 150, b: 50 },
                    { r: 255, g: 100, b: 50 },
                    { r: 255, g: 200, b: 100 }
                ])
            });
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
    
    takeDamage(amount) {
        if (this.invincible) return;
        
        this.health -= amount;
        this.invincible = true;
        this.invincibleTime = this.invincibleDuration;
        
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
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 6;
        this.height = 20;
        this.speed = 12;
        this.damage = 25;
        this.active = true;
    }
    
    update() {
        this.y -= this.speed;
        
        if (this.y < -this.height) {
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
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 15);
        glow.addColorStop(0, 'rgba(100, 200, 255, 0.6)');
        glow.addColorStop(1, 'rgba(100, 200, 255, 0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        
        // 子弹主体
        const gradient = ctx.createLinearGradient(this.x, this.y - this.height / 2, this.x, this.y + this.height / 2);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#64b5f6');
        gradient.addColorStop(1, '#1976d2');
        
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
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
