var spriteCreator = require('spriteCreator');
var gameDir = null;
cc.Class({
    extends: cc.Component,

    properties: {

        landRange: cc.v2(20, 300),
        landWidth: cc.v2(20, 200),
        heroWorldPosX: 0,
        heroMoveSpeed: 400,
        currentLandRange: 0,
        stickWidth: 6,
        stickSpeed: 400,
        moveDuration: 0.5,
        runLength: 0,
        stickLengthen: false,
        nowScore: 0,

        stick: cc.Node,
        canvas: cc.Node,
        hero: cc.Node,
        firstLand: cc.Node,
        secondLand: cc.Node,
        overLoad: cc.Node,
        overLable: cc.Node,
        MaxScore: cc.Node,
        score: cc.Node,
    },

    onLoad() {
        // 回调函数中，this指向会改变，定义全局变量gameDir保存this
        gameDir = this;

        // 绑定重新开始游戏逻辑
        gameDir.overLoad.active = false;
        gameDir.overLable.on(cc.Node.EventType.TOUCH_END, gameDir.gameStrat.bind(gameDir), gameDir.node);

        // 显示最高历史得分
        var maxScore = window.localStorage.getItem('score');
        var maxLable = gameDir.MaxScore.getComponent(cc.Label);
        if(maxScore){
            maxLable.string = '最高分：' + maxScore;
        }else {
            maxLable.string = '最高分：0';
        }

        // 生成一块新的地板,
        gameDir.newGround();

        var range = gameDir.getLandRange();
        gameDir.heroWorldPosX = gameDir.firstLand.width - (1 - gameDir.hero.anchorX) * gameDir.hero.width - gameDir.stickWidth;
        gameDir.secondLand.setPosition(range + gameDir.firstLand.width, 0);

        gameDir.initEvent();
    },

    // 初始化事件
    initEvent() {
        gameDir.canvas.on(cc.Node.EventType.TOUCH_START, gameDir.touchStart.bind(gameDir), gameDir.node);
        gameDir.canvas.on(cc.Node.EventType.TOUCH_END, gameDir.touchEnd.bind(gameDir), gameDir.node);
        gameDir.canvas.on(cc.Node.EventType.TOUCH_CANCEL, gameDir.touchCancel.bind(gameDir), gameDir.node);
    },

    // 移除事件
    offEvent() {
        gameDir.canvas.targetOff(gameDir.node);
    },

    update(dt) {
        if (gameDir.stickLengthen) {
            gameDir.stick.height += dt * gameDir.stickSpeed;
        }
    },
    gameStrat() {
        cc.director.loadScene('game');
    },

    touchStart() {
        gameDir.stickLengthen = true;
        gameDir.stick = gameDir.createStick();
        gameDir.stick.x = gameDir.hero.x + gameDir.hero.width * (1 - gameDir.hero.anchorX) + gameDir.stick.width * gameDir.stick.anchorX;

        var ani = gameDir.hero.getComponent(cc.Animation);
        ani.play('heroPush');
    },
    touchEnd() {
        gameDir.stickLengthen = false;
        var ani = gameDir.hero.getComponent(cc.Animation);
        ani.play('heroTick');
        // 棍子翻到
        gameDir.stickFall();
    },
    touchCancel() {
        gameDir.touchEnd();
    },

    // 棍子翻到
    stickFall() {
        var stickFall = cc.rotateBy(0.5, 90).easing(cc.easeIn(3));
        var callFunc = cc.callFunc(function () {
            // 棍子落地后回调
            var stickLength = gameDir.stick.height - gameDir.stick.width * gameDir.stick.anchorX;
            var falg;
            if (stickLength < gameDir.currentLandRange || stickLength > gameDir.currentLandRange + gameDir.secondLand.width) {
                // 失败
                falg = false;
            } else {
                // 成功
                falg = true;
                // 增加积分
                gameDir.addScore();
            }
            gameDir.heroMoveTo(falg);
        });
        var se = cc.sequence(stickFall, callFunc);
        gameDir.stick.runAction(se);
    },

    //进入下一块
    heroMoveTo(falg) {
        gameDir.offEvent();
        window.localStorage.setItem('score', gameDir.nowScore);
        var length = falg ? gameDir.currentLandRange + gameDir.secondLand.width : gameDir.stick.height;
        var ani = gameDir.hero.getComponent(cc.Animation);
        var callFunc = cc.callFunc(function () {
            ani.stop('heroRun');
            if (falg) {
                gameDir.landMove();
            } else {
                gameDir.heroDown();
            }
        });

        ani.play('heroRun');
        gameDir.heroMove({
            length,
            callFunc,
        });
    },

    // 视图移动
    landMove() {
        var callFunc = cc.callFunc(function () {
            gameDir.initEvent();
        });
        var winSize = cc.director.getWinSize();
        // firstLand;
        var length = gameDir.currentLandRange + gameDir.secondLand.width;
        gameDir.runLength += length;
        var action = cc.moveBy(gameDir.moveDuration, cc.v2(-length, 0));
        gameDir.node.runAction(action);
        gameDir.firstLand = gameDir.secondLand;

        // secoundLand
        gameDir.newGround();
        var range = gameDir.getLandRange();
        gameDir.secondLand.setPosition(gameDir.runLength + winSize.width, 0);
        var l = winSize.width - range - gameDir.heroWorldPosX - gameDir.hero.width * gameDir.hero.anchorX - gameDir.stickWidth;
        var secondAction = cc.moveBy(gameDir.moveDuration, cc.v2(-l, 0));
        var seq = cc.sequence(secondAction, callFunc);
        gameDir.secondLand.runAction(seq);
    },

    // 人物掉落
    heroDown() {
        var callFunc = cc.callFunc(function () {
            gameDir.overLoad.active = true;
        });

        // stick to down
        var stickAction = cc.rotateBy(0.5, 90).easing(cc.easeIn(3));
        gameDir.stick.runAction(stickAction);

        // hero to down
        var heroAction = cc.moveBy(0.5, cc.v2(0, -300 - gameDir.hero.height)).easing(cc.easeIn(3));
        gameDir.hero.runAction(cc.sequence(heroAction, callFunc));
    },

    // 人物移动
    heroMove(data) {
        var time = data.length / gameDir.heroMoveSpeed;
        var heroMove = cc.moveBy(time, cc.v2(data.length, 0));
        if (data.callFunc) {
            gameDir.hero.runAction(cc.sequence(heroMove, data.callFunc));
        } else {
            gameDir.hero.runAction(heroMove)
        }
    },

    // 生成棍子
    createStick() {
        var stick = spriteCreator.createStick(gameDir.stickWidth, gameDir.firstLand);
        stick.parent = gameDir.node;
        return stick;
    },

    // 生成新到地板
    newGround() {
        gameDir.secondLand = spriteCreator.createNewLand(gameDir.getLandWidth(), gameDir.firstLand);
        gameDir.secondLand.parent = gameDir.node;
    },

    // 获取地板宽度
    getLandWidth() {
        return gameDir.landWidth.x + (gameDir.landWidth.y - gameDir.landWidth.x) * Math.random();
    },

    // 计算地板位置
    getLandRange() {
        gameDir.currentLandRange = gameDir.landRange.x + (gameDir.landRange.y - gameDir.landRange.x) * Math.random();
        var winSize = cc.director.getWinSize();
        if (winSize.width < gameDir.currentLandRange + gameDir.heroWorldPosX + gameDir.hero.width + gameDir.secondLand.width) {
            gameDir.currentLandRange = winSize.width - gameDir.heroWorldPosX - gameDir.hero.width - gameDir.secondLand.width;
        }
        return gameDir.currentLandRange;
    },

    // 人物积分添加
    addScore() {
        var text = gameDir.score.getComponent(cc.Label);
        gameDir.nowScore += 1;
        text.string = '得分：' + gameDir.nowScore;
    },
})