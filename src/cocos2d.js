(function () {
    var d = document;
    var c = {
 
        // 1
        menuType:'canvas',
        COCOS2D_DEBUG:2,
        box2d:true,
        chipmunk:false,
        showFPS:true,
        frameRate:60,
        loadExtension:true,
        tag:'gameCanvas', 
 
        // 2
        engineDir:'./src/lib/cocos2d/',
        appFiles:[
            './src/splash.js',
            './src/resource.js',
            './src/game.js',
            './src/gameover.js',
            './src/main.js'
        ]
    };
 
    // 3
    window.addEventListener('DOMContentLoaded', function () {
        var s = d.createElement('script');
 
        if (c.SingleEngineFile && !c.engineDir) {
            s.src = c.SingleEngineFile;
        }
        else if (c.engineDir && !c.SingleEngineFile) {
            s.src = c.engineDir + 'platform/jsloader.js';
        }
        else {
            alert('You must specify either the single engine file OR the engine directory in "cocos2d.js"');
        }        
 
        document.ccConfig = c;
        s.id = 'cocos2d-html5';
        d.body.appendChild(s);
    });
})();