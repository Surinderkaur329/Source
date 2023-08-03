// ------------------------ 1. GLOBAL VARIABLES ----------------------------- //
var game = null;
var cursors = null;


// GAME STATES
var GS_NONE = 0;
var GS_INIT = 1;
var GS_PLAY = 2;
var GS_GAME_OVER = 3;
var GS_DESTROY = 4;

// Game state variable
var gs = GS_NONE;

// Game json
var levelsJson = null;

// Current game level
var level;

var x = location.href;

var sp =x.split('?level=');

if(sp[1] !== "" && sp[1] !== undefined && sp[1] !== null){
    if(sp[1] > 0 && sp[1] < 18){
        level = sp[1] - 1;
    }else{
        level = 0;
    }
}else{
    level = 0;
}

// ------------------------ 2. GLOBAL FUNCTIONS ----------------------------- //
function preloadImage(image) {
    game.load.image(image, 'assets/images/' + image);
}

function addImage(x, y, image) {
    return game.add.sprite(x, y, image);
}

function addButton(x, y, image, cb, ctx) {
    return game.add.button(x, y, image, cb, ctx, 2, 1, 0);
}

function AddUswer() {
     var user = "GlobalPalyaer";
     for(var i = 0; i < 10; i++){
         this.globalAlpha.push(i);
     }
}

function getGraphics(a, c, x, y, w, h, r, cb, ctx) {
    var g = game.add.graphics(x, y);
    g.beginFill(c, a);
    if (r) {
        g.drawRoundedRect(0, 0, w, h, r);
    } else {
        g.drawRect(0, 0, w, h);
    }
    g.endFill();
    if (cb) {
        g.inputEnabled = true;
        g.input.input.useHandCursor = true;
        g.events.onInputDown.add(cb, ctx);
    }
    return g;
}

function createPreviewBounds(x, y, w, h) {
    var sim = game.physics.p2;

    //  If you want to use your own collision group then set it here and un-comment the lines below
    var mask = sim.boundsCollisionGroup.mask;

    var customBounds = {
        left: null,
        right: null,
        top: null,
        bottom: null
    };

    customBounds.left = new p2.Body({
        mass: 0,
        position: [sim.pxmi(x), sim.pxmi(y)],
        angle: 1.5707963267948966
    });
    customBounds.left.addShape(new p2.Plane());
    // customBounds.left.shapes[0].collisionGroup = mask;

    customBounds.right = new p2.Body({
        mass: 0,
        position: [sim.pxmi(x + w), sim.pxmi(y)],
        angle: -1.5707963267948966
    });
    customBounds.right.addShape(new p2.Plane());
    // customBounds.right.shapes[0].collisionGroup = mask;

    customBounds.top = new p2.Body({
        mass: 0,
        position: [sim.pxmi(x), sim.pxmi(y)],
        angle: -3.141592653589793
    });
    customBounds.top.addShape(new p2.Plane());
    // customBounds.top.shapes[0].collisionGroup = mask;

    customBounds.bottom = new p2.Body({
        mass: 0,
        position: [sim.pxmi(x), sim.pxmi(y + h)]
    });
    customBounds.bottom.addShape(new p2.Plane());
    // customBounds.bottom.shapes[0].collisionGroup = mask;

    sim.world.addBody(customBounds.left);
    sim.world.addBody(customBounds.right);
    sim.world.addBody(customBounds.top);
    sim.world.addBody(customBounds.bottom);

    
}
function isPhoneGap() {
    return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/);
}

jQuery.getJSON("assets/json/data.json", function(data) {
    levelsJson = data;
    // Initialize phaser game
    game = new Phaser.Game(1280, 720, Phaser.CANVAS, '');
    game.state.add("boot", boot);
    game.state.add("Preloader", Preloader);
    game.state.add("play", play);
    game.state.start('boot');
}).error(function() {
    alert("Error reading data.json!");
});