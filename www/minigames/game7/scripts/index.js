// ------------------------ 1. GLOBAL VARIABLES ----------------------------- //
// Debugging constant. Set true if debugging.
var DEBUGGING = false;

// Game state constants
var GS_NONE = 0;
var GS_MOVE_CUE_STICK = 1;
var GS_PULL_BACK_CUE_STICK = 2;
var GS_RELEASE_CUE_STICK = 3;
var GS_RELEASED_CUE_STICK = 4;
var GS_BLACK_BALL_HIT = 5;

// Game state variable
var gameState;
var action_down = null;

var colorArray = ['red','blue','green','yellow','orange','cyan','purple','pink','brown','gray','violet'];

var _num = 0;
var opts = [
    [0,1,2,3],[3,0,1,2],[2,3,0,1],[1,2,3,0]
]

// Sprite variables
var cue_stick;
var black_ball;
var other_balls;
var pivots;
var table_border;
var assist_rule;
var aim_rule;
var cue_stick_angles = [[1,1],[3,2],[2,1],[1,2]];
var cue_stick_num = 0;
var pool_sprite;

//Collision groups variables
var poolTableCollisionGroup;
var cueStickCollisionGroup;
//                var aimRuleCollisionGroup;
var blackBallCollisionGroup;
var otherBallsCollision1;
var otherBallsCollision2;
var otherBallsCollision3;
var otherBallsCollision4;
var otherBallsCollision5;
var otherBallsCollision6;
var otherBallsCollision7;
var otherBallsCollision8;
var ballPottedCollision1;
var ballPottedCollision2;
var ballPottedCollision3;
var ballPottedCollision4;

// Other variables
var cursors;
var interval = null;
var pointer;
var downPointer;
var customBounds;
var currentLevel = 0;
var borders = [];
var pottedNumber  = [];
var original_positions  = [];
var colorArr;
var pocketed = 0;
var blanks = [];
var blankArr = [];
var blank1,blank2,blank3,blank4,POS = [],drag,hit = true,glow;
var b1='',b2='',b3='',b4='',b5='',b6='',b7='',b8='',hl;
var jsonData = null;
var game = null;

var piv1;
var piv2;
var piv3;
var piv4;
var pivot1;
var pivot2;

var line;
var line1;
var line2;

var perpendicular = false;
var normal1;
var normal2;
var reflection;
var p;
var shoot, navigate;

var scores = 100;
var skip_button;
var returnUrl;
function exitGame(score) {
    if (returnUrl) {
        var gameResult = {score: score};
        stores.set("extGameResult", gameResult);
        window.location.replace(returnUrl);
    }
}

function isPhoneGap() {
    return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/);
}


jQuery.getJSON("assets/json/data.json", function(data) {
    startGame(data);
}).error(function() {
    alert("Error reading data.json!");
});

function startGame(data) {
    jsonData = data.jsonData;
    game = new Phaser.Game(1280, 720, Phaser.CANVAS, '');
    game.state.add("boot", boot);
    game.state.add("Preloader", Preloader);
    game.state.add("play", play);
    game.state.start('boot');
}







