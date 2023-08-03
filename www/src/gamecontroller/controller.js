var LetiFramework = LetiFramework || {};
var LetiFramework = LetiFramework || {};

LetiFramework.GameController = LetiFramework.GameController || {};

LetiFramework.GameController.games = null;

LetiFramework.GameController.bootScreen = null;

LetiFramework.GameController.bootConfig = null;

LetiFramework.GameController.screensConfig = null;

LetiFramework.GameController.menuConfig = null;

LetiFramework.GameController.screenComponents = null;

LetiFramework.GameController.currentStory = null;

LetiFramework.GameController.currentGame = null;

LetiFramework.GameController.currentStoryData = null;

LetiFramework.GameController.currentStoryComponents = null;

LetiFramework.GameController.currentStoryBadges = null;

LetiFramework.GameController.currentStoryQuiz = null;

LetiFramework.GameController.pageHistory = [];

LetiFramework.GameController.currentGamePage = null;

LetiFramework.GameController.nextGamePage = null;

LetiFramework.GameController.currentGamePageData = null;

LetiFramework.GameController.currentUser = null;

LetiFramework.GameController.currentUserGameLocation = null;

LetiFramework.GameController.gameStarted = false;

LetiFramework.GameController.gameCompleted = false;

LetiFramework.GameController.currentGamePageDataOverride = null;

LetiFramework.GameController.nextGamePageDataOverride = null;

LetiFramework.GameController.currentStorySound = null;

LetiFramework.GameController.debugging = false;

LetiFramework.GameController.assetFiles = null;

LetiFramework.GameController.saveInstance = function() {
	var instance = {
		games: this.games,
		bootScreen: this.bootScreen,
		bootConfig: this.bootConfig,
		menuConfig: this.menuConfig,
		screensConfig: this.screensConfig,
		screenComponents: this.screenComponents,
		currentStory: this.currentStory,
		currentGame: this.currentGame,
		currentStoryData: this.currentStoryData,
		currentStoryComponents: this.currentStoryComponents,
		currentStoryBadges: this.currentStoryBadges,
		currentStoryQuiz: this.currentStoryQuiz,
		pageHistory: this.pageHistory,
		currentGamePage: this.currentGamePage,
		nextGamePage: this.nextGamePage,
		currentGamePageData: this.currentGamePageData,
		currentUser: this.currentUser,
		currentUserGameLocation: this.currentUserGameLocation,
		gameStarted: this.gameStarted,
		gameCompleted: this.gameCompleted,
		currentGamePageDataOverride: this.currentGamePageDataOverride,
		nextGamePageDataOverride: this.nextGamePageDataOverride
	};
	stores.set("savedInstance", instance);
}

LetiFramework.GameController.initialize = function() {
	var savedInstance = stores.get("savedInstance");

	this.fetchPurchaseConfig ();
	
	if (savedInstance && stores.get("extGameResult")) {
		//console.log("hello world");
		// coming back from external game
		// initialize game from savedInstance
		this.games = savedInstance.games;
		this.bootScreen = savedInstance.bootScreen;
		this.bootConfig = savedInstance.bootConfig;
		this.debugging = this.bootConfig.debugging;
		this.menuConfig = savedInstance.menuConfig;
		this.screensConfig = savedInstance.screensConfig;
		this.screenComponents = savedInstance.screenComponents;
		this.currentStory = savedInstance.currentStory;
		this.currentGame = savedInstance.currentGame;
		this.currentStoryData = savedInstance.currentStoryData;
		this.currentStoryComponents = savedInstance.currentStoryComponents;
		this.currentStoryBadges = savedInstance.currentStoryBadges;
		this.currentStoryQuiz = savedInstance.currentStoryQuiz;
		this.pageHistory = savedInstance.pageHistory;
		this.currentGamePage = savedInstance.currentGamePage;
		this.nextGamePage = savedInstance.nextGamePage;
		this.currentGamePageData = savedInstance.currentGamePageData;
		this.currentUser = savedInstance.currentUser;
		this.currentUserGameLocation = savedInstance.currentUserGameLocation;
		this.gameStarted = savedInstance.gameStarted;
		this.gameCompleted = savedInstance.gameCompleted;
		this.currentGamePageDataOverride = savedInstance.currentGamePageDataOverride;
		this.nextGamePageDataOverride = savedInstance.nextGamePageDataOverride;
		this.showView("Boot");
	} else {
		stores.remove("savedInstance");
		stores.remove("extGameResult");
		this.fetchBootConfig();
	}
}

LetiFramework.GameController.bootSequence = function() {
	var data = this.bootConfig[this.bootScreen];
	console.log("screenCnfiq",data);
	if (data.next_screen_if_logged_in && stores.get("session")) {
        this.bootScreen = data.next_screen_if_logged_in;
		data = this.bootConfig[this.bootScreen];
	}

	if (this.bootScreen == "menu") {
		this.menuConfig = data;
		this.fetchGames();
	} else if (data.type == "Login") {
		this.autoLogin();
	} else {
		LetiFramework.Renderer.render(data.type);
	}
};

LetiFramework.GameController.autoLogin = function() {
	var session = stores.get("session");
	if (session) {
		var users = LetiFramework.Db.readByKeyValue("users", "nickname", session);
		if (users.length > 0) {
			this.bootScreen = "select_game"; //this.bootConfig[this.bootScreen].login_button.next_screen;
			this.loginUser(users[0]);
		} else {
			stores.remove("session");
			stores.set("loginErr", "Nickname doesn't exist!");
			LetiFramework.Renderer.render("Login");
		}
	} else {
		LetiFramework.Renderer.render("Login");
	}
};

LetiFramework.GameController.loginUser = function(user) {
	if (!user.points) {
		user.points = 0;
		LetiFramework.Db.update("users", user);
	}
	this.currentUser = user;
	LetiFramework.Analytics.trackEvent("Login", "Success");
	this.bootSequence();
};

LetiFramework.GameController.loginAnonymous = function() {
	var clear = LetiFramework.GameController.gup("clear");
	if (clear) {
		LetiFramework.Db.clear();
	}
	var user = LetiFramework.Db.read("users", 0);
	if (user == null) {
		user = new LetiFramework.DbEntities.User("anonymous");
		user.id = 0;
		LetiFramework.Db.create("users", user); // create anonymous user if doesn't exist
	}
	LetiFramework.GameController.currentUser = user;
};

LetiFramework.GameController.logoutUser = function() {
	if (this.currentUser.id > 0) {
		stores.remove("session");
		this.currentUser = null;
	}
};

LetiFramework.GameController.updateUserOnServer = function() {
	if (LetiFramework.App.isPhoneGap()) {
		//Update user server record 
		LetiFramework.NetworkManager.postRequest("UpdateServlet", {
			modelType: 2,
			model: this.currentUser
		}, function(data) {}, function() {});
	}
};

LetiFramework.GameController.fetchBootConfig = function() {
	jQuery.getJSON("config/boot.json", function(data) {
		LetiFramework.GameController.bootConfig = data;
		//console.log(data);
		window.localStorage.setItem('bootJson',JSON.stringify(data));
		LetiFramework.GameController.debugging = data.debugging;
		LetiFramework.GameController.menuConfig = data.menu;
        // if(window.localStorage.getItem('game_url')){
        //     window.localStorage.removeItem('game_url');
        //     LetiFramework.GameController.bootScreen = data.start_screen2;
        // }else{
            LetiFramework.GameController.bootScreen = data.start_screen;
        // }
		LetiFramework.GameController.fetchScreensConfig();
	}).error(function() {
		alert("Error fetching boot config!");
	});
};

LetiFramework.GameController.fetchScreensConfig = function() {
	jQuery.getJSON("config/screens.json", function(data) {
		LetiFramework.GameController.screensConfig = data;
		LetiFramework.GameController.fetchScreenComponents();
	}).error(function() {
		alert("Error fetching screens config!");
	});
}

LetiFramework.GameController.fetchScreenComponents = function() {
	jQuery.getJSON("config/screencomponents.json", function(data) {
		LetiFramework.GameController.screenComponents = data;
		LetiFramework.GameController.showView("Boot");
	}).error(function() {
		alert("Error fetching screens components!");
	});
}

LetiFramework.GameController.fetchGames = function() {
	if (this.currentUser == null) {
		this.loginAnonymous();
	}
	jQuery.getJSON("data/stories.json", function(games) {
		LetiFramework.GameController.games = games;
		if (games.length > 0) {
			LetiFramework.GameController.showView("Menu");
            // LetiFramework.GameController.bootScreen = "select_game";
            // LetiFramework.GameController.bootSequence();
		} else {
			alert("Failed to fetch games.");
		}
	}).error(function() {
		alert("Error fetching games!");
	});
}

LetiFramework.GameController.fetchPurchaseConfig = function() {
	jQuery.getJSON("config/purchase.json", function(data) {
		LetiFramework.GameController.purchaseConfig = data;
	}).error(function() {
		alert("Error fetching purchase config!");
	});
}

LetiFramework.GameController.initializeGame = function(game, autoplay) {
	if (this.isGameUnlocked(game) || LetiFramework.GameController.gup("page")) {
		LetiFramework.GameController.currentGame = game;
		var locations = LetiFramework.Db.readByKeysAndValues("user_game_location", ["user_id", "game_id"], [LetiFramework.GameController.currentUser.id, game.id]);
		LetiFramework.GameController.currentUserGameLocation = locations.length > 0 ? locations[0] : null;
		LetiFramework.GameController.gameCompleted = false;
		LetiFramework.GameController.gameStarted = false;
		if (autoplay) {
			if (game.available) {
				if (LetiFramework.App.isPhoneGap()) {
					var episodeDataFile = LetiFramework.FileManager.getEpisodeDataFilePath(game.storyId, game.id);
					window.resolveLocalFileSystemURI(episodeDataFile,
						function() {
							// content is available, proceed to play
							LetiFramework.GameController.fetchGameSteps();
						},
						function() {
							// Content isn't available, show user title screen so that they can download
							// LetiFramework.GameController.showView("Title");
							LetiFramework.GameController.fetchGameSteps();
						});
				} else {
					LetiFramework.GameController.fetchGameSteps();
				}
			} else {
				LetiFramework.Renderer.render("Menu");
			}
		} else {
			LetiFramework.GameController.fetchGameSteps();
			// LetiFramework.GameController.showView("Title");
		}
		return null;
	} else {
		var unlockEpisodeName;
		for (var i = 0; i < this.currentStory.episodes.length; i++) {
			var episode = this.currentStory.episodes[i];
			if (episode.id == game.unlockEpisodeId) {
				unlockEpisodeName = episode.name;
				break;
			}
		}
		return "Complete '" + unlockEpisodeName + "' to unlock this Episode!";
	}
}

LetiFramework.GameController.fetchGameSteps = function() {
	var path = "assets/stories/" + this.currentGame.storyId + '/episodes/' + this.currentGame.id + "/content/story_data.json";
	jQuery.getJSON(path, function(data) {
		LetiFramework.GameController.currentStoryData = data;
		LetiFramework.GameController.fetchComponents();
	}).error(function() {});
}

LetiFramework.GameController.fetchComponents = function() {
	var path = "assets/stories/" + this.currentGame.storyId + '/episodes/' + this.currentGame.id + "/content/components.json";
	jQuery.getJSON(path, function(data) {
		LetiFramework.GameController.currentStoryComponents = data;
		LetiFramework.GameController.fetchBadges();
	}).error(function() {
		alert("Error fetching components!");
	});
}

LetiFramework.GameController.fetchBadges = function() {
	var path = "assets/stories/" + this.currentGame.storyId + '/episodes/' + this.currentGame.id + "/content/badges.json";
	jQuery.getJSON(path, function(data) {
		LetiFramework.GameController.currentStoryBadges = data;
		LetiFramework.GameController.fetchQuiz();
	}).error(function() {
		alert("Error fetching badges!");
	});
}

LetiFramework.GameController.fetchQuiz = function() {
	var path = "assets/stories/" + this.currentGame.storyId + '/episodes/' + this.currentGame.id + "/content/quiz.json";
	jQuery.getJSON(path, function(data) {
		LetiFramework.GameController.currentStoryQuiz = data;
		if (LetiFramework.GameController.resume) {
			LetiFramework.GameController.resumeGame();
		} else {
			LetiFramework.GameController.startGame();
		}
	}).error(function() {
		alert("Error fetching quiz!");
	});
}

LetiFramework.GameController.showView = function(view) {
	LetiFramework.Renderer.render(view);
}

LetiFramework.GameController.transitionView = function(view) {
	LetiFramework.Renderer.transitionRender(view);
}

LetiFramework.GameController.startGame = function() {
	var pageParam = this.gup("page");

	this.currentGamePage = pageParam || this.currentStoryData.first_page;
	this.pageHistory = [];
	this.gameStarted = true;
	this.gameCompleted = false;
	this.currentGamePageData = null;

	if (this.currentUserGameLocation == null) {
		this.currentUserGameLocation = new LetiFramework.DbEntities.UserGameLocation(
			this.currentUser.id, this.currentGame.id, this.currentGamePage);
		LetiFramework.Db.create("user_game_location", this.currentUserGameLocation);
	} else {
		this.currentUserGameLocation.play_history = [];
		this.updateUserGameLocation();
	}

	if (LetiFramework.GameController.gup("d")) {
		this.debugging = this.gup("d") == 't' ? true : false;
	}

	this.showPage();
}

LetiFramework.GameController.resumeGame = function() {
	this.resume = false;
	this.gameStarted = true;
	this.gameCompleted = false;

	if (this.currentUserGameLocation == null) {
		this.currentGamePage = this.currentStoryData.first_page;
		this.currentUserGameLocation = new LetiFramework.DbEntities.UserGameLocation(
			this.currentUser.id, this.currentGame.id, currentGamePage);
		LetiFramework.Db.create("user_game_location", this.currentUserGameLocation);
	} else {
		this.currentGamePage = this.currentUserGameLocation.game_step;
	}

	this.showPage();
}

LetiFramework.GameController.previousPage = function() {
	if (this.gameStarted) {
		if (this.pageHistory.length > 1) {
			this.currentGamePage = this.pageHistory[this.pageHistory.length - 2];
			this.pageHistory.splice(this.pageHistory.length - 2, 2);
			this.showPage(true);
		} else {
			this.pageHistory = [];
			this.gameStarted = false;
			this.showView("Title");
		}
	}
}

LetiFramework.GameController.nextPage = function() {
	if (this.gameStarted) {
		if (this.nextGamePage) {
			if (this.nextGamePage == "prev_page") {
				this.previousPage();
			} else if (this.nextGamePage == "nextchapter") {
				var games = this.currentStory.episodes;
				games.sort(function(a, b) {
					return a.displayOrder - b.displayOrder;
				});
				var idx = games.indexOf(this.currentGame) + 1;
				if (idx > 0 && idx < games.length) {
					this.initializeGame(games[idx], true);
				} else {
					LetiFramework.Renderer.render("Menu");
				}
			} else if(this.nextGamePage == "mainmenu") {
				LetiFramework.Renderer.render("Menu");
			} else {
				this.currentGamePage = this.nextGamePage;
				this.currentGamePageDataOverride = this.nextGamePageDataOverride;
				this.nextGamePage = null;
				this.showPage(true);
			}
		} else {
			this.gameStarted = false;
			this.gameCompleted = true;
			this.showView("Title");
		}
	}
}

LetiFramework.GameController.showPage = function(updateLocation) {
	var rs = jsonsql.query("select * from LetiFramework.GameController.currentStoryData.pages where (page=='" +
		this.currentGamePage + "')", LetiFramework.GameController.currentStoryData.pages);

	if (rs.length > 0) {
		var prevGamePageData = this.currentGamePageData;

		this.currentGamePageData = rs[0];

		this.nextGamePage = this.currentGamePageData.next_page;

		this.nextGamePageDataOverride = this.currentGamePageData.next_page_override;

		var pageType = this.currentGamePageData.type;

		while (pageType == "page_redirect") {
			pageType = this.pageRedirect();
		}

		var page = null;

		if (pageType == "narration") {
			page = LetiFramework.Ui.narration;
		} else if (pageType == "narration2") {
			page = LetiFramework.Ui.narration2;
		} else if (pageType == "quiz") {
			page = LetiFramework.Ui.quiz;
		} else if (pageType == "dialogue") {
			page = LetiFramework.Ui.dialogue;
		} else if (pageType == "singlechoice" || pageType == "multichoice") {
			page = LetiFramework.Ui.choice;
		} else if (pageType == "decision") {
			page = LetiFramework.Ui.decision;
		} else if (pageType == "activity") {
			page = LetiFramework.Ui.activity;
		} else if (pageType == "advice") {
			page = LetiFramework.Ui.advice;
		} else if (pageType == "video") {
			page = LetiFramework.Ui.video;
		} else if (pageType == "blank") {
			page = LetiFramework.Ui.blank;
		}

		if (page) {
			if (this.currentGamePageDataOverride) {
				var overriden = {};

				for (var k in this.currentGamePageData) {
					overriden[k] = this.currentGamePageData[k];
				}

				for (var k in this.currentGamePageDataOverride) {
					overriden[k] = this.currentGamePageDataOverride[k];
				}

				this.currentGamePageData = overriden;

				this.nextGamePage = this.currentGamePageData.next_page;

				this.nextGamePageDataOverride = this.currentGamePageData.next_page_override;
			}

			this.pageHistory.push(this.currentGamePage);
			LetiFramework.Renderer.addState(this.currentGamePage, page);
			if (prevGamePageData && prevGamePageData.type != "video" && prevGamePageData.transition.animation) {
				LetiFramework.Renderer.configTransitionAnim(prevGamePageData.transition.animation);
				LetiFramework.Renderer.transitionRender("GameState" + LetiFramework.GameController.currentGamePage);
			} else {
				LetiFramework.Renderer.render("GameState" + LetiFramework.GameController.currentGamePage);
			}
			if(updateLocation) this.updateUserGameLocation();
			if (this.currentGamePageData.story_end) {				
				this.updateUserGameCompleted();
			}
		} else {
			//alert("Unable to render page type " + pageType);
			this.showView("Menu");
		}
	} else {
		alert("Page '" + this.currentGamePage + "'' not available");
	}
}

LetiFramework.GameController.pageRedirect = function() {
	var redirectPage = this.currentGamePageData.next_page;

	this.currentGamePageDataOverride = this.currentGamePageData.next_page_override;

	this.nextGamePageDataOverride = null;

	if (this.currentGamePageData.metric == "score") {
		var score = 0;
		var completed = false;
		var eval = this.currentGamePageData.evaluate;
		var conditions = this.currentGamePageData.conditions;

		for (var i = 0; i < eval.length; i++) {
			var userScores = LetiFramework.Db.readByKeysAndValues("scores", ["user_id", "game_id", "activity"], [this.currentUser.id, this.currentGame.id, eval[i]]);

			if (userScores.length > 0) {
				score += userScores[userScores.length - 1].score;
			}

			var activityCompleted = false;
			for (var j in userScores) {
				if (userScores[j].completed) {
					activityCompleted = true;
					break;
				}
			}

			i == 0 ? completed = activityCompleted : completed &= activityCompleted;
		}

		// if nothing in the evaluate array then we evaluate the user's score
		if (eval.length == 0) {
			score = this.currentUser.points;
		}

		for (var i = 0; i < conditions.length; i++) {
			var condition = conditions[i];
			var operator = condition.condition;
			var redirect =
				(operator == "<=" && (score < condition.value || score == condition.value)) ||
				((operator == "==" || operator == "=") && score == condition.value) ||
				(operator == ">=" && (score > condition.value || score == condition.value)) ||
				(operator == "<" && score < condition.value) ||
				(operator == ">" && score > condition.value);

			if (condition.completed) redirect &= completed;

			if (redirect) {
				redirectPage = condition.next_page || redirectPage;
				this.currentGamePageDataOverride = condition.next_page_override || this.currentGamePageDataOverride;
				break;
			}
		}
	} else if (LetiFramework.App.isPhoneGap() && this.currentGamePageData.metric == "version") {
		var conditions = this.currentGamePageData.conditions;
		for (var i = 0; i < conditions.length; i++) {
			var condition = conditions[i];
			var redirect = false;

			for (var j = 0; j < condition.versions.length; j++) {
				var version = condition.versions[j];
				redirect = device.platform == condition.platform && device.version.indexOf(version) === 0;
				if (redirect) break;
			}

			if (redirect) {
				redirectPage = condition.next_page || redirectPage;
				this.currentGamePageDataOverride = condition.next_page_override || this.currentGamePageDataOverride;
				break;
			}
		}
	} else if (this.currentGamePageData.metric == "selection") {
		var eval = this.currentGamePageData.evaluate;
		var conditions = this.currentGamePageData.conditions;

		var rs = LetiFramework.Db.readByKeysAndValues(
			"user_game_play", ["user_id", "game_id", "game_step"], [this.currentUser.id, this.currentGame.id, eval]);

		if (rs.length > 0) {
			var selection = rs[rs.length - 1].selection;

			for (var i = 0; i < conditions.length; i++) {
				var condition = conditions[i];
				var redirect = true;

				for (var j = 0; j < condition.value.length; j++) {
					redirect &= $.inArray(condition.value[j], selection) != -1;
				}

				if (redirect) {
					redirectPage = condition.next_page || redirectPage;
					this.currentGamePageDataOverride = condition.next_page_override || this.currentGamePageDataOverride;
					break;
				}
			}
		}
	} else if (this.currentGamePageData.metric == "earned_badge") {
		var alreadyEarnedBadge = LetiFramework.Db.readByKeysAndValues("badges", ["user_id", "badge_id", "story_id", "episode_id"], [this.currentUser.id, this.currentGamePageData.badge, this.currentGame.storyId, this.currentGame.id]).length > 0;
		if (alreadyEarnedBadge) {
			redirectPage = this.currentGamePageData.next_page_earned || redirectPage;
		}
	}

	if (redirectPage && redirectPage.length > 0) {
		this.currentGamePage = redirectPage;
		rs = jsonsql.query("select * from LetiFramework.GameController.currentStoryData.pages where (page=='" +
			this.currentGamePage + "')", LetiFramework.GameController.currentStoryData.pages);
		if (rs.length > 0) {
			this.currentGamePageData = rs[0];
			this.nextGamePage = this.currentGamePageData.next_page;
			return this.currentGamePageData.type;
		}
	}

	return null;
}

LetiFramework.GameController.resumeActivity = function() {
	LetiFramework.Renderer.addState(LetiFramework.GameController.currentGamePage, LetiFramework.Ui.activity);
	// LetiFramework.Renderer.render("GameState" + LetiFramework.GameController.currentGamePage);
	LetiFramework.GameController.fetchGameSteps();
}

LetiFramework.GameController.updateUserGameLocation = function() {
	if (this.currentUserGameLocation) {		
		LetiFramework.Analytics.trackEvent("Title", "Current Page", {story: this.currentGame.name, page: this.currentGamePage}, 0);
		this.currentUserGameLocation.game_step = this.currentGamePage;
		this.currentUserGameLocation.play_history.push(this.currentGamePage);
		LetiFramework.Db.update("user_game_location", this.currentUserGameLocation);
	}
}

LetiFramework.GameController.updateUserGameCompleted = function() {
	var completedEpisode = LetiFramework.Db.readByKeysAndValues("completed_episode", ["userId", "storyId", "episodeId"], [this.currentUser.id, this.currentStory.id, this.currentGame.id]);
	if (completedEpisode.length == 0) {
		LetiFramework.Analytics.trackEvent("Title", "Completed", this.currentGame.name, 0);
		completedEpisode = new LetiFramework.DbEntities.CompletedEpisode(
			this.currentUser.id, this.currentStory.id, this.currentGame.id);
		LetiFramework.Db.create("completed_episode", completedEpisode);
	}
}

LetiFramework.GameController.isGameUnlocked = function(game) {
	var unlocked = true;
	if (game.unlockEpisodeId != null && game.unlockEpisodeId > 0) {
		var completedEpisode = LetiFramework.Db.readByKeysAndValues("completed_episode", ["userId", "storyId", "episodeId"], [this.currentUser.id, this.currentStory.id, game.unlockEpisodeId]);
		unlocked = completedEpisode.length > 0;
	}
	return unlocked;
}

LetiFramework.GameController.gup = function(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results == null)
		return null;
	else
		return results[1];
}