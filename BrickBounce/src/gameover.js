var GameOver = cc.LayerColor.extend({
 
    _won:false,
    _score:0,
 
    ctor:function() {
        this._super();
        cc.associateWithNative( this, cc.LayerColor );
    },
 
    onEnter:function () {
 
        this._super();
 
        var director = cc.Director.getInstance();
        var winSize = director.getWinSize();
        var centerPos = cc.p( winSize.width/2, winSize.height/2 );
 
        var message;
        if (this._won) {
            message = "You Won!";
        } else {
            message = "You Lose :[";
        }
 
        var label = cc.LabelTTF.create(message, "Arial", 32);
        label.setColor(cc.c3b(0, 0, 0));
        label.setPosition(winSize.width/2, winSize.height/2);
        this.addChild(label);

        var label = cc.LabelTTF.create("Final Score: " + this._score.toString(), "Arial", 32);
        label.setColor(cc.c3b(0, 0, 0));
        label.setPosition(winSize.width/2, winSize.height/3);
        this.addChild(label);
 
        this.runAction(cc.Sequence.create(
            cc.DelayTime.create(3),
            cc.CallFunc.create(function(node) {
                var scene = MainLayer.scene();
                cc.Director.getInstance().replaceScene(scene);
            }, this)
        ));
 
    }
});
 
GameOver.create = function (won, score) {
    var sg = new GameOver();
    sg._won = won;
    sg._score = score;
    if (sg && sg.init(cc.c4b(255, 255, 255, 255))) {
        return sg;
    }
    return null;
};
 
GameOver.scene = function (won, score) {
    var scene = cc.Scene.create();
    var layer = GameOver.create(won, score);
    scene.addChild(layer);
    return scene;
};