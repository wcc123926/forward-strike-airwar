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

// Boss关定义 - 每3关一个Boss
const BOSS_LEVELS = [3, 6, 9];

// 关卡配置
const LevelConfig = {
    1: { 
        enemySpawnRate: 60, 
        smallEnemyChance: 0.7, 
        mediumEnemyChance: 0.3, 
        largeEnemyChance: 0, 
        eliteEnemyChance: 0, 
        requiredKills: 12, 
        enemyHealthMultiplier: 1, 
        enemySpeedMultiplier: 1,
        isBossLevel: false
    },
    2: { 
        enemySpawnRate: 55, 
        smallEnemyChance: 0.6, 
        mediumEnemyChance: 0.35, 
        largeEnemyChance: 0.05, 
        eliteEnemyChance: 0, 
        requiredKills: 18, 
        enemyHealthMultiplier: 1.1, 
        enemySpeedMultiplier: 1,
        isBossLevel: false
    },
    3: { 
        enemySpawnRate: 50, 
        smallEnemyChance: 0.5, 
        mediumEnemyChance: 0.35, 
        largeEnemyChance: 0.1, 
        eliteEnemyChance: 0.05, 
        requiredKills: 15,  // Boss关：热身击杀数
        enemyHealthMultiplier: 1.2, 
        enemySpeedMultiplier: 1.1,
        isBossLevel: true,
        bossType: BossType.DESTROYER,
        bossIntro: '警告！毁灭者来袭！'
    },
    4: { 
        enemySpawnRate: 45, 
        smallEnemyChance: 0.45, 
        mediumEnemyChance: 0.35, 
        largeEnemyChance: 0.12, 
        eliteEnemyChance: 0.08, 
        requiredKills: 25, 
        enemyHealthMultiplier: 1.3, 
        enemySpeedMultiplier: 1.1,
        isBossLevel: false
    },
    5: { 
        enemySpawnRate: 40, 
        smallEnemyChance: 0.4, 
        mediumEnemyChance: 0.35, 
        largeEnemyChance: 0.15, 
        eliteEnemyChance: 0.1, 
        requiredKills: 30, 
        enemyHealthMultiplier: 1.5, 
        enemySpeedMultiplier: 1.2,
        isBossLevel: false
    },
    6: { 
        enemySpawnRate: 38, 
        smallEnemyChance: 0.35, 
        mediumEnemyChance: 0.35, 
        largeEnemyChance: 0.18, 
        eliteEnemyChance: 0.12, 
        requiredKills: 20,  // Boss关：热身击杀数
        enemyHealthMultiplier: 1.6, 
        enemySpeedMultiplier: 1.2,
        isBossLevel: true,
        bossType: BossType.CRUISER,
        bossIntro: '警报！巡洋舰出现！'
    },
    7: { 
        enemySpawnRate: 35, 
        smallEnemyChance: 0.3, 
        mediumEnemyChance: 0.35, 
        largeEnemyChance: 0.2, 
        eliteEnemyChance: 0.15, 
        requiredKills: 35, 
        enemyHealthMultiplier: 1.8, 
        enemySpeedMultiplier: 1.3,
        isBossLevel: false
    },
    8: { 
        enemySpawnRate: 32, 
        smallEnemyChance: 0.25, 
        mediumEnemyChance: 0.35, 
        largeEnemyChance: 0.23, 
        eliteEnemyChance: 0.17, 
        requiredKills: 40, 
        enemyHealthMultiplier: 2, 
        enemySpeedMultiplier: 1.3,
        isBossLevel: false
    },
    9: { 
        enemySpawnRate: 30, 
        smallEnemyChance: 0.2, 
        mediumEnemyChance: 0.35, 
        largeEnemyChance: 0.25, 
        eliteEnemyChance: 0.2, 
        requiredKills: 25,  // Boss关：热身击杀数
        enemyHealthMultiplier: 2.2, 
        enemySpeedMultiplier: 1.4,
        isBossLevel: true,
        bossType: BossType.DREADNOUGHT,
        bossIntro: '最终警告！无畏舰降临！'
    },
    10: { 
        enemySpawnRate: 28, 
        smallEnemyChance: 0.15, 
        mediumEnemyChance: 0.35, 
        largeEnemyChance: 0.28, 
        eliteEnemyChance: 0.22, 
        requiredKills: 50, 
        enemyHealthMultiplier: 2.5, 
        enemySpeedMultiplier: 1.5,
        isBossLevel: false
    }
};

const MAX_LEVEL = 10;

/**
 * 游戏主类
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏画布尺寸
        this.canvas.width = 480;
        this.canvas.height = 720;
        
        // 安全区域定义 - 确保UI和游戏内容不重叠
        this.safeArea = {
            top: 60,      // 顶部HUD区域（血条、进度、分数）
            bottom: 60    // 底部HUD区域（火力等级、炸弹）
        };
        
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
        
        // 新增游戏对象
        this.powerUps = [];
        this.notifications = [];
        
        // Boss系统
        this.boss = null;
        this.bossActive = false;
        this.bossBullets = [];
        this.bossHealthBar = new BossHealthBar();
        this.bossDeathExplosions = 0;
        
        // Boss战标志
        this.isBossLevel = false; // 当前关是否是Boss关
        this.bossSpawned = false; // Boss是否已经生成
        this.bossDefeated = false; // Boss是否已被击败
        
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
        
        // 初始化玩家（传递安全区域参数）
        this.player = new Player(
            this.canvas.width, 
            this.canvas.height, 
            this.safeArea.top, 
            this.safeArea.bottom
        );
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
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.state === GameState.PLAYING) {
                // 按B使用炸弹
                if (e.key === 'b' || e.key === 'B') {
                    this.useBomb();
                }
            }
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
        
        // 重置Boss系统
        this.bossActive = false;
        this.boss = null;
        this.bossBullets = [];
        this.bossHealthBar.deactivate();
        this.bossDeathExplosions = 0;
        this.isBossLevel = false;
        this.bossSpawned = false;
        this.bossDefeated = false;
        
        // 重置玩家
        this.player.reset();
        
        // 清空游戏对象
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.explosions = [];
        this.hitEffects = [];
        this.powerUps = [];
        this.notifications = [];
        
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
        
        // 重置Boss系统
        this.boss = null;
        this.bossActive = false;
        this.bossBullets = [];
        this.bossHealthBar.deactivate();
        this.bossDeathExplosions = 0;
        
        // 检查是否是Boss关
        const config = LevelConfig[this.currentLevel];
        this.isBossLevel = config.isBossLevel || false;
        this.bossSpawned = false;
        this.bossDefeated = false;
        
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
    
    // 使用炸弹
    useBomb() {
        if (this.player.useBomb()) {
            // 清除所有敌机和敌机子弹
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                // 统计伤害
                this.player.stats.damageDealt += enemy.maxHealth;
                // 创建爆炸效果
                this.explosions.push(new Explosion(enemy.x, enemy.y, 1.2));
                // 增加得分
                const config = EnemyConfig[enemy.type];
                this.player.score += config.score;
                this.totalScore += config.score;
                this.enemiesKilled++;
                this.totalEnemiesKilled++;
            }
            
            // 清除敌人
            this.enemies = [];
            
            // 清除敌机子弹
            this.enemyBullets = [];
            
            // 添加文字提示
            this.addNotification('💥 炸弹清除！', '#ff44ff');
            
            // 屏幕震动
            this.screenShake = 15;
            
            // 更新UI
            this.updateUI();
        }
    }
    
    gameOver() {
        this.state = GameState.GAME_OVER;
        this.hideAllMenus();
        document.getElementById('game-over-menu').classList.remove('hidden');
        
        // 更新结算信息
        document.getElementById('final-score').textContent = this.totalScore;
        document.getElementById('final-level').textContent = this.currentLevel;
        document.getElementById('enemies-killed').textContent = this.totalEnemiesKilled;
        
        // 添加详细统计
        const stats = this.player.stats;
        const statsText = 
            `总得分: ${this.totalScore}\n` +
            `到达关卡: 第${this.currentLevel}关\n` +
            `击杀敌机: ${this.totalEnemiesKilled}架\n` +
            `最高火力: ${stats.maxFireLevelReached}级\n` +
            `收集道具: ${stats.powerUpsCollected}个\n` +
            `使用炸弹: ${stats.bombsUsed}次`;
        
        console.log('游戏结束统计:', statsText);
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
        
        // 添加关卡完成提示
        this.addNotification(`🎉 第${this.currentLevel}关完成！`, '#44ff44');
    }
    
    victory() {
        this.state = GameState.VICTORY;
        this.hideAllMenus();
        document.getElementById('victory-menu').classList.remove('hidden');
        
        document.getElementById('victory-score').textContent = this.totalScore;
        document.getElementById('victory-level').textContent = this.currentLevel;
        document.getElementById('victory-kills').textContent = this.totalEnemiesKilled;
        
        // 游戏胜利详细统计
        const stats = this.player.stats;
        console.log('=== 游戏胜利详细统计 ===');
        console.log(`最终得分: ${this.totalScore}`);
        console.log(`通关关卡: ${MAX_LEVEL}关`);
        console.log(`总击杀数: ${this.totalEnemiesKilled}`);
        console.log(`最高火力等级: ${stats.maxFireLevelReached}`);
        console.log(`收集道具数: ${stats.powerUpsCollected}`);
        console.log(`使用炸弹数: ${stats.bombsUsed}`);
        console.log(`总伤害输出: ${Math.floor(stats.damageDealt)}`);
        console.log(`总受到伤害: ${Math.floor(stats.damageTaken)}`);
        console.log('========================');
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
        
        // 更新敌人子弹（非Boss战时）
        if (!this.bossActive) {
            this.updateEnemyBullets();
        }
        
        // 更新Boss和Boss子弹（Boss战时）
        if (this.bossActive) {
            this.updateBoss();
            this.updateBossBullets();
        }
        
        // 碰撞检测
        this.checkCollisions();
        
        // 更新特效
        this.updateEffects();
        
        // 更新道具
        this.updatePowerUps();
        
        // 更新文字提示
        this.updateNotifications();
        
        // 屏幕震动
        this.updateScreenShake();
        
        // 检查关卡进度（非Boss关）
        if (!this.isBossLevel) {
            this.checkLevelProgress();
        }
    }
    
    // 更新道具
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].update();
            
            if (!this.powerUps[i].active) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    // 更新文字提示
    updateNotifications() {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].update();
            
            if (!this.notifications[i].active) {
                this.notifications.splice(i, 1);
            }
        }
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
        
        // 自动射击 - 根据火力等级发射多发子弹
        if (this.player.canShoot()) {
            this.fireBullets();
            this.player.shoot();
        }
    }
    
    // 根据火力等级发射多发子弹
    fireBullets() {
        const fireLevel = this.player.fireLevel;
        const config = FireLevelConfig[fireLevel];
        const bulletCount = config.bulletCount;
        const spread = config.bulletSpread;
        const bulletWidth = config.bulletWidth;
        const bulletHeight = config.bulletHeight;
        
        const startY = this.player.y - this.player.height / 2;
        
        if (bulletCount === 1) {
            // 单发射击
            this.bullets.push(new Bullet(this.player.x, startY, 0, bulletWidth, bulletHeight));
        } else if (bulletCount === 2) {
            // 双发射击
            const offset = spread / 2;
            this.bullets.push(new Bullet(this.player.x - offset, startY, 0, bulletWidth, bulletHeight));
            this.bullets.push(new Bullet(this.player.x + offset, startY, 0, bulletWidth, bulletHeight));
        } else if (bulletCount === 3) {
            // 三发射击
            const offset = spread;
            this.bullets.push(new Bullet(this.player.x - offset, startY, -0.1, bulletWidth, bulletHeight));
            this.bullets.push(new Bullet(this.player.x, startY, 0, bulletWidth, bulletHeight));
            this.bullets.push(new Bullet(this.player.x + offset, startY, 0.1, bulletWidth, bulletHeight));
        } else if (bulletCount === 4) {
            // 四发散射
            const angles = [-0.3, -0.1, 0.1, 0.3];
            const offsets = [-spread * 0.8, -spread * 0.3, spread * 0.3, spread * 0.8];
            for (let i = 0; i < 4; i++) {
                this.bullets.push(new Bullet(this.player.x + offsets[i], startY, angles[i], bulletWidth, bulletHeight));
            }
        } else if (bulletCount === 5) {
            // 五发扇形
            const angles = [-0.4, -0.2, 0, 0.2, 0.4];
            const offsets = [-spread, -spread * 0.5, 0, spread * 0.5, spread];
            for (let i = 0; i < 5; i++) {
                this.bullets.push(new Bullet(this.player.x + offsets[i], startY, angles[i], bulletWidth, bulletHeight));
            }
        }
    }
    
    spawnEnemies() {
        const config = LevelConfig[this.currentLevel];
        
        // Boss关且Boss已生成：暂停普通敌人生成
        if (this.isBossLevel && this.bossSpawned) {
            return;
        }
        
        // Boss关且达到热身击杀数：生成Boss
        if (this.isBossLevel && !this.bossSpawned && this.enemiesKilled >= config.requiredKills) {
            this.spawnBoss();
            return;
        }
        
        const levelProgress = this.getLevelProgress();
        const isLateGame = levelProgress >= 0.7;
        
        // 关卡后半段：加快生成速度
        let spawnRate = config.enemySpawnRate;
        if (isLateGame) {
            spawnRate = Math.floor(spawnRate * 0.7); // 加快30%
        }
        
        this.enemySpawnTimer++;
        
        if (this.enemySpawnTimer >= spawnRate) {
            this.enemySpawnTimer = 0;
            
            // 确定要生成的敌人类型
            const roll = Math.random();
            let enemyType;
            
            // 关卡后半段：增加精英和大型敌人的概率
            let smallChance = config.smallEnemyChance;
            let mediumChance = config.mediumEnemyChance;
            let largeChance = config.largeEnemyChance;
            let eliteChance = config.eliteEnemyChance;
            
            if (isLateGame) {
                smallChance *= 0.6; // 减少小型敌人
                eliteChance *= 1.8; // 大幅增加精英敌人
                largeChance *= 1.5; // 增加大型敌人
                mediumChance = 1 - smallChance - largeChance - eliteChance;
            }
            
            if (roll < smallChance) {
                enemyType = EnemyType.SMALL;
            } else if (roll < smallChance + mediumChance) {
                enemyType = EnemyType.MEDIUM;
            } else if (roll < smallChance + mediumChance + largeChance) {
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
            
            // 关卡后半段：敌人更强更快
            if (isLateGame) {
                enemy.health *= 1.3;
                enemy.maxHealth *= 1.3;
                enemy.speed *= 1.2;
            }
            
            this.enemies.push(enemy);
        }
    }
    
    // 生成Boss
    spawnBoss() {
        const config = LevelConfig[this.currentLevel];
        if (!config.bossType) return;
        
        this.bossSpawned = true;
        this.bossActive = true;
        
        // 创建Boss
        this.boss = new Boss(this.canvas.width, this.canvas.height, config.bossType);
        
        // 激活Boss血条
        this.bossHealthBar.activate(this.boss);
        
        // 显示Boss警告
        if (config.bossIntro) {
            this.addNotification(config.bossIntro, '#ff4444');
        }
        
        // 清空屏幕上的普通敌人和子弹
        this.enemies = [];
        this.enemyBullets = [];
    }
    
    // 更新Boss
    updateBoss() {
        if (!this.boss || !this.boss.active) return;
        
        // 更新Boss
        this.boss.update(this.player.x, this.player.y);
        
        // 获取Boss发射的子弹
        const bullets = this.boss.getPendingBullets();
        if (bullets.length > 0) {
            this.bossBullets.push(...bullets);
        }
        
        // 更新Boss血条
        this.bossHealthBar.update();
        
        // Boss死亡处理
        if (this.boss.isDying) {
            // 生成爆炸效果
            if (this.bossDeathExplosions < 8) {
                if (Math.random() > 0.6) {
                    const ex = this.boss.x + random(-this.boss.width / 2, this.boss.width / 2);
                    const ey = this.boss.y + random(-this.boss.height / 2, this.boss.height / 2);
                    const size = random(1.0, 2.0);
                    this.explosions.push(new Explosion(ex, ey, size));
                    this.bossDeathExplosions++;
                    this.screenShake = 8;
                }
            }
            
            // Boss完全死亡
            if (!this.boss.active) {
                this.bossDefeated = true;
                this.bossActive = false;
                this.bossHealthBar.deactivate();
                
                // 显示Boss击败通知
                this.addNotification(`${this.boss.name} 已击败！`, '#44ff44');
                
                // 掉落大量道具奖励
                this.dropBossRewards();
                
                // 增加大量分数
                const bossConfig = BossConfig[this.boss.type];
                this.player.score += bossConfig.score;
                this.totalScore += bossConfig.score;
                
                // 处理关卡完成
                this.enemiesKilled++;
                this.totalEnemiesKilled++;
                this.levelCompleteTriggered = true;
                this.levelComplete();
            }
        }
    }
    
    // 更新Boss子弹
    updateBossBullets() {
        for (let i = this.bossBullets.length - 1; i >= 0; i--) {
            this.bossBullets[i].update(this.player.x, this.player.y);
            
            if (!this.bossBullets[i].active) {
                this.bossBullets.splice(i, 1);
            }
        }
    }
    
    // Boss击败后掉落奖励
    dropBossRewards() {
        const rewardCount = 4; // 固定掉落4个道具
        
        // 掉落位置分布
        for (let i = 0; i < rewardCount; i++) {
            // 确定掉落类型（确保有火力升级）
            let powerUpType;
            if (i === 0) {
                // 第一个必定是火力升级
                powerUpType = PowerUpType.FIRE_UP;
            } else {
                // 随机掉落其他类型
                const roll = Math.random();
                if (roll < 0.4) {
                    powerUpType = PowerUpType.FIRE_UP;
                } else if (roll < 0.6) {
                    powerUpType = PowerUpType.SHIELD;
                } else if (roll < 0.85) {
                    powerUpType = PowerUpType.HEALTH;
                } else {
                    powerUpType = PowerUpType.BOMB;
                }
            }
            
            // 延迟一点时间后掉落
            setTimeout(() => {
                if (this.state === GameState.PLAYING) {
                    const x = random(80, this.canvas.width - 80);
                    const y = 150 + i * 30;
                    this.powerUps.push(new PowerUp(x, y, powerUpType));
                }
            }, i * 200);
        }
    }
    
    // 获取关卡进度 (0-1)
    getLevelProgress() {
        const config = LevelConfig[this.currentLevel];
        return this.enemiesKilled / config.requiredKills;
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
        
        // 统计伤害输出
        this.player.stats.damageDealt += enemy.maxHealth;
        
        // 屏幕震动
        this.screenShake = 5;
        
        // 道具掉落
        this.tryDropPowerUp(enemy);
        
        // 更新UI
        this.updateUI();
    }
    
    // 尝试掉落道具
    tryDropPowerUp(enemy) {
        // 根据敌人类型确定掉落概率 - 大幅降低普通敌人的掉落
        let dropChance;
        switch (enemy.type) {
            case EnemyType.SMALL:
                dropChance = 0.02; // 2% - 几乎不掉落
                break;
            case EnemyType.MEDIUM:
                dropChance = 0.05; // 5% - 很少掉落
                break;
            case EnemyType.LARGE:
                dropChance = 0.12; // 12% - 偶尔掉落
                break;
            case EnemyType.ELITE:
                dropChance = 0.25; // 25% - 较常掉落
                break;
            default:
                dropChance = 0.03;
        }
        
        // 道具主要通过Boss战获得，普通关卡掉落大幅减少
        // 不再在后半段增加掉落概率
        
        if (Math.random() < dropChance) {
            this.dropPowerUp(enemy.x, enemy.y);
        }
    }
    
    // 掉落道具
    dropPowerUp(x, y) {
        // 确定道具类型
        const roll = Math.random();
        let powerUpType;
        
        // 权重分配
        if (roll < 0.4) {
            // 40% 火力升级
            powerUpType = PowerUpType.FIRE_UP;
        } else if (roll < 0.65) {
            // 25% 护盾
            powerUpType = PowerUpType.SHIELD;
        } else if (roll < 0.9) {
            // 25% 生命恢复
            powerUpType = PowerUpType.HEALTH;
        } else {
            // 10% 炸弹
            powerUpType = PowerUpType.BOMB;
        }
        
        this.powerUps.push(new PowerUp(x, y, powerUpType));
    }

    checkCollisions() {
        // 玩家子弹与敌人碰撞
        const bulletsToRemove = [];
        const enemiesToRemove = [];
        
        // Boss战时：玩家子弹与Boss碰撞
        if (this.bossActive && this.boss && !this.boss.isDying && !this.boss.isEntering) {
            const bossRect = this.boss.getCollisionRect();
            
            for (let i = 0; i < this.bullets.length; i++) {
                const bullet = this.bullets[i];
                
                if (rectCollision(bullet.getCollisionRect(), bossRect)) {
                    // 子弹击中Boss
                    bulletsToRemove.push(i);
                    
                    // Boss受伤
                    const isDead = this.boss.takeDamage(bullet.damage);
                    
                    // 添加受击效果
                    this.hitEffects.push(new HitEffect(bullet.x, bullet.y));
                    
                    // 统计伤害
                    this.player.stats.damageDealt += bullet.damage;
                    
                    // 记录子弹位置，用于多个子弹检测
                    continue;
                }
            }
        } else {
            // 非Boss战时：玩家子弹与普通敌人碰撞
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
        
        // 敌人子弹与玩家碰撞（非Boss战时）
        if (!this.bossActive) {
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
        
        // Boss子弹与玩家碰撞（Boss战时）
        if (this.bossActive) {
            for (let i = this.bossBullets.length - 1; i >= 0; i--) {
                const bullet = this.bossBullets[i];
                
                if (rectCollision(playerRect, bullet.getCollisionRect())) {
                    // 玩家受伤（Boss子弹伤害更高）
                    const isDead = this.player.takeDamage(bullet.damage);
                    
                    // 移除子弹
                    this.bossBullets.splice(i, 1);
                    
                    // 添加受击效果
                    this.hitEffects.push(new HitEffect(this.player.x, this.player.y));
                    
                    // 屏幕震动
                    this.screenShake = 10;
                    
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
        
        // 玩家与Boss碰撞（Boss战时）
        if (this.bossActive && this.boss && !this.boss.isDying && !this.boss.isEntering) {
            const bossRect = this.boss.getCollisionRect();
            if (rectCollision(playerRect, bossRect)) {
                // 玩家与Boss相撞（大量伤害）
                const isDead = this.player.takeDamage(50);
                
                // 添加受击效果
                this.hitEffects.push(new HitEffect(this.player.x, this.player.y));
                
                // 强屏幕震动
                this.screenShake = 15;
                
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
        
        // 玩家与道具碰撞
        this.checkPowerUpCollisions(playerRect);
    }
    
    // 检查道具拾取
    checkPowerUpCollisions(playerRect) {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            if (rectCollision(playerRect, powerUp.getCollisionRect())) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    // 收集道具
    collectPowerUp(powerUp) {
        const config = PowerUpConfig[powerUp.type];
        let notificationText = config.name;
        let notificationColor = config.color;
        
        switch (powerUp.type) {
            case PowerUpType.FIRE_UP:
                if (this.player.fireLevel < this.player.maxFireLevel) {
                    const oldLevel = this.player.fireLevel;
                    this.player.upgradeFire();
                    const newConfig = FireLevelConfig[this.player.fireLevel];
                    notificationText = `${config.name} - ${newConfig.description}`;
                } else {
                    // 火力已满时，提供额外分数
                    this.player.score += 500;
                    this.totalScore += 500;
                    notificationText = '火力已满 +500分';
                }
                break;
                
            case PowerUpType.SHIELD:
                this.player.activateShield();
                notificationText = '获得护盾 - 吸收伤害';
                break;
                
            case PowerUpType.HEALTH:
                const healed = this.player.heal(30);
                if (healed > 0) {
                    notificationText = `生命恢复 +${healed}`;
                } else {
                    notificationText = '生命已满';
                }
                break;
                
            case PowerUpType.BOMB:
                if (this.player.addBomb()) {
                    notificationText = '获得炸弹 - 按B使用';
                } else {
                    // 炸弹已满时，提供额外分数
                    this.player.score += 300;
                    this.totalScore += 300;
                    notificationText = '炸弹已满 +300分';
                }
                break;
        }
        
        // 添加文字提示
        this.addNotification(notificationText, notificationColor);
        
        // 更新UI
        this.updateUI();
    }
    
    // 添加文字提示
    addNotification(text, color = '#ffffff') {
        // 在屏幕上方显示提示，避免遮挡主游玩区域
        const y = 80;
        this.notifications.push(new TextNotification(this.canvas.width / 2, y, text, color));
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
            // 绘制道具
            this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
            
            // 绘制玩家子弹
            this.bullets.forEach(bullet => bullet.draw(this.ctx));
            
            // 绘制敌人子弹（非Boss战时）
            if (!this.bossActive) {
                this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
            }
            
            // 绘制Boss子弹（Boss战时）
            if (this.bossActive) {
                this.bossBullets.forEach(bullet => bullet.draw(this.ctx));
            }
            
            // 绘制敌人（非Boss战时）
            if (!this.bossActive) {
                this.enemies.forEach(enemy => enemy.draw(this.ctx));
            }
            
            // 绘制Boss
            if (this.boss && this.boss.active) {
                this.boss.draw(this.ctx);
            }
            
            // 绘制玩家
            this.player.draw(this.ctx);
            
            // 绘制护盾
            this.player.shield.draw(this.ctx, this.player.x, this.player.y, this.player.width, this.player.height);
            
            // 绘制爆炸效果
            this.explosions.forEach(explosion => explosion.draw(this.ctx));
            
            // 绘制受击效果
            this.hitEffects.forEach(effect => effect.draw(this.ctx));
            
            // 绘制文字提示
            this.notifications.forEach(notification => notification.draw(this.ctx));
            
            // 绘制Boss血条
            if (this.bossHealthBar.active) {
                this.bossHealthBar.draw(this.ctx, this.canvas.width);
            }
            
            // 绘制HUD：火力等级、炸弹数量、关卡进度提示
            this.drawHUD();
        }
        
        // 恢复上下文状态
        this.ctx.restore();
    }
    
    // 绘制HUD信息
    drawHUD() {
        // 绘制火力等级显示（位于屏幕左下角，不遮挡主游玩区域）
        this.drawFireLevelDisplay();
        
        // 绘制炸弹数量显示（位于屏幕右下角）
        this.drawBombDisplay();
        
        // 绘制关卡阶段提示（后半段时显示警告）
        this.drawStageIndicator();
    }
    
    // 绘制火力等级显示
    drawFireLevelDisplay() {
        const fireLevel = this.player.fireLevel;
        const config = FireLevelConfig[fireLevel];
        
        // 背景框
        const x = 10;
        const y = this.canvas.height - 50;
        const width = 140;
        const height = 40;
        
        this.ctx.save();
        
        // 半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x, y, width, height);
        
        // 边框
        this.ctx.strokeStyle = '#64b5f6';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        
        // 火力等级文字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('火力:', x + 8, y + 6);
        
        // 火力等级指示器（彩色方块）
        const blockWidth = 20;
        const blockHeight = 12;
        const startX = x + 8;
        const blockY = y + 22;
        
        for (let i = 1; i <= MAX_FIRE_LEVEL; i++) {
            const bx = startX + (i - 1) * (blockWidth + 4);
            
            if (i <= fireLevel) {
                // 已激活的等级
                const gradient = this.ctx.createLinearGradient(bx, blockY, bx, blockY + blockHeight);
                if (i === 1) {
                    gradient.addColorStop(0, '#64b5f6');
                    gradient.addColorStop(1, '#1976d2');
                } else if (i === 2) {
                    gradient.addColorStop(0, '#81c784');
                    gradient.addColorStop(1, '#388e3c');
                } else if (i === 3) {
                    gradient.addColorStop(0, '#ffb74d');
                    gradient.addColorStop(1, '#f57c00');
                } else if (i === 4) {
                    gradient.addColorStop(0, '#ff8a65');
                    gradient.addColorStop(1, '#e64a19');
                } else {
                    gradient.addColorStop(0, '#f06292');
                    gradient.addColorStop(1, '#c2185b');
                }
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(bx, blockY, blockWidth, blockHeight);
                
                // 边框
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(bx, blockY, blockWidth, blockHeight);
            } else {
                // 未激活的等级
                this.ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                this.ctx.fillRect(bx, blockY, blockWidth, blockHeight);
            }
        }
        
        this.ctx.restore();
    }
    
    // 绘制炸弹数量显示
    drawBombDisplay() {
        const bombs = this.player.bombs;
        const maxBombs = this.player.maxBombs;
        
        if (maxBombs === 0) return;
        
        const x = this.canvas.width - 80;
        const y = this.canvas.height - 50;
        const width = 70;
        const height = 40;
        
        this.ctx.save();
        
        // 半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x, y, width, height);
        
        // 边框
        this.ctx.strokeStyle = '#ff44ff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        
        // 标题
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('炸弹', x + width / 2, y + 4);
        
        // 炸弹数量
        this.ctx.fillStyle = bombs > 0 ? '#ff44ff' : '#666666';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText(`${bombs}/${maxBombs}`, x + width / 2, y + 18);
        
        // 提示文字
        if (bombs > 0) {
            this.ctx.fillStyle = '#aaaaaa';
            this.ctx.font = '10px Arial';
            this.ctx.fillText('按B使用', x + width / 2, y + 32);
        }
        
        this.ctx.restore();
    }
    
    // 绘制关卡阶段指示器（后半段显示警告）
    drawStageIndicator() {
        const levelProgress = this.getLevelProgress();
        
        if (levelProgress >= 0.7 && levelProgress < 1.0) {
            const x = this.canvas.width / 2;
            const y = 50;
            
            this.ctx.save();
            
            // 闪烁的警告文字
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            
            this.ctx.globalAlpha = pulse;
            this.ctx.fillStyle = '#ff6666';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('⚠ 进入高威胁区域 ⚠', x, y);
            
            // 副标题
            this.ctx.globalAlpha = pulse * 0.8;
            this.ctx.fillStyle = '#ffaa66';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('敌人强度提升，注意躲避！', x, y + 18);
            
            this.ctx.restore();
        }
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
