var Paddle = cc.Sprite.extend({
    prevX:0,
    prevPrevX:0,
    nextX:0,
    ctor:function() {
        this._super();

        this.initWithFile(s_bb_sprites,cc.rect(0, 0, 64, 16));

        this.setPosition(winSize.width, this.getContentSize().height * 3);
    },
    setX:function(x) {
        var dest = cc.p(0,0);

        if( x < this.getContentSize().width / 2 )
            dest = cc.p(this.getContentSize().width / 2, this.getPosition().y);
        else if (x + this.getContentSize().width / 2 > winSize.width)
            dest = cc.p(winSize.width - this.getContentSize().width / 2,this.getPosition().y);
        else
            dest = cc.p(x,this.getPosition().y);

        this.prevPrevX = this.prevX;
        this.prevX = this.getPosition();


        this.setPosition(dest);
    },
    is_moving_fast:function() {
        return cc.pLength(cc.pSub(this.getPosition(),this.prevX)) > 10 || cc.pLength(cc.pSub(this.prevX,this.prevPrevX)) > 10;
    },
    setNextX:function(x){
        this.nextX = x;
    },
    update:function(){
        this.setX(this.nextX);
    }
});

var Ball = cc.Sprite.extend({
    isMoving: false,
    velocity: cc.p(0,0),

    ctor:function() {
        this._super();

        this.initWithFile(s_bb_sprites,cc.rect(64, 0, 16, 16));

        this.setPosition(this.getContentSize().width * 10,winSize.height / 2);
    },
    start_moving:function() {
        this.isMoving = true;
        this.velocity = cc.p(150.0,-150.0);
    },
    invert_velocity_x:function() {
        ball.velocity = cc.pCompMult(ball.velocity, cc.p(-1.0, 1.0));
    },
    invert_velocity_y:function() {
        ball.velocity = cc.pCompMult(ball.velocity, cc.p(1.0, -1.0));
    },
    increase_velocity:function() {
        ball.velocity = cc.pMult(ball.velocity, 1.1);
    },
    increase_velocity_x:function() {
        ball.velocity = cc.pCompMult(ball.velocity, cc.p(1.1,1.0));
    },
    stop:function() {
        this.isMoving = false;
        this.velocity = cc.p(0,0);
    },

    is_out_of_bounds:function() {
        var realY = Math.floor(this.getPosition().y);
        if (realY < -1 * this.getContentSize().height ) {
            return true;
        }
        return false;
    },

    update: function (dt) {
        if (this.isMoving) {

            // Keep the ball in bounds
            if ( (currentPos.x - this.getContentSize().width / 2) < 0 || (currentPos.x + this.getContentSize().width / 2) > winSize.width) {
                
                //ball.velocity = cc.p(0,0);
                ball.invert_velocity_x();
            }

            var realX = Math.floor(this.getPosition().x + this.velocity.x * dt);
            var realY = Math.floor(this.getPosition().y + this.velocity.y * dt);

            this.setPosition(realX,realY);
            if (this.is_out_of_bounds()) {
                this.stop();
            }
        }
    }
});

var Brick = cc.Sprite.extend({
    ctor:function() {
        this._super();
        

        var colorSelect = Math.floor( Math.random() * 8 );   
        var baseX = 0;
        var baseY = 32;

        var brickWidth = 32;
        var brickHeight = 16;

        xOffset = baseX + (brickWidth * (colorSelect % 4));

        if (colorSelect < 4) {
            this.initWithFile(s_bb_sprites,cc.rect(xOffset, 32, brickWidth, brickHeight));
        } else {
            this.initWithFile(s_bb_sprites,cc.rect(xOffset, 48, brickWidth, brickHeight));
        }
    }
});

var ScoreLabel = cc.LabelTTF.extend({
    ctor:function() {
        this._super();

        this.initWithString("Score: 0","Arial", 32, cc.size(150, 45), cc.TEXT_ALIGNMENT_RIGHT);
        this.setPosition(winSize.width - 50, 16);

    },
    set_score:function(score) {
        this.setString("Score: " + score.toString());
    }
});

var VelocityLabel = cc.LabelTTF.extend({
    ctor:function() {
        this._super();

        this.initWithString("Velocity: 0","Arial", 32, cc.size(150, 45), cc.TEXT_ALIGNMENT_RIGHT);
        this.setPosition(winSize.width - 200, 16);

    },
    set_velocity:function(vector) {
        this.setString("Velocity X: " + Math.floor(vector.x).toString() + " , Y: " + Math.floor(vector.y).toString());
    }
});

var MainLayer = cc.LayerColor.extend({
 
    _bricks:[],
    _balls:[],
    _paddles:[],
    _bricksDestroyed:0,
    _score:0,

    ctor:function() {
        this._super();

        cc.associateWithNative( this, cc.LayerColor );
    },

    getTexture: function (name) {
        return cc.TextureCache.getInstance()
            .addImage('sprites/' + name + '.png');
    },

    addObject: function (desc) {
        var sprite = cc.Sprite.createWithTexture(this.getTexture(desc.name));

        sprite.setAnchorPoint(desc.anchor || cc.p(0.5, 0.5));
        sprite.setScaleX(desc.scaleX || desc.scale || 1);
        sprite.setScaleY(desc.scaleY || desc.scale || 1);
        sprite.setRotation(desc.rotation || 0);
        sprite.setPosition(cc.p(desc.x || 0, desc.y || 0));

        desc.shape && b2.enablePhysicsFor({
            type: desc.type,
            shape: desc.shape,
            sprite: sprite,
            radius: desc.radius,
            density: desc.density,
            userData: desc.userData
        });

        this.addChild(sprite, desc.z || 0);
        return sprite;
    },

    addObjectFromSprite: function (desc) {
        var sprite = desc.sprite;

        sprite.setAnchorPoint(desc.anchor || cc.p(0.5, 0.5));
        sprite.setScaleX(desc.scaleX || desc.scale || 1);
        sprite.setScaleY(desc.scaleY || desc.scale || 1);
        sprite.setRotation(desc.rotation || 0);
        sprite.setPosition(cc.p(desc.x || 0, desc.y || 0));

        desc.shape && b2.enablePhysicsFor({
            type: desc.type,
            shape: desc.shape,
            sprite: sprite,
            radius: desc.radius,
            density: desc.density,
            userData: desc.userData
        });

        this.addChild(sprite, desc.z || 0);
        return sprite;
    },
 
    // 4
    onEnter:function () {
        this._super();

        this.setup();

        this.scoreLabel = new ScoreLabel();
        this.addChild(this.scoreLabel);
        this.scoreLabel.set_score(this._score);

        this.velocityLabel = new VelocityLabel();
        this.addChild(this.velocityLabel);
        this.velocityLabel.set_velocity(this._balls[0].velocity);

        if( 'touches' in sys.capabilities ) {
            this.setTouchEnabled(true);
        }
        if( 'mouse' in sys.capabilities ) {
            this.setMouseEnabled(true);
        }

        //this.schedule(this.gameLogic, 3);

        this.scheduleUpdate();

        //audioEngine.playMusic(s_bgMusic, true);
    },


    setup:function() {
        this.addBall();
        this.addPaddle();

        for( j = winSize.height / 5 * 4; j < winSize.height - (winSize.height % 16) ; j+=16 ) {
            for( i = 0; i < winSize.width/32; i++) {
                this.addBrick(16 + i * 32,j);
            }
        }
    },

    addBall:function() {
        ball = new Ball();
        this.addChild(ball);

        ball.setTag(2);
        this._balls.push(ball);
    },

    addPaddle:function() {
        paddle = new Paddle();
        this.addChild(paddle);

        paddle.setTag(3);
        this._paddles.push(paddle);
    },

    addBrick:function(x,y) {
        brick = new Brick();
        brick.setPosition(x,y);
        this.addChild(brick);

        brick.setTag(1);
        this._bricks.push(brick);
    },

    //locationTouchedOrClicked: function(location) {
    //    ;
    //},

    onMouseUp:function (event) {
        //var location = event.getLocation();
        for (var i = 0; i < this._balls.length; i++) {            
            ball = this._balls[i];
            ball.start_moving();
        }
    },

    onMouseMoved:function (event) {
        for (var i = 0; i < this._paddles.length; i++) { 
            paddle = this._paddles[i];
            paddle.setNextX(event.getLocation().x);
        }
    },

    onMouseDragged:function (event) {
        this.onMouseMoved(event);
    },
     
    //onTouchesEnded:function (touches, event) {
    //   if (touches.length <= 0)
    //        return;
    //    var touch = touches[0];
    //    var location = touch.getLocation();
    //    this.locationTapped(location);
    //},

    checkCollision:function (object1, object2) {
        var object1rect = object1.getBoundingBox();

        var object2rect = object2.getBoundingBox();
        if (cc.rectIntersectsRect(object1rect, object2rect)) {
            return true;
        }
        return false;
    },

    game_over:function () {
        var scene = GameOver.scene(false, this._score);
        cc.Director.getInstance().replaceScene(scene);
    },

    update:function (dt) {

        for (var i = 0; i < this._paddles.length; i++) {
            this._paddles[i].update();
        }
        
        for (var i = 0; i < this._balls.length; i++) {

            var ball = this._balls[i];

            ball.update(dt);

            var collidedWithSomething = false;

            if (ball.velocity.y > 0) {

                for (var j = 0; j < this._bricks.length; j++) {

                    var brick = this._bricks[j];

                    if (this.checkCollision(brick,ball)) {

                        // destroy brick and increment score
                        this._bricksDestroyed++;
                        this._score += 10;
                        this.scoreLabel.set_score(this._score);

                        cc.ArrayRemoveObject(this._bricks, brick);
                        brick.removeFromParent();   

                        collidedWithSomething = true;

                        ball.increase_velocity();
              
                    }
                }
            }
            else if (ball.velocity.y < 0) {
                for (var j = 0; j < this._paddles.length; j++) {

                    var paddle = this._paddles[j];

                    if (this.checkCollision(paddle,ball)) {

                        collidedWithSomething = true;

                        if (paddle.is_moving_fast() ) {
                            ball.increase_velocity_x();
                        }
              
                    }
                }
            }

            currentVel = ball.velocity;
            currentPos = ball.getPosition();

            if ( collidedWithSomething ) {                
                ball.invert_velocity_y();
                this.velocityLabel.set_velocity(ball.velocity);
            }

            if ( ball.is_out_of_bounds() ) {
                cc.ArrayRemoveObject(this._balls, ball);
                ball.removeFromParent();
            }

            if (this._balls.length == 0)
                this.game_over();
        }
        
    }
});

// 1
MainLayer.create = function () {
    var sg = new MainLayer();
    if (sg && sg.init(cc.c4b(255, 255, 255, 255))) {
        return sg;
    }
    return null;
};
 
// 2
MainLayer.scene = function () {
    var scene = cc.Scene.create();
    var layer = MainLayer.create();
    layer.setColor('black');
    scene.addChild(layer);
    return scene;
};