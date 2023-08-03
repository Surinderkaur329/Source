PurchasePopup = function (game) {
    this.game = game;
    Phaser.Sprite.call (this, game, 0, 0);

    console.log ("purchase popup created");

    this.init ();

    game.add.existing (this);
}

PurchasePopup.prototype.constructor = PurchasePopup;
PurchasePopup.prototype = Object.assign (Object.create (Phaser.Sprite.prototype), {
    init: function () {
        if (this.overlay == null) {
            this.overlay = this.addChild (game.add.graphics(0, 0));
            this.overlay.beginFill(0x000000, 0.5);
            this.overlay.drawRect (0, 0, game.width, game.height);
            this.overlay.endFill ();
        }

        this.panel = this.addChild (this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "purchase"));
        this.panel.anchor.set(0.5, 0.5);
        this.panel.scale.setTo(0.7 * this.game.width / this.overlay.width, 0.7 * this.game.height / this.overlay.height);

        this.container = this.panel.addChild (this.game.add.sprite(0, 0, 'purchaseContainer'));
        this.container.anchor.set(0.5, 0.5);

        var titleArea = this.game.screensConfig.title;

        var title = this.container.addChild (this.game.add.text(titleArea.position.x, titleArea.position.y, titleArea.text, titleArea.text_style));
        title.anchor.set(0.5);

        var priceArea = this.game.screensConfig.price;

        var price = this.container.addChild (this.game.add.text(priceArea.position.x, priceArea.position.y, priceArea.text, priceArea.text_style));
        price.anchor.set(0.5);

        var homeBtPosition = this.game.screensConfig.home_button.position;
        this.backBt = this.addChild (this.game.add.button(homeBtPosition.x, homeBtPosition.y, 'back', function() {
            this.hide ();
        }, this, 2, 1, 0));
        this.backBt.input.useHandCursor = true;
    },
    
    show: function () {
        // console.log ("showing purchase popup");

        this.visible = true;

        if (this.divCont) {
            this.toggleGooglePayButton (true);
        } else {
            this.createGooglePayButton ();
        }
    },

    hide: function () {
        // console.log ("hiding purchase popup");

        this.visible = false;

        this.game.levelPaused = false;
        this.game.state.getCurrentState().onResume ();

        if (this.divCont) {
            this.toggleGooglePayButton (false);
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
        this.gpConfig = this.game.purchaseConfig.googlePay;

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
      if(localStorage.purchaseToken=="1")
                                {
                                this.hide ();
                                }
                                else
                                {
                                window.location="purchase.html";
                                }
    },

    processPayment: function (paymentData) {
        return new Promise (function (resolve, reject) {
            setTimeout (function () {
                var paymentToken = paymentData.paymentMethodData.tokenizationData.token;

                // TO DO: insert game's response (save token to localstorage, create token verification to use for unlocking other levels of the game)

                if (paymentToken) {
                    this.savePurchase (paymentToken);

                    this.hide ();
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
        var scaleManager = this.game.scale;
        var divWidth = 0.25 * scaleManager.width;
        var divHeight = 0.12 * scaleManager.height;
        this.divCont.style.width = divWidth + 'px';
        this.divCont.style.height = divHeight + 'px';
        this.divCont.style.left = (scaleManager.bounds.x + scaleManager.width * 0.5) + 'px';
        this.divCont.style.top = (scaleManager.bounds.y + scaleManager.height * 0.44) + 'px';
    },

    savePurchase: function (token) {
        window.localStorage.setItem("purchaseToken", token);
    }
});


