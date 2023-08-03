var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.register3 = function(game) {}
// var config = {
//     apiKey: "AIzaSyDixxrTQvD9gc4mhaIE4ldXwgnX26yTH4g",
//     authDomain: "hello-nurse-3eb8b.firebaseapp.com",
//     databaseURL: "https://hello-nurse-3eb8b.firebaseio.com",
//     projectId: "hello-nurse-3eb8b",
//     storageBucket: "",
//     messagingSenderId: "992395970294"
// };
// firebase.initializeApp(config);
//
// var defaultDatabase = firebase.database();
// var AllUsers = [];
// var usersRef = defaultDatabase.ref().child('users');
// usersRef.on('value', function (snap) {
//     snap.forEach(function(childSnapshot) {
//         var childData = childSnapshot.val();
//         childData.id = childSnapshot.key;
//         AllUsers.push(childData);
//     });
// });

LetiFramework.Ui.register3.prototype = {
    init: function() {
        LetiFramework.Analytics.trackPage("Register");
        this.screenConfig = LetiFramework.GameController.bootConfig[LetiFramework.GameController.bootScreen];
        this.nicknameField = this.screenConfig.nickname_field;
        this.otherRegisterFields = this.screenConfig.other_register_fields;
        this.hiddenRegisterFields = this.screenConfig.hidden_register_fields;
        this.animScale = LetiFramework.Renderer.animScale;
        this.pageComponents = [];
        this.dialogueComponents = {};
        this.currentComponents = [];
        this.soundObjects = [];
        this.pageSprites = {};
        this.currentField = 1;
        if (LetiFramework.GameController.screenComponents && this.screenConfig.components) {
            this.pageComponents = LetiFramework.GameController.screenComponents[
                this.screenConfig.components];
        }

        if (this.nicknameField.components && LetiFramework.GameController.screenComponents) {
            var moreComponents = LetiFramework.GameController.screenComponents[this.nicknameField.components];
            this.dialogueComponents[this.nicknameField.components] = moreComponents;
        }

        for (var i = 0; i < this.otherRegisterFields.length; i++) {
            var dialogue = this.otherRegisterFields[i];
            if (dialogue.components && LetiFramework.GameController.screenComponents) {
                var moreComponents = LetiFramework.GameController.screenComponents[dialogue.components];
                this.dialogueComponents[dialogue.components] = moreComponents;
            }
        }
    },
    preload: function() {
        this.preloadSprites();
        if (!LetiFramework.App.isPhoneGap() && LetiFramework.GameController.bootConfig.web_version) return;
        LetiFramework.Utils.loadImage(this.screenConfig.background);

        if (this.screenConfig.next_button.type == "image") {
            LetiFramework.Utils.loadImage(this.screenConfig.next_button.image);
        }

        if (this.screenConfig.cancel_button.type == "image") {
            LetiFramework.Utils.loadImage(this.screenConfig.cancel_button.image);
        }

        if (this.screenConfig.register_button.type == "image") {
            LetiFramework.Utils.loadImage(this.screenConfig.register_button.image);
        }

        if (this.nicknameField.field.background.type == 'image') {
            LetiFramework.Utils.loadImage(this.nicknameField.field.background.image);
        }

        for (var i in this.otherRegisterFields) {
            if (this.otherRegisterFields[i].fields) {
                for (var j in this.otherRegisterFields[i].fields) {
                    this.preloadFields(this.otherRegisterFields[i].fields[j].field);
                }
            } else {
                this.preloadFields(this.otherRegisterFields[i].field);
            }
        }

        for (var i = 0; i < this.pageComponents.length; i++) {
            var cmp = this.pageComponents[i];
            if (cmp.image) {
                if (cmp.type == 'spritesheet') {
                    var path = LetiFramework.Utils.getImagePath(cmp.image);
                    this.game.load.spritesheet(path, path, cmp.frame_width, cmp.frame_height);
                } else {
                    LetiFramework.Utils.loadImage(cmp.image);
                }
            }

            if (cmp.interactivity && cmp.interactivity.audio) {
                if (!LetiFramework.App.isPhoneGap()) {
                    this.loadAudio(cmp.interactivity.audio);
                }
            }
        }

        for (var i in this.dialogueComponents) {
            var moreComponents = this.dialogueComponents[i];
            for (var j = 0; j < moreComponents.length; j++) {
                var cmp = moreComponents[j];
                if (cmp.image) {
                    if (cmp.type == 'spritesheet') {
                        var path = LetiFramework.Utils.getImagePath(cmp.image);
                        this.game.load.spritesheet(path, path, cmp.frame_width, cmp.frame_height);
                    } else {
                        LetiFramework.Utils.loadImage(cmp.image);
                    }
                }

                if (cmp.interactivity && cmp.interactivity.audio) {
                    if (!LetiFramework.App.isPhoneGap()) {
                        this.loadAudio(cmp.interactivity.audio);
                    }
                }
            }
        }

        if (!LetiFramework.App.isPhoneGap()) {
            this.loadAudio(this.screenConfig.audio);
        }
        this.soundPath = this.getSoundPath(this.screenConfig.audio);
    },
    preloadFields: function(field) {
        if (field.type == "choice") {
            LetiFramework.Utils.loadImage(field.selection_indicator.image);

            if (field.choices.type == "image") {
                for (var j in field.choices.images) {
                    var choice = field.choices.images[j];
                    LetiFramework.Utils.loadImage(choice.image);
                }
            } else {
                for (var j in field.choices.texts) {
                    var choice = field.choices.texts[j];
                    if (choice.background.type == "image") {
                        LetiFramework.Utils.loadImage(choice.background.image);
                    }
                }
            }
        } else if (field.type == "text") {
            if (field.background.type == "image") {
                LetiFramework.Utils.loadImage(field.background.image);
            }
        }
    },
    create: function() {
        this.scene = this.game.add.group();

        this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY,
            LetiFramework.Utils.getImagePath(this.screenConfig.background));
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);
        this.scene.add(this.bg);

        this.addComponents(this.pageComponents);

        this.enableDrag();
        window.localStorage.setItem("CurrentScreen","Register3");
        var input = stores.get("userInput");
        var inputType = stores.get("inputType");
        stores.remove("userInput");
        stores.remove("inputType");

        if (inputType) {
            if (input) {
                stores.set(inputType, input);
            } else {
                stores.remove(inputType);
            }

            if (inputType == "nickname") {
                this.currentField = 1;
            } else {
                for (var i = 0, found = false; i < this.otherRegisterFields.length && !found; i++) {
                    if (this.otherRegisterFields[i].fields) {
                        for (var j = 0; j < this.otherRegisterFields[i].fields.length; j++) {
                            if (inputType == this.otherRegisterFields[i].fields[j].name) {
                                found = true;
                                break;
                            }
                        }
                    } else if (inputType == this.otherRegisterFields[i].name) {
                        found = true;
                    }
                    this.currentField = i + 1;
                }
            }
        }
        this.currentField = 1;

        var nextBtConfig = this.screenConfig.next_button;
        if (nextBtConfig.type == "image") {
            this.nextBt = this.game.add.sprite(nextBtConfig.position.x, nextBtConfig.position.y, LetiFramework.Utils.getImagePath(nextBtConfig.image));
            this.nextBt.scale.setTo(nextBtConfig.width / this.nextBt.width, nextBtConfig.height / this.nextBt.height);
            this.nextBt.inputEnabled = true;
            this.nextBt.input.useHandCursor = true;
            this.nextBt.events.onInputDown.add(this.nextHandler, this);
        } else if (nextBtConfig.type == "button") {
            this.nextBt = new LetiFramework.Ui.Button(this.game, nextBtConfig.position.x, nextBtConfig.position.y, nextBtConfig.width,
                nextBtConfig.height, nextBtConfig.text, nextBtConfig.text_style, nextBtConfig.button_style,
                this.nextHandler, this);
        }

        var regBtConfig = this.screenConfig.register_button;
        if (regBtConfig.type == "image") {
            this.registerBt = this.game.add.sprite(regBtConfig.position.x, regBtConfig.position.y, LetiFramework.Utils.getImagePath(regBtConfig.image));
            this.registerBt.scale.setTo(regBtConfig.width / this.registerBt.width, regBtConfig.height / this.registerBt.height);
            this.registerBt.inputEnabled = true;
            this.registerBt.input.useHandCursor = true;
            this.registerBt.events.onInputDown.add(this.nextHandler, this);
        } else if (regBtConfig.type == "button") {
            this.registerBt = new LetiFramework.Ui.Button(this.game, regBtConfig.position.x, regBtConfig.position.y, regBtConfig.width,
                regBtConfig.height, regBtConfig.text, regBtConfig.text_style, regBtConfig.button_style,
                this.nextHandler, this);
        }

        var cancelBtConfig = this.screenConfig.cancel_button;
        if (cancelBtConfig.type == "image") {
            this.cancelBt = this.game.add.sprite(cancelBtConfig.position.x, cancelBtConfig.position.y, LetiFramework.Utils.getImagePath(cancelBtConfig.image));
            this.cancelBt.scale.setTo(cancelBtConfig.width / this.cancelBt.width, cancelBtConfig.height / this.cancelBt.height);
            this.cancelBt.inputEnabled = true;
            this.cancelBt.input.useHandCursor = true;
            this.cancelBt.events.onInputDown.add(this.cancelHandler, this);
        } else if (cancelBtConfig.type == "button") {
            this.cancelBt = new LetiFramework.Ui.Button(this.game, cancelBtConfig.position.x, cancelBtConfig.position.y, cancelBtConfig.width,
                cancelBtConfig.height, cancelBtConfig.text, cancelBtConfig.text_style, cancelBtConfig.button_style,
                this.cancelHandler, this);
        }

        this.showCurrentField();

        // this.nicknameField.field = window.localStorage.getItem("session");

        // var fieldConfig = this.otherRegisterFields[this.currentField - 1];

        if (LetiFramework.App.isPhoneGap()) {
            this.bgSound = LetiFramework.SoundManager.getSound(this.soundPath, false);
        } else {
            this.bgSound = this.game.add.audio(this.getSoundPath(this.screenConfig.audio));
        }

        this.soundObjects.push(this.bgSound);

        if (LetiFramework.SoundManager.soundOn) {
            this.bgSound.play();
        }
    },
    shutdown: function() {
        this.scene.destroy();
        if (this.currentFieldGroup) {
            this.currentFieldGroup.destroy();
        }
        for (var i = 0; i < this.soundObjects.length; i++) {
            this.soundObjects[i].destroy();
        }
    },
    isLastField: function() {
        return this.currentField == this.otherRegisterFields.length;
    },
    showCurrentField: function() {
        for (var i in this.currentComponents) {
            this.currentComponents[i].destroy();
        }
        this.currentComponents = [];

        if (this.registerBt.constructor == LetiFramework.Ui.Button) {
            this.isLastField() ? this.registerBt.show() : this.registerBt.hide();
        } else {
            this.registerBt.visible = this.isLastField();
        }

        if (this.nextBt.constructor == LetiFramework.Ui.Button) {
            this.isLastField() ? this.nextBt.hide() : this.nextBt.show();
        } else {
            this.nextBt.visible = !this.isLastField();
        }

        if (this.currentFieldGroup) {
            this.currentFieldGroup.destroy();
        }

        this.currentFieldGroup = this.game.add.group();
        //this.scene.add(this.currentFieldGroup);

        var currentFieldConfig = this.currentField == 0 ? this.nicknameField : this.otherRegisterFields[this.currentField - 1];

        if (currentFieldConfig.components) {
            this.addComponents(this.dialogueComponents[currentFieldConfig.components]);
            this.enableDrag();
        }

        if (currentFieldConfig.next_button_position) {
            this.setButtonPosition(this.nextBt, currentFieldConfig.next_button_position.x,
                currentFieldConfig.next_button_position.y);
        } else {
            this.setButtonPosition(this.nextBt, this.screenConfig.next_button.position.x,
                this.screenConfig.next_button.position.y);
        }

        if (currentFieldConfig.cancel_button_position) {
            this.setButtonPosition(this.cancelBt, currentFieldConfig.cancel_button_position.x,
                currentFieldConfig.cancel_button_position.y);
        } else {
            this.setButtonPosition(this.cancelBt, this.screenConfig.cancel_button.position.x,
                this.screenConfig.cancel_button.position.y);
        }

        if (currentFieldConfig.register_button_position) {
            this.setButtonPosition(this.registerBt, currentFieldConfig.register_button_position.x,
                currentFieldConfig.register_button_position.y);
        } else {
            this.setButtonPosition(this.registerBt, this.screenConfig.register_button.position.x,
                this.screenConfig.register_button.position.y);
        }

        var labelConfigs = [];
        var fieldConfigs = [];
        var fieldNames = [];

        if (currentFieldConfig.fields) {
            for (var i in currentFieldConfig.fields) {
                labelConfigs.push(currentFieldConfig.fields[i].label);
                fieldConfigs.push(currentFieldConfig.fields[i].field);
                fieldNames.push(currentFieldConfig.fields[i].name);
            }
        } else {
            labelConfigs.push(currentFieldConfig.label);
            fieldConfigs.push(currentFieldConfig.field);
            fieldNames.push(currentFieldConfig.name);
        }

        for (var i = 0; i < labelConfigs.length; i++) {
            var labelConfig = labelConfigs[i];
            var fieldConfig = fieldConfigs[i];
            var fieldName = fieldNames[i];

            var fieldLabel = this.game.add.text(labelConfig.position.x, labelConfig.position.y, labelConfig.text, labelConfig.text_style);

            this.currentFieldGroup.add(fieldLabel);

            if (this.currentField == 0 || fieldConfig.type == "text") {
                if (fieldConfig.background.type == "image") {
                    var fieldBg = this.game.add.sprite(fieldConfig.position.x, fieldConfig.position.y, LetiFramework.Utils.getImagePath(fieldConfig.background.image));
                    fieldBg.scale.setTo(fieldConfig.width / fieldBg.width, fieldConfig.height / fieldBg.height);
                    fieldBg.inputEnabled = true;
                    fieldBg.input.useHandCursor = true;
                    fieldBg.pos = i;
                    if (this.currentField == 0) {
                        fieldBg.events.onInputDown.add(this.nicknameHandler, this);
                    } else {
                        fieldBg.events.onInputDown.add(this.fieldLabelHandler, this);
                    }

                    this.currentFieldGroup.add(fieldBg);

                    var txt = this.currentField == 0 ? stores.get("nickname") : stores.get(currentFieldConfig.name || currentFieldConfig.fields[i].name);
                    if (txt == null) {
                        txt = "";
                    }
                    var fieldTxt = this.game.add.text(
                        fieldConfig.position.x, fieldConfig.position.y + 0.5 * fieldBg.height, txt, fieldConfig.text_style);
                    fieldTxt.x += fieldConfig.paddingLeft || 20;
                    fieldTxt.y -= 0.5 * fieldTxt.height;

                    this.currentFieldGroup.add(fieldTxt);

                    if (labelConfig.hint) {
                        this.currentFieldGroup.bringToTop(fieldLabel);
                        if (txt.length > 0) fieldLabel.visible = false;
                    }
                } else if (fieldConfig.background.type == "bgcolor") {
                    var self = this;
                    (function() {
                        var txt = self.currentField == 0 ? stores.get("nickname") : stores.get(currentFieldConfig.name || currentFieldConfig.fields[i].name);
                        if (txt == null) {
                            txt = "";
                        }
                        var fieldBg = new LetiFramework.Ui.Button(self.game, fieldConfig.position.x, fieldConfig.position.y,
                            fieldConfig.width, fieldConfig.height, txt, fieldConfig.text_style, fieldConfig.background.bgcolor,
                            self.currentField == 0 ? self.nicknameHandler : (function() {
                                self.fieldLabelHandler(fieldBg);
                            }), self);
                        fieldBg.pos = i;

                        fieldBg.alignText('left');

                        self.currentFieldGroup.add(fieldBg.buttonGroup);

                        if (labelConfig.hint) {
                            self.currentFieldGroup.bringToTop(fieldLabel);
                            if (txt.length > 0) fieldLabel.visible = false;
                        }
                    })();
                }
            } else if (fieldConfig.type == "choice") {
                this.selectionIndicators = [];
                this.highlightBgs = [];
                this.selectedChoices = [];
                this.selectedChoiceValues = [];

                var choices = fieldConfig.choices;
                var choiceType = choices.type;
                var selCount = fieldConfig.selection_count;

                if (fieldConfig.selection_indicator.type == "image") {
                    for (var i = 0; i < selCount; i++) {
                        var selIndic = this.game.add.sprite(0, 0, LetiFramework.Utils.getImagePath(fieldConfig.selection_indicator.image));
                        selIndic.scale.setTo(fieldConfig.selection_indicator.width / selIndic.width,
                            fieldConfig.selection_indicator.height / selIndic.height);
                        this.selectionIndicators.push(selIndic);
                        this.currentFieldGroup.add(selIndic);
                        selIndic.visible = false;
                    }
                }

                if (choiceType == "text") {
                    var choiceTextStyle = choices.text_style;

                    this.choiceBgs = [];

                    for (var i = 0; i < choices.texts.length; i++) {
                        var choice = choices.texts[i];

                        var choiceBg = choice.background;
                        if (choiceBg.type == "shape") {
                            var bg = this.game.add.graphics(choice.position.x, choice.position.y);
                            bg.beginFill(choiceBg.color, 1);
                            bg.alpha = choiceBg.alpha;
                            if (choiceBg.shape == "round_rect") {
                                bg.drawRoundedRect(0, 0, choiceBg.width, choiceBg.height, choiceBg.radius);
                            } else if (choiceBg.shape == "rect") {
                                bg.drawRect(0, 0, choiceBg.width, choiceBg.height);
                            }
                            bg.endFill();
                            bg.inputEnabled = true;
                            bg.input.useHandCursor = true;
                            bg.events.onInputDown.add(function() {
                                if (this.ctx.selectedChoices.indexOf(this.idx) > -1) {
                                    LetiFramework.Analytics.trackEvent("Register", "Choice Deselection", {
                                        field: fieldName,
                                        choice: this.value
                                    }, 0);
                                    this.ctx.selectedChoices.splice(this.ctx.selectedChoices.indexOf(this.idx), 1);
                                    this.ctx.selectedChoiceValues.splice(this.ctx.selectedChoices.indexOf(this.idx), 1);
                                    if (fieldConfig.selection_indicator.type == "image") {
                                        for (var j = 0; j < this.ctx.selectionIndicators.length; j++) {
                                            var indic = this.ctx.selectionIndicators[j];
                                            if (indic.visible && indic.idx == this.idx) {
                                                indic.visible = false;
                                                delete indic.idx;
                                                break;
                                            }
                                        }
                                    } else if (fieldConfig.selection_indicator.type == "highlight") {
                                        this.ctx.highlightBgs[this.idx].alpha = 0;
                                    }
                                } else {
                                    if (this.ctx.selectedChoices.length < selCount) {
                                        LetiFramework.Analytics.trackEvent("Register", "Choice Selection", {
                                            field: fieldName,
                                            choice: this.value
                                        }, 0);
                                        this.ctx.selectedChoices.push(this.idx);
                                        this.ctx.selectedChoiceValues.push(this.value);
                                        if (fieldConfig.selection_indicator.type == "image") {
                                            for (var j = 0; j < this.ctx.selectionIndicators.length; j++) {
                                                var indic = this.ctx.selectionIndicators[j];
                                                if (!indic.visible) {
                                                    indic.visible = true;
                                                    indic.idx = this.idx;
                                                    indic.x = this.ctx.choiceBgs[this.idx].x + this.bgWidth + 10;
                                                    indic.y = this.ctx.choiceBgs[this.idx].y;
                                                    break;
                                                }
                                            }
                                        } else if (fieldConfig.selection_indicator.type == "highlight") {
                                            this.ctx.highlightBgs[this.idx].alpha = 1;
                                        }
                                    }
                                }
                            }, {
                                ctx: this,
                                idx: i,
                                bgWidth: choiceBg.width,
                                value: choice.text
                            });

                            this.choiceBgs.push(bg);
                            this.currentFieldGroup.add(bg);
                            if (fieldConfig.selection_indicator.type == "highlight") {
                                var hBg = this.game.add.graphics(choice.position.x, choice.position.y);
                                hBg.beginFill(fieldConfig.selection_indicator.highlight.color, fieldConfig.selection_indicator.highlight.alpha);
                                hBg.alpha = 0;
                                if (choiceBg.shape == "round_rect") {
                                    hBg.drawRoundedRect(0, 0, choiceBg.width, choiceBg.height, choiceBg.radius);
                                } else if (choiceBg.shape == "rect") {
                                    hBg.drawRect(0, 0, choiceBg.width, choiceBg.height);
                                }
                                hBg.endFill();
                                this.highlightBgs.push(hBg);
                                this.currentFieldGroup.add(hBg);
                            }
                        }

                        var choiceText = this.game.add.text(choice.position.x, choice.position.y, choice.text, choiceTextStyle);
                        choiceText.x += choiceBg.paddingLeft || 0;
                        choiceText.y += (0.5 * (choiceBg.height - choiceText.height));

                        this.currentFieldGroup.add(choiceText);
                    }
                } else if (choiceType == "image") {
                    for (var i = 0; i < choices.images.length; i++) {
                        var choice = choices.images[i];

                        var choiceImage = this.game.add.sprite(choice.position.x, choice.position.y, LetiFramework.Utils.getImagePath(choice.image));
                        choiceImage.scale.setTo(choice.width ? choice.width / choiceImage.width : 1, choice.height ? choice.height / choiceImage.height : 1);
                        choiceImage.inputEnabled = true;
                        choiceImage.input.useHandCursor = true;
                        choiceImage.events.onInputDown.add(function(src) {
                            if (this.ctx.selectedChoices.indexOf(this.idx) > -1) {
                                LetiFramework.Analytics.trackEvent("Register", "Choice Deselection", {
                                    field: fieldName,
                                    choice: this.value
                                }, 0);
                                this.ctx.selectedChoices.splice(this.ctx.selectedChoices.indexOf(this.idx), 1);
                                this.ctx.selectedChoiceValues.splice(this.ctx.selectedChoices.indexOf(this.idx), 1);
                                if (fieldConfig.selection_indicator.type == "image") {
                                    for (var j = 0; j < this.ctx.selectionIndicators.length; j++) {
                                        var indic = this.ctx.selectionIndicators[j];
                                        if (indic.visible && indic.idx == this.idx) {
                                            indic.visible = false;
                                            delete indic.idx;
                                            break;
                                        }
                                    }
                                } else if (fieldConfig.selection_indicator.type == "highlight") {
                                    this.ctx.highlightBgs[this.idx].alpha = 0;
                                }
                            } else {
                                if (this.ctx.selectedChoices.length < selCount) {
                                    LetiFramework.Analytics.trackEvent("Register", "Choice Selection", {
                                        field: fieldName,
                                        choice: this.value
                                    }, 0);
                                    this.ctx.selectedChoices.push(this.idx);
                                    this.ctx.selectedChoiceValues.push(this.value);
                                    if (fieldConfig.selection_indicator.type == "image") {
                                        for (var j = 0; j < this.ctx.selectionIndicators.length; j++) {
                                            var indic = this.ctx.selectionIndicators[j];
                                            if (!indic.visible) {
                                                indic.visible = true;
                                                indic.idx = this.idx;
                                                indic.x = src.x + 0.5 * (src.width - indic.width);
                                                indic.y = src.y + 0.5 * (src.height - indic.height);
                                                this.ctx.currentFieldGroup.bringToTop(indic);
                                                break;
                                            }
                                        }
                                    } else if (fieldConfig.selection_indicator.type == "highlight") {
                                        this.ctx.highlightBgs[this.idx].alpha = 1;
                                    }
                                }
                            }
                        }, {
                            ctx: this,
                            idx: i,
                            value: choice.choice
                        });

                        if (fieldConfig.selection_indicator.type == "highlight") {
                            var borderWidth = 3;
                            var twiceBorderWidth = 2 * borderWidth;
                            var hBg = this.game.add.graphics(choice.position.x - borderWidth, choice.position.y - borderWidth);
                            hBg.beginFill(fieldConfig.selection_indicator.highlight.color, fieldConfig.selection_indicator.highlight.alpha);
                            hBg.alpha = 0;
                            hBg.drawRect(0, 0, choiceImage.width + twiceBorderWidth, choiceImage.height + twiceBorderWidth);
                            hBg.endFill();
                            this.highlightBgs.push(hBg);
                            this.currentFieldGroup.add(hBg);
                        }

                        this.currentFieldGroup.add(choiceImage);
                    }
                }
            }
        }
    },
    setButtonPosition: function(button, x, y) {
        if (button.constructor == LetiFramework.Ui.Button) {
            button.setX(x);
            button.setY(y);
        } else {
            button.x = x;
            button.y = y;
        }
    },
    nicknameHandler: function() {
        stores.set("inputType", "nickname");
        stores.set("prevScreen", "Register3");
        stores.set("maxLength", this.nicknameField.field.max_length);
        LetiFramework.Renderer.render("Keyboard");
    },
    fieldLabelHandler: function(src) {
        var fieldConfig = this.otherRegisterFields[this.currentField - 1];
        if (fieldConfig.fields) {
            fieldConfig = fieldConfig.fields[src.pos];
        }

        stores.set("inputType", fieldConfig.name);
        stores.set("prevScreen", "Register3");
        stores.set("maxLength", fieldConfig.field.max_length);
        if (fieldConfig.field.validation.input_type && fieldConfig.field.validation.input_type == "number") {
            stores.set("number", true);
        }
        LetiFramework.Renderer.render("Keyboard");
    },
    nextHandler: function() {
        if (!this.isLastField()) {
            LetiFramework.Analytics.trackEvent("Register", "Button Click", "Next", 0);
        }

        if (this.currentField == 0) {
            var err = null;
            this.currentField = 1;
            var nickname = stores.get("nickname");
            // if (!nickname || $.trim(nickname).length == 0) {
            //     err = "Please enter Nickname";
            // }

            // var users = LetiFramework.Db.readByKeyValue("users", "nickname", nickname);
            // if (users.length > 0) {
            //     err = "Nickname already exists!";
            // }

            if (err) {
                this.showError(err);
            } else {
                this.currentField++;
                this.showCurrentField();
            }
        } else {
            var err = null;

            var fieldConfig = this.otherRegisterFields[this.currentField - 1];
            console.log("fieldConfig",fieldConfig);

            if (fieldConfig.fields) {
                for (var i in fieldConfig.fields) {
                    err = this.validateField(fieldConfig.fields[i]);
                    if (err) break;
                }
            } else {
                err = this.validateField(fieldConfig);
            }

            if (err) {
                console.log("err",fieldConfig,err);
                this.showError(err);
            } else if (this.isLastField()) {
                this.registerHandler();
            } else {
                this.currentField++;
                this.showCurrentField();
            }
        }
    },
    validateField: function(fieldConfig) {
        var err = null;

        if (fieldConfig.field.type == "choice") {
            var validation = fieldConfig.field.validation;
            if (this.selectedChoiceValues.length == 0 && validation && validation.required) {
                err = "Please select " + fieldConfig.name;
            } else {
                stores.set(fieldConfig.name, this.selectedChoiceValues.length == 1 ?
                    this.selectedChoiceValues[0] : JSON.stringify(this.selectedChoiceValues));
            }
        } else if (fieldConfig.field.type == "text") {
            var validation = fieldConfig.field.validation;
            var fieldName = fieldConfig.name;
            var fieldValue = stores.get(fieldName);
            if (!fieldValue) fieldValue = "";

            if ($.trim(fieldValue).length == 0 && validation && validation.required) {
                err = "Please enter " + fieldName;
            } else if ($.trim(fieldValue).length > 0 && validation && validation.input_type && validation.input_type == "number" && !(Math.floor(fieldValue) == fieldValue && $.isNumeric(fieldValue))) {
                err = "Invalid " + fieldName;
            } else if ($.trim(fieldValue).length > 0 && validation && validation.input_allowed && $.inArray(fieldValue, validation.input_allowed) == -1) {
                var allowed = "";
                for (var j = 0; j < validation.input_allowed.length; j++) {
                    allowed += (j > 0 ? " or " : "") + validation.input_allowed[j];
                }
                err = "Please enter either " + allowed + " for " + fieldName;
            } else if (validation && validation.in_list && $.inArray(fieldValue, validation.in_list) == -1) {
                err = "Invalid " + fieldName;
            } else if (fieldConfig.confirm && stores.get(fieldConfig.confirm) != fieldValue) {
                err = fieldConfig.confirm + " doesn't match";
            }
        }

        return err;
    },
    registerHandler: function() {
        // LetiFramework.Analytics.trackEvent("Register", "Button Click", "Register", 0);

        // var user = new LetiFramework.DbEntities.User(store.get("nickname"));

        var otherRegisterFields = {};
        otherRegisterFields["nickname"] = window.localStorage.getItem("session");
        otherRegisterFields["gameType"] = window.localStorage.getItem("GameType");
        var logObj = {};

        for (var j = 0; j < this.otherRegisterFields.length; j++) {
            var regField = this.otherRegisterFields[j];

            if (regField.fields) {
                for (var k in regField.fields) {
                    if (regField.fields[k].confirm) continue;

                    var fieldName = regField.fields[k].name;
                    var fieldValue = stores.get(fieldName);

                    if (!regField.fields[k].hidden) logObj[fieldName] = fieldValue;

                    var validation = regField.fields[k].field.validation;
                    if (validation && validation.input_type && validation.input_type == "number") {
                        fieldValue = Number(fieldValue);
                    }

                    otherRegisterFields[fieldName] = fieldValue;
                }
            } else {
                if (regField.confirm) continue;

                var fieldName = regField.name;
                var fieldValue = stores.get(fieldName);

                if (!regField.hidden) logObj[fieldName] = fieldValue;

                var validation = regField.field.validation;
                if (validation && validation.input_type && validation.input_type == "number") {
                    fieldValue = Number(fieldValue);
                }
                otherRegisterFields[fieldName] = fieldValue;
            }
        }


        for (var j = 0; j < this.hiddenRegisterFields.length; j++) {
            var regField = this.hiddenRegisterFields[j];
            var fieldName = regField.name;
            var fieldValue = regField.value;
            otherRegisterFields[fieldName] = fieldValue;
            if (!regField.hidden) logObj[fieldName] = fieldValue;
        }

        var self = this;
        self.registerSuccessHandler(otherRegisterFields);
    },
    registerSuccessHandler: function(user) {
        this.clearFields();
        LetiFramework.GameController.bootScreen = this.screenConfig.register_button.next_screen;
        if(window.localStorage.getItem("GameType") === "HIV"){
            window.localStorage.setItem("HIV_OtherFields",JSON.stringify(otherRegisterFields));
        }else if(window.localStorage.getItem("GameType") === "Malaria"){
            window.localStorage.setItem("Malaria_OtherFields",JSON.stringify(otherRegisterFields))
        }
        LetiFramework.GameController.bootSequence();

        LetiFramework.Analytics.trackEvent("Register", "Success");
    },
    cancelHandler: function() {
        LetiFramework.Analytics.trackEvent("Register", "Button Click", "Cancel", 0);
        this.clearFields();
        LetiFramework.GameController.bootScreen = this.screenConfig.cancel_button.next_screen;
        LetiFramework.GameController.bootSequence();
    },
    clearFields: function() {
        // store.remove("nickname");
        for (var i = 0; i < this.otherRegisterFields.length; i++) {
            var regField = this.otherRegisterFields[i];
            if (regField.fields) {
                for (var k in regField.fields) {
                    stores.remove(regField.fields[k].name);
                }
            } else {
                stores.remove(regField.name);
            }
        }
    },
    showError: function(msg) {
        LetiFramework.Analytics.trackEvent("Register", "Error", msg, 0);
        alert(msg);
    },
    addComponents: function(components) {
        for (var i = 0; i < components.length; i++) {
            var asset = components[i];
            var position = asset.position;
            var animations = asset.animation;
            var interactivity = asset.interactivity;
            var cmp = null;

            if (asset.type == "shape") {
                cmp = this.game.add.graphics(position.x, position.y);
                cmp.beginFill(asset.color, 1);
                cmp.alpha = asset.alpha;
                if (asset.shape == "round_rect") {
                    cmp.drawRoundedRect(0, 0, asset.width, asset.height, asset.radius);
                } else if (asset.shape == "rect") {
                    cmp.drawRect(0, 0, asset.width, asset.height);
                }
                cmp.endFill();
            } else if (asset.type == "text") {
                cmp = this.game.add.text(position.x, position.y, asset.text, asset.style);
            } else if (asset.type == "image") {
                cmp = this.game.add.sprite(position.x, position.y, LetiFramework.Utils.getImagePath(asset.image));
                if (asset.hidden) cmp.visible = false;
                this.pageSprites[asset.image] = cmp;
                if (asset.width && asset.height) {
                    cmp.scale.setTo(asset.width / cmp.width, asset.height / cmp.height);
                }
            } else if (asset.type == "spritesheet") {
                cmp = this.game.add.sprite(position.x, position.y, LetiFramework.Utils.getImagePath(asset.image));
                if (asset.hidden) cmp.visible = false;
                this.pageSprites[asset.image] = cmp;
                cmp.scale.setTo(asset.width / asset.frame_width, asset.height / asset.frame_height);
                cmp.x += cmp.width * 0.5;
                cmp.y += cmp.height * 0.5;
                cmp.anchor.set(0.5);

                if (asset.frames_1) {
                    cmp.animations.add(asset.anim_name, asset.frames_1);
                } else {
                    var frames = [];
                    for (var j = asset.start_pos; j <= asset.stop_pos; j++) {
                        frames.push(j);
                    }
                    cmp.animations.add(asset.anim_name, frames);
                }

                if (asset.frames_2) {
                    //inverse animation
                    cmp.animations.add(asset.anim_name + "_inv", asset.frames_2);
                }

                if (asset.start == "auto") {
                    var anim = cmp.animations.play(asset.anim_name, asset.fps, asset.loop != 0);
                    if (asset.loop > 0) {
                        anim.onLoop.add(function(sprite, animation) {
                            if (animation.loopCount === this.loop) {
                                animation.loop = false;
                            }
                        }, asset);
                        anim.onComplete.add(function(sprite, animation) {
                            sprite.frame = this.start_pos;
                        }, asset);
                    }
                } else if (asset.start == "click") {
                    cmp.inputEnabled = true;
                    cmp.events.onInputDown.add(function(src) {
                        LetiFramework.Analytics.trackEvent("Register", "Interactivity", this.image, 0);

                        var anim = src.animations.play(this.anim_name, this.fps, this.loop != 0);
                        if (this.loop > 0) {
                            anim.onLoop.add(function(sprite, animation) {
                                if (animation.loopCount === this.loop) {
                                    animation.loop = false;
                                }
                            }, this);
                            anim.onComplete.add(function(sprite, animation) {
                                sprite.frame = this.start_pos;
                            }, this);
                        }
                    }, asset);
                }
            }

            if (cmp) {
                this.scene.add(cmp);
                if (components != this.pageComponents) {
                    this.currentComponents.push(cmp);
                }

                if (asset.link) {
                    cmp.inputEnabled = true;
                    cmp.input.useHandCursor = true
                    cmp.events.onInputDown.add(function() {
                        if (LetiFramework.App.isPhoneGap()) {
                            window.open(this.link, '_system');
                        } else {
                            window.open(this.link);
                        }
                    }, asset);
                }

                if (animations) {
                    for (var j = 0; j < animations.length; j++) {
                        var animation = animations[j];
                        if (animation.anim_type == "scale") {
                            var scaleBy = animation.scale_value;
                            var duration = animation.duration * this.animScale;
                            var delay = animation.delay;
                            this.game.add.tween(cmp.scale).to({
                                    x: scaleBy,
                                    y: scaleBy
                                }, duration,
                                Phaser.Easing.Linear.None, true, delay, animation.loop, animation.yoyo);
                        } else if (animation.anim_type == "translate") {
                            var location = animation.location;
                            var duration = animation.duration * this.animScale;
                            var delay = animation.delay;
                            var tween = this.game.add.tween(cmp).to(location, duration,
                                Phaser.Easing.Linear.None, true, delay, animation.loop, animation.yoyo);
                            if (asset.stop_on_anim_end) {
                                tween.onComplete.add(function(sprite, tween) {
                                    sprite.animations.stop();
                                    sprite.frame = this.stop_pos;
                                }, asset);
                            }
                            if (asset.type == "spritesheet" && asset.frames_2 && animation.yoyo) {
                                tween.onLoop.add(function(sprite, tween) {
                                    var name = sprite.animations.name == this.anim_name ?
                                        this.anim_name + "_inv" : this.anim_name;
                                    var anim = sprite.animations.play(name, asset.fps, asset.loop != 0);
                                }, asset);
                            }
                        } else if (animation.anim_type == "fadeIn") {
                            this.game.add.tween(cmp).from({
                                alpha: 0
                            }, duration, Phaser.Easing.Linear.None, true, delay, 0, false);
                        }
                    }
                }

                if (interactivity) {
                    if (interactivity.action == "click") {
                        cmp.inputEnabled = true;
                        cmp.events.onInputDown.add(function(src) {
                            var _this = LetiFramework.Renderer.currentState();
                            LetiFramework.Analytics.trackEvent("Register", "Interactivity", this.asset.image, 0);

                            var animations = this.asset.interactivity.animation;
                            var audio = this.asset.interactivity.audio;
                            var toggle = this.asset.interactivity.toggle;
                            if (animations) {
                                for (var j = 0; j < animations.length; j++) {
                                    var animation = animations[j];
                                    if (animation.anim_type == "translate") {
                                        var duration = animation.duration * this.ctx.animScale;
                                        var delay = animation.delay;
                                        this.ctx.game.add.tween(src)
                                            .to(animation.location, duration, Phaser.Easing.Linear.None, false, delay)
                                            .to(this.position, duration, Phaser.Easing.Linear.None).start();
                                    }
                                }
                            }
                            if (audio) {
                                if (LetiFramework.SoundManager.soundOn) {
                                    _this.componentSound = _this.componentSound || {};
                                    var snd = _this.componentSound[audio];
                                    if (!snd) {
                                        var soundPath = _this.getSoundPath(audio);
                                        if (LetiFramework.App.isPhoneGap()) {
                                            snd = LetiFramework.SoundManager.getSound(soundPath, false);
                                        } else {
                                            snd = _this.game.add.audio(soundPath);
                                        }
                                        _this.componentSound[audio] = snd;
                                        _this.soundObjects.push(snd);
                                    }
                                    snd.play();
                                }
                            }
                            if (toggle) {
                                for (var j = 0; j < toggle.length; j++) {
                                    var cmp = _this.pageSprites[toggle[j]];
                                    cmp.visible = !cmp.visible;
                                }
                            }
                        }, {
                            asset: asset,
                            index: i,
                            position: {
                                x: cmp.x,
                                y: cmp.y
                            },
                            ctx: this
                        });
                    }
                }
            }
        } // end for i
    },
    enableDrag: function() {
        if (LetiFramework.GameController.debugging) {
            //  Make them all input enabled
            this.scene.setAll('inputEnabled', true);

            //  And allow them all to be dragged
            this.scene.callAll('input.enableDrag', 'input');

            // Add same drag handler to all
            this.scene.callAll('events.onDragStop.add', 'events.onDragStop', this.onDragStop);
        }
    },
    onDragStop: function(cmp, pointer) {
        var pos = {
            x: cmp.x,
            y: cmp.y
        };
        if (this.x && this.y) {
            pos.x = this.x + cmp.x;
            pos.y = this.y + cmp.y;
        }
        alert("x = " + Math.round(pos.x) + "\ny = " + Math.round(pos.y));
    },
    getSoundPath: function(name) {
        return 'assets/sound/' + name;
    },
    loadAudio: function(name) {
        if(name){
            var key = this.getSoundPath(name);
            this.game.load.audio(key, key);
        }
    },
    preloadSprites: function() {
        for (var i = 0; i < this.pageComponents.length; i++) {
            var cmp = this.pageComponents[i];
            if (cmp.image && cmp.type == 'spritesheet') {
                var path = LetiFramework.Utils.getImagePath(cmp.image);
                this.game.load.spritesheet(path, path, cmp.frame_width, cmp.frame_height);
            }
        }

        for (var i in this.dialogueComponents) {
            var moreComponents = this.dialogueComponents[i];
            for (var j = 0; j < moreComponents.length; j++) {
                var cmp = moreComponents[j];
                if (cmp.image && cmp.type == 'spritesheet') {
                    var path = LetiFramework.Utils.getImagePath(cmp.image);
                    this.game.load.spritesheet(path, path, cmp.frame_width, cmp.frame_height);
                }
            }
        }
    }
}