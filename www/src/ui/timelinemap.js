var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.timelinemap = function(game) {
	this.game = game;
	this.mapGroup = null;
	this.closeBt = null;
	this.popupWidth = 1000;
	this.popupHeight = 600;
	this.currentUser = LetiFramework.GameController.currentUser;
	this.currentStoryData = LetiFramework.GameController.currentStoryData;
	this.animScale = LetiFramework.Renderer.animScale;
	this.attr = 'gourd';
}

LetiFramework.Ui.timelinemap.prototype = {

	show: function() {
		this.mapGroup = this.game.add.group();

		this.mapGroup.width = this.popupWidth;
		this.mapGroup.height = this.popupHeight;
		this.mapGroup.x = (this.game.width - this.popupWidth) / 2;
		this.mapGroup.y = (this.game.height - this.popupHeight) / 2;

		var popupbg = this.getGraphics(0.95, 0x000000, 0, 0, this.popupWidth, this.popupHeight);
		popupbg.inputEnabled = true;
		popupbg.events.useHandCursor = true;
		popupbg.events.onInputDown.add(function(){
			this.hide();
		}, this);
		this.mapGroup.add(popupbg);

		var pointsBg = this.getGraphics(0.7, 0x00aeef, 10, 10, this.popupWidth - 20, 60);
		this.mapGroup.add(pointsBg);

		var timepoints = this.game.add.text(10, 10, "CURRENT TIME POINTS:", {
			font: '40pt Arial',
			fill: 'white'
		});
		this.mapGroup.add(timepoints);

		var val = Math.round(this.currentUser.player_attributes[this.attr] * 100 / 15);
		val = val > 100 ? 100 : val;
		var timepointsValue = this.game.add.text(this.popupWidth, 10, val + "%", {
			font: '40pt Arial',
			fill: 'white'
		});
		timepointsValue.x -= timepointsValue.width + 10;
		this.mapGroup.add(timepointsValue);

		var count = 0;
		var y = timepoints.y + timepoints.height + 60;
		var apr = this.currentStoryData.attribute_page_redirection;		

		var valBg = this.getGraphics(0.3, 0xf7941e, 5, y - 20, this.popupWidth - 10, this.popupHeight - y + 15);
		this.mapGroup.add(valBg);

		var msg = this.game.add.text(10, this.popupHeight - 40, 'Collect the time points above to rewind time to the named scenes.', {
			font: '26px Arial',
			fill: 'white'
		});
		this.mapGroup.add(msg);

		for (var i in apr[this.attr]) {
			var tl = apr[this.attr][i];
			var tlscore = tl.score;
			for (var j in tl.pages) {
				var pagename = tl.pages[j].scene;
				var image = tl.pages[j].image;
				var d = count * (timepoints.height + 10);
				this.timelineEntry(pagename, tlscore, y + d);
				++count;
			}
		}

		this.closeBt = this.game.add.button(this.popupWidth + 20, -40,
            LetiFramework.Utils.getImagePath(
            	LetiFramework.GameController.screensConfig.timelinemap.close_button.image), this.hide, this, 2, 1, 0);
        this.closeBt.input.useHandCursor = true;
        this.mapGroup.add(this.closeBt);

		this.game.add.tween(this.mapGroup).from(
			{y: 900}, 700 * this.animScale, Phaser.Easing.Linear.None, true);
	},

	hide: function() {
		this.mapGroup.destroy();
		LetiFramework.GameController.timelinemap = null;
	},

	timelineEntry: function(page, score, y) {
		//alert(page + "," + score + "," + y);
		var pagename = this.game.add.text(10, y, page + ":", {
			font: '40pt Arial',
			fill: 'white'
		});
		this.mapGroup.add(pagename);

		var w = this.popupWidth / 2;
		var pbBack = this.getGraphics(1, 0xffffff, w, y, w - 10, pagename.height);
		this.mapGroup.add(pbBack);

		var pbFront = this.getGraphics(1, 0xfd8214, w, y, w * score / 15, pagename.height);
		this.mapGroup.add(pbFront);

		var val = Math.round(score * 100 / 15);
		var timepointsValue = this.game.add.text(w + 0.5 * w, y, val + "%", {
			font: '40pt Arial',
			fill: 'black'
		});
		timepointsValue.x -= timepointsValue.width * 0.5;
		this.mapGroup.add(timepointsValue);
	},

	getGraphics: function(a, c, x, y, w, h, r) {
		var g = this.game.add.graphics(x, y);
		g.beginFill(c, a);
		if (r) {
			g.drawRoundedRect(0, 0, w, h, r);
		} else {
			g.drawRect(0, 0, w, h);
		}
		g.endFill();
		return g;
	}
}