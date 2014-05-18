var Splash = cc.LayerColor.extend({

    ctor:function() {
        this._super();
        cc.associateWithNative( this, cc.LayerColor );
    },
 
    onEnter:function () {
 
        this._super();
 
        var director = cc.Director.getInstance();
        var winSize = director.getWinSize();
        var centerPos = cc.p( winSize.width/2, winSize.height/2 );
 
        if( 'touches' in sys.capabilities ) {
            this.setTouchEnabled(true);
        }
        if( 'mouse' in sys.capabilities ) {
            this.setMouseEnabled(true);
        }
 
        var label = cc.LabelTTF.create("Brick Bounce!", "Arial", 32);
        label.setColor(cc.c3b(0, 0, 0));
        label.setPosition(winSize.width/2, winSize.height/2);
        this.addChild(label);

 
        this.runAction(cc.Sequence.create(
            cc.DelayTime.create(3),
            cc.CallFunc.create(function(node) {
                var scene = MainLayer.scene();
                cc.Director.getInstance().replaceScene(scene);
            }, this)
        ));
 
    },

    onMouseUp:function(event) {
        var scene = MainLayer.scene();
        cc.Director.getInstance().replaceScene(scene);
    },

    onTouchesEnded:function(event) {
        var scene = MainLayer.scene();
        cc.Director.getInstance().replaceScene(scene);
    }

});
 
Splash.create = function () {
    var sg = new Splash();
    if (sg && sg.init(cc.c4b(255, 255, 255, 255))) {
        return sg;
    }
    return null;
};
 
Splash.scene = function () {
    var scene = cc.Scene.create();
    var layer = Splash.create();
    scene.addChild(layer);
    return scene;
};