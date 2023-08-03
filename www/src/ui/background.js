var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

// LetiFramework.Ui.Background = function(game) {};

var jsonData = null, game = null, backgroundMusic,soundPath;
var paused = false;
var interval = setInterval(function () {
    if(window.localStorage.getItem("bootJson")){
        jsonData = JSON.parse(window.localStorage.getItem("bootJson"));
        clearInterval(interval);
        // LetiFramework.Ui.Background.prototype =  {init: init, preload: preload, create: create, update: update, render: render};
        // LetiFramework.Renderer.render('Background');
        game = new Phaser.Game(10, 2,Phaser.WEBGL, '', {init: init, preload: preload, create: create, update: update, render: render});
    }
},1000);
var bgVolume = 0.4;

function init() {
    LetiFramework.Analytics.trackPage("Background");
}

function preload() {
    game.load.audio('sound', 'assets/sound/Music/Theme_song1.mp3', 1, true);
    //soundPath = getSoundPath(jsonData.background.Menu_audio);
}

function create() {
    backgroundMusic = game.add.audio('sound');
    backgroundMusic.volume = bgVolume;
    if(LetiFramework.SoundManager.soundOn){
        backgroundMusic.play();
    }else{
        paused = true;
    }
    console.log("loaded");
}

function update() {
    if(window.localStorage.getItem('pause')){
        if(!paused){
            backgroundMusic.pause();
            paused = true;
            console.log('play');
        }
    }
    if(!window.localStorage.getItem('pause')){
        if(paused){
            backgroundMusic.play();
            console.log('pause');
            paused = false;
        }
    }
}

function render() {}

getSoundPath = function(name) {
    return "assets/sound/" + name;
};

loadAudio = function(name) {
    var key = this.getSoundPath(name);
    this.game.load.audio(key, key);
};
