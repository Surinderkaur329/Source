// ------------------------ 1. GLOBAL VARIABLES ----------------------------- //
var jsonData = null;
var game = null;

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

// Global constants
var HS_1_POSITION = { x: 250, y: 610 };
var HS_3_POSITION = { x: HS_1_POSITION.x, y: HS_1_POSITION.y };
var POINT_POSITION;
var ROTATE_DELTA = 0.5;
var HS_ANGLE_UPPER_LIMIT = 40;
var HS_ANGLE_LOWER_LIMIT = 3;
var FIRE_TRUCK_OFFSET_Y;
var WATER_CANNON_OFFSET_Y;
var WATER_CANNON_OFFSET_X = -90;
var WC_ANGLE_UPPER_LIMIT = 40;
var WC_ANGLE_LOWER_LIMIT = 0;
var CANNON_SHOT_OFFSET_X;
var emitters = null;

// Global variables
var hs_1, hs_2, hs_3, hs_4, hl_landing, hl_bottom;
var fire_truck, water_cannon;
var cursors;
var p1,fb_;
var hs_1_angle;
var cannon_shot, cannon_shot_1;
var balloon1, balloon2, balloon3, balloon4, balloon5, ball5;
var is_ball5_shot = false;
var fireballs = [];
var wrongBall = [];
var ballLocation = [];
var cannon_shots = [];
var fired_nums = [];
var fb_arr = [];
var ammo_count = 10;
var endGame = true;
var ammo_count_label;
var hit_count = 0;
// var x_pos = [850, 1020, 1190];
// var x_pos = [510, 680, 850, 1020, 1190];
var yPos3 = [[560,260,420],[260,560,420],[420,260,560]];
var x_pos = [510, 680, 850];
var yPos;
// var x_pos = [510, 850, 1190];
var nos = [];
var action_down = null;

var hit = 0;
var level = 0;
var count__ = 0;
var retryNumber = 0;
var dropping = 0;
var spwan = 0,spwan2  = 0,spwan3  = 0,y_pos = 0,y_pos3 = 0;


var x = location.href;

var sp =x.split('?level=');
if(sp[1] && sp[1].split("&") !== undefined){
    sp = sp[1].split("&")[0];
}
if(sp !== "" && sp !== undefined && sp !== null){
    if(sp > 0 && sp < 70){
        level = parseInt(sp);
        if(level === 1){
            level = 0
        }else if(level === 2){
            level = 10
        }else if(level === 3){
            level = 21
        }else if(level === 4){
            level = 32
        }else if(level === 5){
            level = 43
        }else{
            level = 0
        }
    }else{
        level = 0;
    }
}else {
    level = 0;
}


var bmd,
    bglife,
    widthLife,
    totalLife,
    life,
    startLife = 505,
    reduceLife = 101,
    reduceLife2 = 101,
    HitTarget = false,
    retry,
    isGameOver =false;

var LevelText,bulletsText,bullets,offset = 0,lvls,wrong;


function isPhoneGap() {
    return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/);
}

jQuery.getJSON("assets/json/data.json", function(data) {
    jsonData = data;
    game = new Phaser.Game(1280, 720, Phaser.WEBGL, '');
    game.state.add("boot", boot);
    game.state.add("Preloader", Preloader);
    game.state.add("play", play);
    game.state.start('boot');
}).error(function() {
    alert("Error reading data.json!");
});



