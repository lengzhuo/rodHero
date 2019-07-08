cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        let btnAni = this.playAni();
        this.node.runAction(btnAni);
    },

    start() {
        this.node.on('touchend', this.playGame, this);
    },

    playGame() {
        console.log('点击开始游戏');
        cc.director.loadScene('game');
    },

    playAni() {
        let btnAniUp = cc.moveBy(2, cc.v2(0, 30)).easing(cc.easeCubicActionOut());
        let btnAniDown = cc.moveBy(2, cc.v2(0, -30)).easing(cc.easeCubicActionIn());
        return cc.repeatForever(cc.sequence(btnAniUp, btnAniDown));
    }

});
