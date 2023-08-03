var LetiFramework = LetiFramework || {};

LetiFramework.Utils = LetiFramework.Utils || {};

LetiFramework.Utils.fbShare = function(picture, name, caption, description, link) {
	var params = {
		method: "feed"
	};
	if (picture) params.picture = picture;
	if (name) params.name = name;
	if (caption) params.caption = caption;
	if (description) params.description = description;

	if (LetiFramework.App.isPhoneGap()) {
		if (link) params.href = link;
		facebookConnectPlugin.showDialog(params,
			function(response) {
				LetiFramework.Utils.log(JSON.stringify(response))
			},
			function(response) {
				LetiFramework.Utils.log(JSON.stringify(response))
			});
	} else {
		if (link) params.link = link;
		FB.ui(params, function(response) {});
	}
}

LetiFramework.Utils.twShare = function(message, picture, link) {
	if (LetiFramework.App.isPhoneGap()) {
		window.plugins.socialsharing.shareViaTwitter(message, picture, link,
			function() {
				// Success handler
			},
			function(error) {
				alert("Cannot share via Twitter. Twitter app required!");
			});
	} else {
		window.open("https://twitter.com/intent/tweet?url=" + encodeURIComponent(link), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
	}
}

LetiFramework.Utils.loadFont = function(custom_font) {
	var fontPath = this.getFontPath(custom_font);
	var game = LetiFramework.Renderer.game;
	game.load.bitmapFont(fontPath, fontPath + '.png', fontPath + '.fnt');
}

LetiFramework.Utils.loadAssetFont = function(custom_font) {
	var fontPath = this.getAssetFontPath(custom_font);
	var game = LetiFramework.Renderer.game;
	game.load.bitmapFont(fontPath, fontPath + '.png', fontPath + '.fnt');
}

LetiFramework.Utils.getFontPath = function(custom_font) {
	return 'assets/font/' + custom_font.font;
}

LetiFramework.Utils.getAssetFontPath = function(custom_font) {
	var ctrlr = LetiFramework.GameController;
	return 'assets/stories/' + ctrlr.currentGame.storyId + '/episodes/' + ctrlr.currentGame.id + '/content/font/' + custom_font.font;
}

LetiFramework.Utils.loadImage = function(name) {
	var path = this.getImagePath(name);
	var game = LetiFramework.Renderer.game;
	game.load.image(path, path);
}

LetiFramework.Utils.getImagePath = function(name) {
	return "assets/img/" + name;
}

LetiFramework.Utils.wrapText = function(text, custom_font) {
	var width = custom_font.wordWrapWidth;
	var fontSize = custom_font.font_size;

	if (!width) return text;

	var wrappedText = text;
	var lines = [];
	var game = LetiFramework.Renderer.game;
	var fontPath = this.getFontPath(custom_font);
	var font = game.cache.checkBitmapFontKey(fontPath) ? fontPath : this.getAssetFontPath(custom_font);

	for (var i = 0, start = 0; i < text.length; i++) {
		var tf = game.add.bitmapText(0, 0, font, text.substring(start, i), fontSize);

		if (tf.width > width) {
			var pos = tf.text.lastIndexOf(' ');

			if (pos == -1) {
				lines.push(tf.text);
				start += tf.text.length;
			} else {
				lines.push(tf.text.substring(0, pos).trim());
				start += pos;
			}
		}

		tf.destroy();
	}

	if (lines.length > 0) {
		wrappedText = lines.join('\n');
		if (wrappedText.length < text.length) {
			wrappedText += "\n" + text.substring(wrappedText.length).trim();
		}
	}

	return wrappedText;
}

LetiFramework.Utils.log = function(msg) {
	//console.log(msg);
	//alert(msg);
}

LetiFramework.Utils.removeDotPath = function(filePath) {
	while (filePath.indexOf("/../") > -1) {
		var a = filePath.indexOf("/..");
		var b = filePath.lastIndexOf("/", a - 1);
		filePath = filePath.substring(0, b + 1) + filePath.substring(a + 4);
	}
	return filePath;
}

LetiFramework.Utils.getFiles = function(dir, fileList) {
	fileList = fileList || [];

	var files = fs.readdirSync(dir);
	for (var i in files) {
		if (!files.hasOwnProperty(i)) continue;
		var name = dir + '/' + files[i];
		if (fs.statSync(name).isDirectory()) {
			getFiles(name, fileList);
		} else {
			fileList.push(name);
		}
	}
	return fileList;
}