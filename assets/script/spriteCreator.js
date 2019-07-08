var spriteCreator = (function (){
    var spriteFrameCache = 'default_sprite';
    return {
        // // 创建新的地板
        // createNewLand: function(width, sf) {
        //     var nLand = new cc.Node('Land');
        //     var sp = nLand.addComponent(cc.Sprite);
        //     sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        //     sp.spriteFrame = sf;
        //     nLand.anchorX = 0;
        //     nLand.anchorY = 0;
        //     nLand.color = cc.Color.BLACK;
        //     nLand.height = 300;
        //     nLand.width = width;
        //     return nLand;
        // },
        // // 创建棍子
        // createStick: function(width, sf){
        //     var stick = new cc.Node("stick");
        //     var sp = stick.addComponent(cc.Sprite);
        //     sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        //     sp.spriteFrame = sf;
        //     stick.anchorY = 0;
        //     stick.y = 300;
        //     stick.color = cc.Color.BLACK;
        //     stick.height = 0;
        //     stick.width = width;
        //     return stick;
        // }
        createNewLand: function(width, sp) {
            var nLand = cc.instantiate(sp);
            nLand.width = width;
            return nLand;
        },
        createStick: function(width, sp){
            var stick = cc.instantiate(sp);
            stick.anchorX = 0.5;
            stick.y = 300;
            stick.height = 0;
            stick.width = width;

            return stick;
        }
    }
})();
module.exports = spriteCreator;