// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
const { ccclass, property } = cc._decorator;
@ccclass
export default class AudioMng extends cc.Component {
    @property(cc.AudioClip)
    private MagicAudio: cc.AudioClip = null;//开启魔法棒
    @property(cc.AudioClip)
    private RightAudio: cc.AudioClip = null; //点击正确
    @property(cc.AudioClip)
    private WrongAudio: cc.AudioClip = null; //点击错误
    private Context: any = null;     //框架的context
    private Music_to_play: any[] = [];  //保存框架未初始化完成 触发了的音乐 [cc.Audio,Boolean]

    private AudioUrl: cc.AudioClip = null;
    private AudioId: number = null;
    private TimeOutId: number = null;
    onLoad() {
        if (this.MagicAudio) {
            cc.director.getScene().on("ENABLE_MAGIC", () => {
                this.play(this.MagicAudio);
            });
        }
        cc.director.getScene().on("MOUNTED", (event: any) => {
            event = event.detail || event
            this.Context = event.context
            if (this.Music_to_play.length > 0) {
                this.play(...this.Music_to_play)
                this.Music_to_play = [];
            }
        })
    }
    play(audio?: cc.AudioClip, needListenCallBack?: Boolean) {
        if (!audio) {
            return;
        }
        if ((window as any).ONLINE) {//框架播放
            if (this.Context) {
                this.Context.soundMng.play(audio, needListenCallBack);
            } else {
                this.Music_to_play = [audio, needListenCallBack];
            }
        } else {
            if (this.TimeOutId != null) {
                clearTimeout(this.TimeOutId);
                this.TimeOutId = null;
            }
            this.stop();//框架只能同时播放一个声音
            let id = cc.audioEngine.play(audio.toString(), false, 1);
            if (needListenCallBack) {
                //播放结束回调
                this.AudioUrl = audio;
                this.AudioId = id;
                cc.audioEngine.setFinishCallback(this.AudioId, () => {
                    this.AudioId = null;
                    this.AudioUrl = null;
                    cc.director.getScene().emit("ENDED", {
                        time: cc.audioEngine.getDuration(id) * 1000,
                        url: audio
                    })
                })
            }
        }
    }
    stop() {
        if (this.Context) {
            this.Context.soundMng.stop();
        } else {
            if (this.AudioId == null) {
                return;
            }
            let id = this.AudioId;
            let url = this.AudioUrl;
            this.AudioId = null;
            this.AudioUrl = null;
            cc.audioEngine.stop(id);
            //发送结束 监听
            cc.director.getScene().emit("ENDED", {
                time: cc.audioEngine.getDuration(id) * 1000,
                url: url
            })
        }
    }
    playRight() {
        if (this.RightAudio) {
            this.play(this.RightAudio);
        }
    }
    playWrong() {
        if (this.WrongAudio) {
            this.playWrong();
        }
    }
    update() {
        if (this.AudioId == null) {
            return;
        }
        cc.director.getScene().emit("TIMEUPDATE", {
            time: cc.audioEngine.getCurrentTime(this.AudioId) * 1000,
            url: this.AudioUrl
        })
    }
}
