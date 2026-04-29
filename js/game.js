/**
 * 游戏主逻辑
 */

// 游戏状态枚举
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
    LEVEL_COMPLETE: 'levelComplete',
    VICTORY: 'victory',
    PAUSED: 'paused'
};

// 关卡配置
const LevelConfig = {
    1: { enemySpawnRate: 60, smallEnemyChance: 0.7, mediumEnemyChance: 0.3, largeEnemyChance: 0, eliteEnemyChance: 0, requiredKills: 10, enemyHealthMultiplier: 1, enemySpeedMultiplier: 1 },
    2: { enemySpawnRate: 55, smallEnemyChance: 0.6, mediumEnemyChance: 0.35, largeEnemyChance: 0.05, eliteEnemyChance: 0, requiredKills: 15, enemyHealthMultiplier: 1.1, enemySpeedMultiplier: 1 },
    3: { enemySpawnRate: 50, smallEnemyChance: 0.5, mediumEnemyChance: 0.35, largeEnemyChance: 0.1, eliteEnemyChance: 0.05, requiredKills: 20, enemyHealthMultiplier: 1.2, enemySpeedMultiplier: 1.1 },
    4: { enemySpawnRate: 45, smallEnemyChance: 0.45, mediumEnemyChance: 0.35, largeEnemyChance: 0.12, eliteEnemyChance: 0.08, requiredKills: 25, enemyHealthMultiplier: 1.3, enemySpeedMultiplier: 1.1 },
    5: { enemySpawnRate: 40, smallEnemyChance: 0.4, mediumEnemyChance: 0.35, largeEnemyChance: 0.15, eliteEnemyChance: 0.1, requiredKills: 30, enemyHealthMultiplier: 1.5, enemySpeedMultiplier: 1.2 },
    6: { enemySpawnRate: 38, smallEnemyChance: 0.35, mediumEnemyChance: 0.35, largeEnemyChance: 0.18, eliteEnemyChance: 0.12, requiredKills: 35, enemyHealthMultiplier: 1.6, enemySpeedMultiplier: 1.2 },
    7: { enemySpawnRate: 35, smallEnemyChance: 0.3, mediumEnemyChance: 0.35, largeEnemyChance: 0.2, eliteEnemyChance: 0.15, requiredKills: 40, enemyHealthMultiplier: 1.8, enemySpeedMultiplier: 1.3 },
    8: { enemySpawnRate: 32, smallEnemyChance: 0.25, mediumEnemyChance: 0.35, largeEnemyChance: 0.23, eliteEnemyChance: 0.17, requiredKills: 45, enemyHealthMultiplier: 2, enemySpeedMultiplier: 1.3 },
    9: { enemySpawnRate: 30, smallEnemyChance: 0.2, mediumEnemyChance: 0.35, largeEnemyChance: 0.25, eliteEnemyChance: 0.2, requiredKills: 50, enemyHealthMultiplier: 2.2, enemySpeedMultiplier: 1.4 },
    10: { enemySpawnRate: 28, smallEnemyChance: 0.15, mediumEnemyChance: 0.35, largeEnemyChance: 0.28, eliteEnemyChance: 0.22, requiredKills: 60, enemyHealthMultiplier: 2.5, enemySpeedMultiplier: 1.5 }
};

const MAX_LEVEL = 10;

/**
 * 游戏主类
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布尺寸
        this.canvas.width = 480;
        this.canvas.height = 720;
        
        // 游戏状态
        this.state = GameState.MENU;
        this.previousState = null;
        
        // 游戏对象
        this.stars = [];
        this.nebulas = [];
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.explosions = [];
        this.hitEffects = [];
        
        // 关卡系统
        this.currentLevel = 1;
        this.enemiesKilled = 0;
        this.totalEnemiesKilled = 0;
        this.totalScore = 0;
        this.enemySpawnTimer = 0;
        this.levelCompleteTriggered = false;
        
        // 鼠标位置
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height - 120;
        this.isMouseOnCanvas = false;
        
        // 屏幕震动
        this.screenShake = 0;
        this.screenShakeX = 0;
        this.screenShakeY = 0;
        
        // 初始化
        this.init();
        this.bindEvents();
        this.gameLoop();
    }
    
    init() {
        // 创建星星背景
        for (let i = 0; i < 80; i++) {
            this.stars.push(new Star(this.canvas.width, this.canvas.height));
        }
        
        // 创建星云背景
        for (let i = 0; i < 5; i++) {
            this.nebulas.push(new Nebula(this.canvas.width, this.canvas.height));
        }
        
        // 创建玩家
        this.player = new Player(this.canvas.width, this.canvas.height);
    }
    
    bindEvents() {
        // 鼠标移动事件
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
            this.isMouseOnCanvas = true;
        });
        
        this.canvas.addEventListener('mouseenter', () => {
            this.isMouseOnCanvas = true;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseOnCanvas = false;
        });
        
        // 触摸事件支持
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const touch = e.touches[0];
            
            this.mouseX = (touch.clientX - rect.left) * scaleX;
            this.mouseY = (touch.clientY - rect.top) * scaleY;
            this.isMouseOnCanvas = true;
        });
        
        // UI按钮事件
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.goToMenu();
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.goToMenu();
        });
    }
    
    startGame() {
        this.resetGame();
        this.state = GameState.PLAYING;
        this.hideAllMenus();
        document.getElementById('game-ui').classList.remove('hidden');
    }
    
    restartGame() {
        this.resetGame();
        this.state = GameState.PLAYING;
        this.hideAllMenus();
        document.getElementById('game-ui').classList.remove('hidden');
    }
    
    resetGame() {
        this.currentLevel = 1;
        this.enemiesKilled = 0;
        this.totalEnemiesKilled = 0;
        this.totalScore = 0;
        this.enemySpawnTimer = 0;
        this.screenShake = 0;
        this.levelCompleteTriggered = false;
        
        // 重置玩家
        this.player.reset();
        
        // 清空游戏对象
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.explosions = [];
        this.hitEffects = [];
        
        // 更新UI
        this.updateUI();
    }
    
    goToMenu() {
        this.state = GameState.MENU;
        this.hideAllMenus();
        document.getElementById('start-menu').classList.remove('hidden');
    }
    
    nextLevel() {
        this.currentLevel++;
        this.enemiesKilled = 0;
        this.enemySpawnTimer = 0;
        this.levelCompleteTriggered = false;
        
        // 重置玩家关卡得分
        this.player.score = 0;
        
        // 清空敌人和子弹
        this.enemies = [];
        this.enemyBullets = [];
        this.bullets = [];
        
        // 恢复玩家部分生命值
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
        
        this.state = GameState.PLAYING;
        this.hideAllMenus();
        document.getElementById('game-ui').classList.remove('hidden');
        
        this.updateUI();
    }
    
    hideAllMenus() {
        document.getElementById('start-menu').classList.add('hidden');
        document.getElementById('game-ui').classList.add('hidden');
        document.getElementById('game-over-menu').classList.add('hidden');
        document.getElementById('level-complete-menu').classList.add('hidden');
        document.getElementById('victory-menu').classList.add('hidden');
    }
    
    gameOver() {
        this.state = GameState.GAME_OVER;
        this.hideAllMenus();
        document.getElementById('game-over-menu').classList.remove('hidden');
        
        // 更新结算信息
        document.getElementById('final-score').textContent = this.totalScore;
        document.getElementById('final-level').textContent = this.currentLevel;
        document.getElementById('enemies-killed').textContent = this.totalEnemiesKilled;
    }
    
    levelComplete() {
        if (this.currentLevel >= MAX_LEVEL) {
            this.victory();
            return;
        }
        
        this.state = GameState.LEVEL_COMPLETE;
        this.hideAllMenus();
        document.getElementById('level-complete-menu').classList.remove('hidden');
        
        // 计算关卡得分
        const levelScore = this.player.score;
        document.getElementById('level-score').textContent = levelScore;
        document.getElementById('total-score').textContent = this.totalScore;
    }
    
    victory() {
        this.state = GameState.VICTORY;
        this.hideAllMenus();
        document.getElementById('victory-menu').classList.remove('hidden');
        
        document.getElementById('victory-score').textContent = this.totalScore;
        document.getElementById('victory-level').textContent = this.currentLevel;
        document.getElementById('victory-kills').textContent = this.totalEnemiesKilled;
    }
    
    update() {
        if (this.state !== GameState.PLAYING) return;
        
        // 更新背景
        this.updateBackground();
        
        // 更新玩家
        this.updatePlayer();
        
        // 生成敌人
        this.spawnEnemies();
        
        // 更新子弹
        this.updateBullets();
        
        // 更新敌人
        this.updateEnemies();
        
        // 更新敌人子弹
        this.updateEnemyBullets();
        
        // 碰撞检测
        this.checkCollisions();
        
        // 更新特效
        this.updateEffects();
        
        // 屏幕震动
        this.updateScreenShake();
        
        // 检查关卡进度
        this.checkLevelProgress();
    }
    
    updateBackground() {
        // 更新星星
        this.stars.forEach(star => star.update());
        
        // 更新星云
        this.nebulas.forEach(nebula => nebula.update());
    }
    
    updatePlayer() {
        // 更新玩家目标位置
        if (this.isMouseOnCanvas) {
            this.player.updateTarget(this.mouseX, this.mouseY);
        }
        
        // 更新玩家
        this.player.update();
        
        // 自动射击
        if (this.player.canShoot()) {
            this.bullets.push(new Bullet(this.player.x, this.player.y - this.player.height / 2));
            this.player.shoot();
        }
    }
    
    spawnEnemies() {
        const config = LevelConfig[this.currentLevel];
        this.enemySpawnTimer++;
        
        if (this.enemySpawnTimer >= config.enemySpawnRate) {
            this.enemySpawnTimer = 0;
            
            // 确定要生成的敌人类型
            const roll = Math.random();
            let enemyType;
            
            if (roll < config.smallEnemyChance) {
                enemyType = EnemyType.SMALL;
            } else if (roll < config.smallEnemyChance + config.mediumEnemyChance) {
                enemyType = EnemyType.MEDIUM;
            } else if (roll < config.smallEnemyChance + config.mediumEnemyChance + config.largeEnemyChance) {
                enemyType = EnemyType.LARGE;
            } else {
                enemyType = EnemyType.ELITE;
            }
            
            // 创建敌人
            const enemyConfig = EnemyConfig[enemyType];
            const x = random(enemyConfig.width / 2, this.canvas.width - enemyConfig.width / 2);
            const y = -enemyConfig.height;
            
            const enemy = new Enemy(x, y, enemyType, this.canvas.width, this.canvas.height);
            
            // 应用关卡难度调整
            enemy.health *= config.enemyHealthMultiplier;
            enemy.maxHealth *= config.enemyHealthMultiplier;
            enemy.speed *= config.enemySpeedMultiplier;
            
            this.enemies.push(enemy);
        }
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            
            if (!this.bullets[i].active) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update();
            
            // 敌人射击
            if (enemy.canEnemyShoot()) {
                this.enemyBullets.push(new EnemyBullet(enemy.x, enemy.y + enemy.height / 2));
                enemy.shoot();
            }
            
            if (!enemy.active) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    updateEnemyBullets() {
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.enemyBullets[i].update();
            
            if (!this.enemyBullets[i].active) {
                this.enemyBullets.splice(i, 1);
            }
        }
    }
    
    /**
     * 统一处理敌机死亡逻辑
     * 确保得分、击杀数、爆炸效果、UI更新都同步进行
     */
    handleEnemyDeath(enemy) {
        // 创建爆炸效果
        const explosionSize = enemy.type === EnemyType.SMALL ? 0.8 : 
                             enemy.type === EnemyType.MEDIUM ? 1.2 : 
                             enemy.type === EnemyType.LARGE ? 1.8 : 1.5;
        this.explosions.push(new Explosion(enemy.x, enemy.y, explosionSize));
        
        // 增加分数和击杀数
        const config = EnemyConfig[enemy.type];
        this.player.score += config.score;
        this.totalScore += config.score;
        this.player.kills++;
        this.enemiesKilled++;
        this.totalEnemiesKilled++;
        
        // 屏幕震动
        this.screenShake = 5;
        
        // 更新UI
        this.updateUI();
    }

    checkCollisions() {
        // 玩家子弹与敌人碰撞
        const bulletsToRemove = [];
        const enemiesToRemove = [];
        
        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            
            for (let j = 0; j < this.enemies.length; j++) {
                const enemy = this.enemies[j];
                
                if (enemiesToRemove.indexOf(j) !== -1) continue; // 已经标记要移除了
                
                if (rectCollision(bullet.getCollisionRect(), enemy.getCollisionRect())) {
                    // 子弹击中敌人
                    bulletsToRemove.push(i);
                    
                    // 敌人受伤
                    const isDead = enemy.takeDamage(bullet.damage);
                    
                    // 添加受击效果
                    this.hitEffects.push(new HitEffect(bullet.x, bullet.y));
                    
                    if (isDead) {
                        enemiesToRemove.push(j);
                        this.handleEnemyDeath(enemy);
                    }
                    
                    break; // 一颗子弹只击中一个敌人
                }
            }
        }
        
        // 从后往前移除，避免索引问题
        bulletsToRemove.sort((a, b) => b - a).forEach(index => {
            this.bullets.splice(index, 1);
        });
        enemiesToRemove.sort((a, b) => b - a).forEach(index => {
            this.enemies.splice(index, 1);
        });
        
        // 玩家与敌人碰撞
        const playerRect = this.player.getCollisionRect();
        const enemiesToRemoveFromPlayer = [];
        
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            
            if (enemiesToRemoveFromPlayer.indexOf(i) !== -1) continue;
            
            if (rectCollision(playerRect, enemy.getCollisionRect())) {
                // 玩家受伤
                const isDead = this.player.takeDamage(30);
                
                // 添加受击效果
                this.hitEffects.push(new HitEffect(this.player.x, this.player.y));
                
                // 敌人也被消灭
                enemiesToRemoveFromPlayer.push(i);
                this.handleEnemyDeath(enemy);
                
                // 更强的屏幕震动
                this.screenShake = 10;
                
                if (isDead) {
                    // 玩家死亡
                    this.explosions.push(new Explosion(this.player.x, this.player.y, 2));
                    this.gameOver();
                    return;
                }
            }
        }
        
        // 移除与玩家相撞的敌机
        enemiesToRemoveFromPlayer.sort((a, b) => b - a).forEach(index => {
            this.enemies.splice(index, 1);
        });
        
        // 敌人子弹与玩家碰撞
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            
            if (rectCollision(playerRect, bullet.getCollisionRect())) {
                // 玩家受伤
                const isDead = this.player.takeDamage(bullet.damage);
                
                // 移除子弹
                this.enemyBullets.splice(i, 1);
                
                // 添加受击效果
                this.hitEffects.push(new HitEffect(this.player.x, this.player.y));
                
                // 屏幕震动
                this.screenShake = 8;
                
                // 更新UI
                this.updateUI();
                
                if (isDead) {
                    // 玩家死亡
                    this.explosions.push(new Explosion(this.player.x, this.player.y, 2));
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    updateEffects() {
        // 更新爆炸效果
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update();
            
            if (!this.explosions[i].active) {
                this.explosions.splice(i, 1);
            }
        }
        
        // 更新受击效果
        for (let i = this.hitEffects.length - 1; i >= 0; i--) {
            this.hitEffects[i].update();
            
            if (!this.hitEffects[i].active) {
                this.hitEffects.splice(i, 1);
            }
        }
    }
    
    updateScreenShake() {
        if (this.screenShake > 0) {
            this.screenShake--;
            this.screenShakeX = random(-this.screenShake, this.screenShake);
            this.screenShakeY = random(-this.screenShake, this.screenShake);
        } else {
            this.screenShakeX = 0;
            this.screenShakeY = 0;
        }
    }
    
    checkLevelProgress() {
        const config = LevelConfig[this.currentLevel];
        
        if (this.enemiesKilled >= config.requiredKills && !this.levelCompleteTriggered) {
            this.levelCompleteTriggered = true;
            this.levelComplete();
        }
    }
    
    updateUI() {
        // 更新生命值条
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('health-fill').style.width = `${healthPercent}%`;
        
        // 更新分数
        document.getElementById('score-display').textContent = this.totalScore;
        
        // 更新关卡
        document.getElementById('level-display').textContent = this.currentLevel;
        
        // 更新关卡进度条
        const config = LevelConfig[this.currentLevel];
        const progressPercent = Math.min(100, (this.enemiesKilled / config.requiredKills) * 100);
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;
    }
    
    render() {
        // 保存当前上下文状态
        this.ctx.save();
        
        // 应用屏幕震动
        if (this.screenShake > 0) {
            this.ctx.translate(this.screenShakeX, this.screenShakeY);
        }
        
        // 清空画布
        this.ctx.fillStyle = '#000428';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制星云背景
        this.nebulas.forEach(nebula => nebula.draw(this.ctx));
        
        // 绘制星星背景
        this.stars.forEach(star => star.draw(this.ctx));
        
        // 只在游戏进行中绘制游戏对象
        if (this.state === GameState.PLAYING) {
            // 绘制玩家子弹
            this.bullets.forEach(bullet => bullet.draw(this.ctx));
            
            // 绘制敌人子弹
            this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
            
            // 绘制敌人
            this.enemies.forEach(enemy => enemy.draw(this.ctx));
            
            // 绘制玩家
            this.player.draw(this.ctx);
            
            // 绘制爆炸效果
            this.explosions.forEach(explosion => explosion.draw(this.ctx));
            
            // 绘制受击效果
            this.hitEffects.forEach(effect => effect.draw(this.ctx));
        }
        
        // 恢复上下文状态
        this.ctx.restore();
    }
    
    gameLoop() {
        // 更新游戏
        this.update();
        
        // 渲染游戏
        this.render();
        
        // 请求下一帧
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('load', () => {
    new Game();
});
