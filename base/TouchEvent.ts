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
const { ccclass, property } = cc._decorator;
@ccclass
export default class TouchEvent extends cc.Component {
    @property({ type: cc.Node })
    private ClickNode: cc.Node[] = []; // 可以被点击的Node
    start() {
        let touch_start: cc.Vec2 = cc.v2(0, 0); //点击起始位置
        let node_array: cc.Node[] = []; //点击 node
        let i: number = 0, btn: cc.Node = null
        let node = new cc.Node();
        cc.director.getScene().addChild(node);
        node.x = 0;
        node.y = 0;
        node.zIndex = 10000;
        cc.eventManager.addListener(cc.EventListener.create({
            event: (cc.EventListener as any).TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            owner: this,
            onTouchBegan: (event: cc.Event.EventTouch) => {
                touch_start = event.getLocation();
                node_array = [];
                for (i = 0, btn = null; btn = this.ClickNode[i]; ++i) {
                    if (cc.isValid(btn, true) && btn.getBoundingBox().contains(btn.parent.convertToNodeSpaceAR(touch_start))) {
                        node_array.push(btn);
                    }
                }
                cc.director.getScene().emit(EventName.TouchEvent.TOUCH_START, { node_array: node_array, event: event });
                return true;
            },
            onTouchMoved: (event: cc.Event.EventTouch) => {
                cc.director.getScene().emit(EventName.TouchEvent.TOUCH_MOVE, { event: event });
            },
            onTouchEnded: (event: cc.Event.EventTouch) => {
                cc.director.getScene().emit(EventName.TouchEvent.TOUCH_END, { event: event });
                if (cc.pDistance(event.getLocation() , cc.v2(touch_start)) > 30) {
                    node_array = [];
                    return;
                } else {
                    for (i = 0, btn = null; btn = node_array[i]; ++i) {
                        if (!~this.ClickNode.indexOf(btn) || (!cc.isValid(btn, true) || !btn.getBoundingBox().contains(btn.parent.convertToNodeSpaceAR(event.getLocation())))) {
                            node_array.splice(i--, 1);
                        }
                    }
                }
                cc.director.getScene().emit(EventName.TouchEvent.TOUCH_CLICK, { node_array: node_array });
                node_array = [];
            },
            onTouchCancelled: (event) => {
                cc.director.getScene().emit(EventName.TouchEvent.TOUCH_CANCEL, { event: event });
                node_array = [];
            }
        }), node);
    }
    public addBtn(btn: cc.Node | cc.Node[]) {
        if (!btn) {
            return;
        }
        if (btn instanceof Array) {
            this.ClickNode.push.apply(this.ClickNode, btn);
        } else {
            this.ClickNode.push(btn);
        }
    }
    public removeBtn(btn: cc.Node | cc.Node[]) {
        if (!btn) {
            return;
        }
        if (btn instanceof Array) {
            this.removeBtn.apply(this, btn);
        } else {
            let index = this.ClickNode.indexOf(btn);
            if (~index) {
                this.ClickNode.splice(index, 1);
            }
        }
    }
}
