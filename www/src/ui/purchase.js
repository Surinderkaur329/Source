var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.purchase = function(game) {}

LetiFramework.Ui.purchase.prototype = {
    init: function() {
        LetiFramework.Analytics.trackPage("Purchase");
        this.currentUser = LetiFramework.GameController.currentUser;
        this.screenConfig = LetiFramework.GameController.screensConfig.purchase;
        this.purchaseConfig = LetiFramework.GameController.purchaseConfig;
    },
    preload: function() {
        if(!LetiFramework.App.isPhoneGap() && LetiFramework.GameController.bootConfig.web_version) return;
        LetiFramework.Utils.loadImage(this.screenConfig.background);
        LetiFramework.Utils.loadImage(this.screenConfig.home_button.image);
        LetiFramework.Utils.loadImage(this.screenConfig.panel.image);
        LetiFramework.Utils.loadImage(this.screenConfig.container.image);
        LetiFramework.Utils.loadImage(this.screenConfig.sold.image);
        if (!LetiFramework.App.isPhoneGap()) {
            this.loadAudio(this.screenConfig.audio);
        }
        this.soundPath = this.getSoundPath(this.screenConfig.audio);

        if (this.screenConfig.title.custom_font) {
            LetiFramework.Utils.loadFont(this.screenConfig.title.custom_font);
        }

        if (this.screenConfig.price.custom_font) {
            LetiFramework.Utils.loadFont(this.screenConfig.price.custom_font);
        }
    },
    create: function() {
        this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 
            LetiFramework.Utils.getImagePath(this.screenConfig.background));
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

        this.panel = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 
            LetiFramework.Utils.getImagePath(this.screenConfig.panel.image));
        this.panel.anchor.set(0.5, 0.5);
        this.panel.scale.setTo(0.7 * LetiFramework.Renderer.width / this.bg.width, 0.7 * LetiFramework.Renderer.height / this.bg.height);
        
        this.container = this.panel.addChild (this.game.add.sprite(0, 0, 
            LetiFramework.Utils.getImagePath(this.screenConfig.container.image)));
        this.container.anchor.set(0.5, 0.5);

        var titleArea = this.screenConfig.title;

        var customFont = titleArea.custom_font;
        if (customFont) {
            var text = LetiFramework.Utils.wrapText(titleArea.text, customFont);
            var title = this.container.addChild (this.game.add.bitmapText(titleArea.position.x, titleArea.position.y,
                LetiFramework.Utils.getFontPath(customFont), text, customFont.font_size));
            title.anchor.set(0.5);
        } else {
            var title = this.container.addChild (this.game.add.text(titleArea.position.x, titleArea.position.y,
                titleArea.text, titleArea.text_style));
            title.anchor.set(0.5);
        }

        var priceArea = this.screenConfig.price;

        var customFont = priceArea.custom_font;
        if (customFont) {
            var text = LetiFramework.Utils.wrapText(priceArea.text, customFont);
            var price = this.container.addChild (this.game.add.bitmapText(priceArea.position.x, priceArea.position.y,
                LetiFramework.Utils.getFontPath(customFont), text, customFont.font_size));
            price.anchor.set(0.5);
        } else {
            var price = this.container.addChild (this.game.add.text(priceArea.position.x, priceArea.position.y,
                priceArea.text, priceArea.text_style));
            price.anchor.set(0.5);
        }

        this.sold = this.panel.addChild (this.game.add.sprite(this.screenConfig.sold.position.x, this.screenConfig.sold.position.y, 
            LetiFramework.Utils.getImagePath(this.screenConfig.sold.image)));
        this.sold.anchor.set(0.5, 0.5);
        this.sold.visible = false;

        var soldArea = this.screenConfig.soldText;

        var customFont = soldArea.custom_font;
        if (customFont) {
            var text = LetiFramework.Utils.wrapText(soldArea.text, customFont);
            var price = this.sold.addChild (this.game.add.bitmapText(soldArea.position.x, soldArea.position.y,
                LetiFramework.Utils.getFontPath(customFont), text, customFont.font_size));
            price.anchor.set(0.5);
        } else {
            var soldText = this.sold.addChild (this.game.add.text(soldArea.position.x, soldArea.position.y,
                soldArea.text, soldArea.text_style));
                soldText.anchor.set(0.5);
        }

        var homeBtPosition = this.screenConfig.home_button.position;
        this.homeBt = this.game.add.button(homeBtPosition.x, homeBtPosition.y, 
            LetiFramework.Utils.getImagePath(this.screenConfig.home_button.image), function() {
            LetiFramework.Analytics.trackEvent("Purchase", "Button Click", "Home", 0);
            LetiFramework.Renderer.render("Menu");
            
            if (this.divCont) {
                this.toggleGooglePayButton (false);
            }
            
        }, this, 2, 1, 0);
        this.homeBt.input.useHandCursor = true;

        if (LetiFramework.App.isPhoneGap()) {
            this.music = LetiFramework.SoundManager.getSound(this.soundPath, false);
        } else {
            if(this.screenConfig.audio && this.screenConfig.audio != ""){
                this.music = this.game.add.audio(this.getSoundPath(this.screenConfig.audio));
            }

            if (!this.hasPurchased()) {
                if (this.divCont) {
                    this.toggleGooglePayButton (true);
                } else {
                    this.createGooglePayButton ();
                }
            } else {
                this.sold.visible = true;
            }
        }

        if (LetiFramework.SoundManager.soundOn) {
            if(this.music){
                this.music.play();
            }
        }
    },
    shutdown: function() {
        if(this.music){
            this.music.destroy();
        }
    },
    getSoundPath: function(name) {
        return "assets/sound/" + name;
    },
    loadAudio: function(name) {
        if(name){
            var key = this.getSoundPath(name);
            this.game.load.audio(key, key);
        }
    },

    toggleGooglePayButton: function (bool) {
        if (bool) {
            this.divCont.style.display = "block";
        } else {
            this.divCont.style.display = "none";
        }
    },

    createGooglePayButton: function () {
        this.attempts = 0;
        this.gpConfig = this.purchaseConfig.googlePay;

        // append google pay script
        var tag = document.createElement('script');
        tag.src = "https://pay.google.com/gp/p/js/pay.js";
        tag.onload = this.onGooglePayLoaded.bind(this);
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // create and append div container for google pay button
        this.divCont = window.document.createElement ('div');
        this.divCont.id = "google-pay-button-container";
        this.divCont.style.position = "absolute";
        document.body.appendChild(this.divCont);

        // adjust div size relative to game size
        this.game.scale.setResizeCallback(this.onresize, this);
		this.game.scale.onSizeChange.add(this.onresize, this);

        this.onresize ();

        // google pay properties
        this.baseRequest = {
            apiVersion: this.gpConfig.apiVersion,
            apiVersionMinor: this.gpConfig.apiVersionMinor,
        };

        this.tokenizationSpecification = this.gpConfig.tokenizationSpecification;        
        this.baseCardPaymentMethod = this.gpConfig.baseCardPaymentMethod;
        this.cardPaymentMethods = Object.assign (
            {},
            this.baseCardPaymentMethod,
            {
                tokenizationSpecification: this.tokenizationSpecification
            }
        )
    },

    getGoogleIsReadyToPayRequest: function () {
        return Object.assign (
            {},
            this.baseRequest,
            {
                allowedPaymentMethods: [this.baseCardPaymentMethod]
            }
        )
    },

    getGooglePaymentsClient: function () {
        if (this.paymentsClient == null) {
            this.paymentsClient = new google.payments.api.PaymentsClient ({
                environment: this.gpConfig.environment,
                paymentDataCallbacks: {
                    onPaymentAuthorized: this.onPaymentAuthorized.bind(this)
                }
            });
        }

        return this.paymentsClient;
    },

    onGooglePayLoaded: function () {
        this.paymentsClient = this.getGooglePaymentsClient ();

        this.paymentsClient.isReadyToPay (this.getGoogleIsReadyToPayRequest())
            .then (function (response) {
                if (response.result) {
                    this.addGooglePayButton ();
                }
            }.bind(this))
            .catch (function (err) {
                console.error (err);
            })
    },

    addGooglePayButton: function () {
        this.googlePayButton = this.paymentsClient.createButton ({
            onClick: this.onGooglePayButton.bind(this),
            buttonColor: this.gpConfig.button.color,
            buttonType: this.gpConfig.button.type,
            buttonSizeMode: this.gpConfig.button.size
        });
        this.divCont.appendChild (this.googlePayButton);
    },

    getGoogleTransactionInfo: function () {
        return {
            totalPriceStatus: this.gpConfig.transactionInfo.totalPriceStatus,
            totalPriceLabel: this.gpConfig.transactionInfo.totalPriceLabel,
            totalPrice: this.gpConfig.transactionInfo.totalPrice,
            currencyCode: this.gpConfig.transactionInfo.currencyCode,
            countryCode: this.gpConfig.transactionInfo.countryCode
        };
    },

    getGooglePaymentDataRequest: function () {
        var paymentDataRequest = Object.assign ({}, this.baseRequest);
        paymentDataRequest.allowedPaymentMethods = [this.cardPaymentMethods];
        paymentDataRequest.transactionInfo = this.getGoogleTransactionInfo ();
        paymentDataRequest.merchantInfo = {
            merchantName: this.gpConfig.merchant.name,
            merchantId: this.gpConfig.merchant.id
        };

        paymentDataRequest.callbackIntents = ["PAYMENT_AUTHORIZATION"];

        return paymentDataRequest;
    },

    onGooglePayButton: function () {
        var paymentDataRequest = this.getGooglePaymentDataRequest ();
        
        this.paymentsClient.loadPaymentData (paymentDataRequest);
    },

    processPayment: function (paymentData) {
        return new Promise (function (resolve, reject) {
            setTimeout (function () {
                var paymentToken = paymentData.paymentMethodData.tokenizationData.token;
                
                // console.log (paymentToken);

                // TO DO: insert game's response (save token to localstorage, create token verification to use for unlocking other levels of the game)
                if (paymentToken) {
                    this.savePurchase (paymentToken);

                    this.toggleGooglePayButton ();
    
                    this.sold.visible = true;
                }

                if (this.attempts++ % 2 == 0) {
                    reject (new Error ("Every other attempt fails, next one should succeed"));
                } else {
                    resolve ({});
                }
            }.bind(this), 500)
        }.bind (this));
    },

    onPaymentAuthorized: function (paymentData) {
        return new Promise (function (resolve, reject) {
            this.processPayment (paymentData)
                .then (function () {
                    resolve ({transactionState: 'SUCCESS'});
                })
                .catch (function () {
                    resolve ({
                        transactionState: 'ERROR',
                        error: {
                            intent: 'PAYMENT_AUTHORIZATION',
                            message: 'Insufficient funds, try again.',
                            reason: "PAYMENT_DATA_INVALID"
                        }
                    });
                });
        }.bind(this));
    },

    onresize: function () {
        var scaleManager = LetiFramework.Renderer.game.scale;
        var divWidth = 0.25 * scaleManager.width;
        var divHeight = 0.12 * scaleManager.height;
        this.divCont.style.width = divWidth + 'px';
        this.divCont.style.height = divHeight + 'px';
        this.divCont.style.left = (scaleManager.bounds.x + scaleManager.width * 0.5) + 'px';
        this.divCont.style.top = (scaleManager.bounds.y + scaleManager.height * 0.44) + 'px';
    },

    savePurchase: function (token) {
        window.localStorage.setItem("purchaseToken", token);
    },

    hasPurchased: function () {
        var token = window.localStorage.getItem("purchaseToken");
        
        return token != null;
    }
}