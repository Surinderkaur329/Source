var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.splash = function(game) {};

LetiFramework.Ui.splash.prototype = {
  init: function() {
    LetiFramework.Analytics.trackPage("Splash");
    this.screenConfig = LetiFramework.GameController.bootConfig[LetiFramework.GameController.bootScreen];
    this.downloadCount = 0;
    this.downloadedCount = 0;
  },
  preload: function() {
    if (!LetiFramework.App.isPhoneGap() && LetiFramework.GameController.bootConfig.web_version) return;
    LetiFramework.Utils.loadImage(this.screenConfig.background);
  },
  create: function() {
    this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, LetiFramework.Utils.getImagePath(this.screenConfig.background));
    this.bg.anchor.set(0.5);
    this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

    if (LetiFramework.App.isPhoneGap() && !LetiFramework.GameController.bootConfig.local_content) {
      var progressBar = this.screenConfig.progress.bar;
      this.preloadBar = this.game.add.graphics(progressBar.position.x, progressBar.position.y);
      this.preloadBar.lineStyle(progressBar.height, progressBar.color, progressBar.alpha);
      this.preloadBar.moveTo(0, 0);
      this.preloadBar.lineTo(progressBar.width, 0);
      this.preloadBar.scale.x = 0; // set the bar to the beginning position

      var progressText = this.screenConfig.progress.text;
      this.preloadText = this.game.add.text(progressText.position.x, progressText.position.y,
        "Downloading Content...", progressText.style);
      this.preloadText.anchor.set(0.5);
      this.preloadText.visible = false;

      this.errorText = this.game.add.text(progressText.position.x, progressText.position.y,
        "Error! Please check your internet connection.", progressText.err_style);
      this.errorText.anchor.set(0.5);
      this.errorText.visible = false;

      var storiesFile = LetiFramework.FileManager.getStoriesFilePath();
      this.startTime = new Date().getTime();
      var self = this;

      LetiFramework.NetworkManager.getRequest(
        "StoriesJsonServlet?id=" + LetiFramework.NetworkManager.appId, null,
        function(data) {
          data = JSON.parse(data);
          stores.set("stories.json", data);
          self.downloadCoverImages(self, data);
        },
        function() {
          var data = stores.get("stories.json");
          if (data) {
            self.downloadCoverImages(self, data);
          } else {
            self.errorText.visible = true;
            self.game.add.tween(self.errorText).from({
              y: 720
            }, 750, Phaser.Easing.Elastic.Out, true);
            LetiFramework.App.removeOnBackKeyDown();
          }
        });
    } else {
      var self = this;
      setTimeout(function() {
        LetiFramework.GameController.bootScreen = self.screenConfig.next_screen;
        LetiFramework.GameController.bootSequence();
      }, 1500);
    }

      //
      window.localStorage.setItem("standalone","1");
      window.localStorage.setItem("standalone_game_type", 'luminous');

      $.get(LetiFramework.NetworkManager.getHottseatBrandById(LetiFramework.NetworkManager.hottseatId)).done(function (response) {
          window.localStorage.setItem('brand',JSON.stringify(response));
      });
      $.get(LetiFramework.NetworkManager.getPrizesByBrand(LetiFramework.NetworkManager.hottseatId)).done(function (response) {
          window.localStorage.setItem('prizes',JSON.stringify(response))
      })
      $.get(LetiFramework.NetworkManager.getThemesByBrand(LetiFramework.NetworkManager.hottseatId)).done(function (response) {
          window.localStorage.setItem('theme',JSON.stringify(response));
      })
      $.get(LetiFramework.NetworkManager.getAdsByBrand(LetiFramework.NetworkManager.hottseatId)).done(function (response) {
          window.localStorage.setItem('ads',JSON.stringify(response));
          console.log('ad');
      })
  },
  downloadCoverImages: function(self, data) {
      self.downloadCount = data.length;
      self.downloadedCount = 0;

      for (var i = 0; i < data.length; i++) {
        (function(story) {
          var id = story.id;
          var cover = story.cover;
          var episodes = story.episodes;
          var episodesCount = episodes.length;
          var storyCoverFile = LetiFramework.FileManager.getStoryCoverPath(id, cover);

          self.downloadCount += episodesCount;

          window.resolveLocalFileSystemURL(storyCoverFile,
            function(fileEntry) {
              setTimeout(function() {
                self.gotCoverImage(fileEntry);
              }, 200);
            },
            function() {
              var serverUrl = LetiFramework.NetworkManager.getStoryCoverURL(id);
              var localUrl = storyCoverFile;
              setTimeout(function() {
                self.downloadCoverImage(id, serverUrl, localUrl);
              }, 200);
            });

          for (var j = 0; j < episodesCount; j++) {
            (function(episode) {
              var id = episode.id;
              var storyId = episode.storyId;
              var cover = episode.cover;
              var episodeCoverFile = LetiFramework.FileManager.getEpisodeCoverPath(storyId, id, cover);

              window.resolveLocalFileSystemURL(episodeCoverFile,
                function(fileEntry) {
                  setTimeout(function() {
                    self.gotCoverImage(fileEntry);
                  }, 200);
                },
                function() {
                  var serverUrl = LetiFramework.NetworkManager.getEpisodeCoverURL(id);
                  var localUrl = episodeCoverFile;
                  setTimeout(function() {
                    self.downloadCoverImage(id, serverUrl, localUrl);
                  }, 200);
                });
            })(episodes[j]);
          }
        })(data[i]);
      }
    },
    downloadCoverImage: function(id, serverUrl, localUrl) {
    this.preloadText.visible = true;
    var self = this;
    LetiFramework.NetworkManager.downloadFile(
      serverUrl, localUrl,
      function(fileEntry) {
        self.gotCoverImage(fileEntry);
      },
      function() {
        self.preloadText.visible = false;
        self.errorText.visible = true;
        self.preloadBar.alpha = 0;
        LetiFramework.App.removeOnBackKeyDown();
      },
      function(progressEvent) {
        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
        self.preloadText.text = "Downloading Content (" +
          (self.downloadedCount + 1) + "/" + self.downloadCount + ")... " + perc + "%";
        self.preloadBar.scale.x = perc * 0.01;
      });
  },
  gotCoverImage: function(fileEntry) {
    ++this.downloadedCount;
    if (this.downloadedCount == this.downloadCount) {
      var delay = 1500 - (new Date().getTime() - this.startTime);
      var self = this;
      setTimeout(function() {
        LetiFramework.GameController.bootScreen = self.screenConfig.next_screen;
        LetiFramework.GameController.bootSequence();
      }, (delay > 0 ? delay : 0));
    }
  },
  shutdown: function() {
    this.bg.destroy();
  }
  
  
  
  
}