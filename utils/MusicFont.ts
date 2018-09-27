// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import EventName from "../base/config/EventName"
import ButtonEvent from "../base/TouchEvent"
import AudioMng from "../base/AudioMng"
const { ccclass, property } = cc._decorator;
@ccclass
export default class MusicFont extends cc.Component {
    @property(cc.Node)
    FontPanel: cc.Node = null; //字体预设 必须
    @property(cc.Boolean)
    PlayAuto: Boolean = false;   //自动开始播放
    @property(cc.Boolean)
    AutoNext: Boolean = false;  //播完自动下一首
    @property(cc.Boolean)
    HideBtnPlayAfter: Boolean = true;   //播放后是否 隐藏播放 按钮
    @property(Boolean)
    HasPlay: Boolean = true;
    @property(cc.Boolean)
    HasPlayNext: Boolean = true;
    @property(Boolean)
    HasRePlay: Boolean = true;
    @property(cc.Boolean)
    HasEffect: Boolean = true;
    @property(cc.Boolean)
    UseScrollView: Boolean = true;     //使用滑动条
    @property(cc.Float)
    FontDistance: number = 50;
    @property(cc.Integer)
    ShowSentensLength: number = 1;//一页一页显示时  一页的句子数
    @property(cc.Integer)
    OneSentenSpCount: number = 1; // 一句话几个 spriteframe
    @property(cc.AudioClip)
    MusicAudios: cc.AudioClip[] = []; //音乐文件
    @property([cc.Float])
    MusicTime: number[] = [];    //每个音乐文件的时间
    @property(cc.SpriteFrame)
    RedSpriteFrames: cc.SpriteFrame[] = [];   //红色字体图片
    @property(cc.SpriteFrame)
    BlackSpriteFrames: cc.SpriteFrame[] = []; //黑色字体图片

    FontArray: cc.Node[] = []; //存储字体 一页显示时
    CurrentIndex: number = -1; //当前下标
    FontNode: cc.Node = null;    //当前字体节点

    //当前字体节点拆分
    MaskBlackLeft: cc.Node = null;
    MaskRedLeft: cc.Node = null;
    MaskBlackRight: cc.Node = null;
    MaskRedRight: cc.Node = null;
    MaskBlackLeft2: cc.Node = null;
    MaskRedLeft2: cc.Node = null;
    MaskBlackRight2: cc.Node = null;
    MaskRedRight2: cc.Node = null;
    AudioMng: AudioMng = null;

    start() {
        let buttonEvent: ButtonEvent = this.node.getComponent("TouchEvent")
        if (!buttonEvent) {
            buttonEvent = this.node.addComponent("TouchEvent");
        }
        let play = this.FontPanel.getChildByName("Play"),
            replay = this.FontPanel.getChildByName("RePlay"),
            nextplay = this.FontPanel.getChildByName("NextPlay"),
            effectPlay = this.FontPanel.getChildByName("btn_play");
        buttonEvent.addBtn([play, replay, nextplay, effectPlay]);
        if (this.HasPlay) {
            play.active = true;
        }
        if (this.HasEffect) {
            effectPlay.active = true;
            effectPlay.zIndex = 2;
        }
        cc.director.getScene().on(EventName.TouchEvent.TOUCH_CLICK, (event: any/*cc.Event.EventCustom*/) => {
            event = event.detail || event
            if (event && event.node_array && event.node_array instanceof Array) {
                for (let i: number = 0, btn: cc.Node; btn = event.node_array[i]; ++i) {
                    if (play.active && play == btn) {
                        this.play(0);
                        return;
                    } else if (nextplay.active && nextplay == btn) {
                        let AutoNext = this.AutoNext;
                        this.AutoNext = false;
                        this.nextPlay();
                        this.AutoNext = AutoNext;
                        return;
                    } else if (replay.active && replay == btn) {
                        this.rePlay();
                        return;
                    } else if (effectPlay.active && effectPlay == btn) {
                        this.play(0);
                    }
                }
            }
        })
        cc.director.getScene().on("ENDED", (event: any) => {
            event = event.detail || event
            if (event.url == this.MusicAudios[this.CurrentIndex]) {
                if (this.UseScrollView) {
                    this.MaskBlackLeft.width = this.MaskBlackLeft.getChildByName("Font").width * 1.1;
                    this.MaskRedLeft.width = this.MaskRedLeft.getChildByName("Font").width * 1.1;
                    this.MaskBlackRight.width = this.MaskBlackLeft.getChildByName("Font").width * 1.1;
                    this.MaskRedRight.width = this.MaskRedLeft.getChildByName("Font").width * 1.1;
                }
                if (this.AutoNext) {
                    this.nextPlay();
                }
            }
        })
        cc.director.getScene().on("TIMEUPDATE", (event: any) => {
            event = event.detail || event;
            if (event.url == this.MusicAudios[this.CurrentIndex]) {
                this.updateFontMask(event.time);
                if (this.HasEffect) {
                    __playEffect(true);
                }
            }
        })
        this.AudioMng = this.getComponent("AudioMng")
        if (!this.AudioMng) {
            this.AudioMng = this.addComponent("AudioMng");
        }
        let __playEffect = (enable) => {
            this.unschedule(__playEffect);
            if (!enable || typeof (enable) == "number") {
                this.FontPanel.getChildByName("circle1").stopAllActions();
                this.FontPanel.getChildByName("circle2").stopAllActions();
                this.FontPanel.getChildByName("circle1").scale = 0.8;
                this.FontPanel.getChildByName("circle2").scale = 0.8;
                return;
            }
            this.scheduleOnce(__playEffect, 0.3);
            if (this.FontPanel.getChildByName("circle1").getNumberOfRunningActions() > 0) {
                return;
            }
            this.FontPanel.getChildByName("circle1").active = true;
            this.FontPanel.getChildByName("circle1").scale = 0.8;
            this.FontPanel.getChildByName("circle2").active = true;
            this.FontPanel.getChildByName("circle2").scale = 0.8;
            this.FontPanel.getChildByName("circle1").runAction(cc.repeatForever(cc.sequence(cc.callFunc((ref: cc.Node) => {
                ref.scale = 0.8;
                ref.opacity = 255;
                ref.zIndex = 1;
            }), cc.spawn(cc.sequence(cc.delayTime(0.9), cc.callFunc(() => {
                this.FontPanel.getChildByName("circle2").runAction(cc.sequence(cc.callFunc((ref: cc.Node) => {
                    ref.scale = 0.8;
                    ref.opacity = 255;
                    ref.zIndex = 1;
                }), cc.spawn(cc.scaleTo(1.2, 1.2), cc.fadeTo(1.2, 150)), cc.callFunc((ref) => {
                    ref.zIndex = 0;
                }), cc.fadeOut(0.6)));
            })), cc.scaleTo(1.2, 1.2), cc.fadeTo(1.2, 150)), cc.callFunc((ref) => {
                ref.zIndex = 0;
            }), cc.fadeOut(0.6))));
        }
        if (this.PlayAuto) {
            this.play(0);
        }
    }
    creatFont() {
        this.FontNode = cc.instantiate(this.FontPanel.getChildByName("Font"));
        this.FontNode.active = true;
        //字体拆解
        this.MaskBlackLeft = this.FontNode.getChildByName("mask_black_left");
        this.MaskRedLeft = this.FontNode.getChildByName("mask_red_left");
        this.MaskBlackRight = this.FontNode.getChildByName("mask_black_right");
        this.MaskRedRight = this.FontNode.getChildByName("mask_red_right");

        this.MaskBlackLeft2 = this.FontNode.getChildByName("mask_black_left2");
        this.MaskRedLeft2 = this.FontNode.getChildByName("mask_red_left2");
        this.MaskBlackRight2 = this.FontNode.getChildByName("mask_black_right2");
        this.MaskRedRight2 = this.FontNode.getChildByName("mask_red_right2");
        this.setSpriteFrame();
        if (this.UseScrollView) {
            //初始化scrollview height
            let scrollviewNode = this.FontPanel.getChildByName("ScrollView");
            scrollviewNode.height = (this.MaskBlackLeft.getChildByName("Font").height + this.FontDistance) * (this.ShowSentensLength) - this.FontDistance + this.MaskBlackLeft.getChildByName("Font").height;
            scrollviewNode.getChildByName("view").height = this.ShowSentensLength * (this.MaskBlackLeft.getChildByName("Font").height + this.FontDistance);
            scrollviewNode.getChildByName("scrollBar").height = scrollviewNode.height;

            this.FontNode.removeComponent(cc.Sprite)//去掉 字体自带的白板
            for (let i: number = this.CurrentIndex, font: cc.Node; font = this.FontArray[i]; ++i) {
                font.destroy();
            }
            this.FontArray.splice(this.CurrentIndex, this.FontArray.length - this.CurrentIndex);
            this.FontArray.push(this.FontNode);
            this.FontPanel.getChildByName("ScrollView").active = true;
            let scrollview = this.FontPanel.getChildByName("ScrollView").getComponent(cc.ScrollView);
            let content = scrollview.content;
            content.addChild(this.FontNode);
            content.active = true;
            let y = -(this.MaskBlackLeft.getChildByName("Font").height + this.FontDistance) * (this.CurrentIndex + 1) + this.FontDistance;
            this.FontNode.setPosition(cc.v2(0, y));
            content.height = Math.max(scrollviewNode.height, Math.abs(y) + this.MaskBlackLeft.getChildByName("Font").height);
            
            if (content.height > scrollviewNode.height) {
                console.log("1");
                scrollview.vertical = true;
                scrollview.scrollToBottom(0.2);
            } else {
                scrollview.vertical = false;
            }
        }
        else {
            this.FontPanel.addChild(this.FontNode);
        }
    }
    setSpriteFrame() {
        this.MaskBlackLeft.getChildByName("Font").getComponent(cc.Sprite).spriteFrame = this.BlackSpriteFrames[this.CurrentIndex * this.OneSentenSpCount];
        this.MaskBlackLeft.setContentSize(this.MaskBlackLeft.getChildByName("Font").getContentSize());
        this.MaskRedLeft.getChildByName("Font").getComponent(cc.Sprite).spriteFrame = this.RedSpriteFrames[this.CurrentIndex * this.OneSentenSpCount];
        this.MaskRedLeft.setContentSize(this.MaskRedLeft.getChildByName("Font").getContentSize());
        if (this.OneSentenSpCount == 1) {
            this.MaskBlackLeft.x = this.MaskBlackLeft.width >> 1;
            this.MaskRedLeft.x = this.MaskRedLeft.width >> 1;
        } else {
            this.MaskBlackRight.getChildByName("Font").getComponent(cc.Sprite).spriteFrame = this.BlackSpriteFrames[this.CurrentIndex * this.OneSentenSpCount + 1];
            this.MaskBlackRight.setContentSize(this.MaskBlackLeft.getChildByName("Font").getContentSize());
            this.MaskRedRight.getChildByName("Font").getComponent(cc.Sprite).spriteFrame = this.RedSpriteFrames[this.CurrentIndex * this.OneSentenSpCount + 1];
            this.MaskRedRight.setContentSize(this.MaskBlackLeft.getChildByName("Font").getContentSize());
            this.MaskBlackRight.x = this.MaskBlackRight.getContentSize().width;
            this.MaskRedRight.x = this.MaskRedRight.getContentSize().width;
        }
    }
    updateFontMask(dt) {
        this.MaskBlackLeft.width = this.MaskBlackLeft.getChildByName("Font").width * (1 - dt / 1000 * this.OneSentenSpCount / this.MusicTime[this.CurrentIndex]);
        this.MaskRedLeft.width = this.MaskRedLeft.getChildByName("Font").width * (1 - dt / 1000 * this.OneSentenSpCount / this.MusicTime[this.CurrentIndex]);
        dt -= (this.MusicTime[this.CurrentIndex] * 1000 / this.OneSentenSpCount)
        this.MaskBlackRight.width = this.MaskBlackLeft.getChildByName("Font").width * (1 - dt / 1000 * this.OneSentenSpCount / this.MusicTime[this.CurrentIndex]);
        this.MaskRedRight.width = this.MaskRedLeft.getChildByName("Font").width * (1 - dt / 1000 * this.OneSentenSpCount / this.MusicTime[this.CurrentIndex]);
    }
    play(index) {
        if (index < this.MusicAudios.length) {
            this.AudioMng.stop();
            this.CurrentIndex = index;
            this.AudioMng.play(this.MusicAudios[index], true); // 会stop 避免其调用playNext  更改了 this.CurrentIndex
            if (!this.FontNode) {
                this.creatFont();
            } else if (this.UseScrollView) {
                this.creatFont();
            }
            if (this.HideBtnPlayAfter) {
                this.FontPanel.getChildByName("Play").active = false;
            }
            if (this.HasPlayNext && this.CurrentIndex < this.MusicAudios.length - 1) {
                this.FontPanel.getChildByName("NextPlay").active = true;
            } else {
                this.FontPanel.getChildByName("NextPlay").active = false;
            }
            if (this.HasRePlay) {
                this.FontPanel.getChildByName("RePlay").active = true;
            }
        }
    }
    rePlay() {
        this.play(this.CurrentIndex);
    }
    nextPlay() {
        this.play(this.CurrentIndex + 1);
    }
}
