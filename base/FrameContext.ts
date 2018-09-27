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
export default class FrameContext extends cc.Component {
    Context: any = null;
    onLoad() {
        cc.director.getScene().on("MOUNTED", (event:any) => {
            event = event.detail || event
            this.Context = event.context;
            this.Context.board.mouseState = true;
        })
        //监听开启魔法棒
        cc.director.getScene().on("ENABLE_MAGIC", () => {

        })
        //监听关闭魔法棒
        cc.director.getScene().on("DISABLE_MAGIC", () => {

        })
    }
    //-- 开关魔法棒
    _setMagicEnabled(enabled) {
        this.Context && this.Context.enableMagic(enabled);
    }
    //-- 下划线
    _stopOnce(_boolean) {
        if (this.Context && this.Context.board) {
            this.Context.board.stoponce = !!_boolean;
        }
    }
    //-- 烟花
    _playFirecracker() {
        this.Context && this.Context.firecracker();
    }
    //-- 讲义
    _showOutline(str) {
        if (this.Context && str) {
            this.Context.showDraft(str);
        }
    }
    //进度条
    _updateProgress(progressVal) {
        if (!progressVal) {
            return;
        }
        this.Context && this.Context.setProgress(progressVal);
    }
}
