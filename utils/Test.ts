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
import EventName from "../base/config/EventName"
import TouchEvent from "../base/TouchEvent"
@ccclass
export default class Test extends cc.Component {
    @property(cc.String)
    mm: string = "0090909";
    start() {
        this.__test();
    }
    private __test() {
        if (!(window as any).ONLINE) {
            this.scheduleOnce(() => {
                cc.director.getScene().emit("ENABLE_MAGIC");
            }, 0.5)
            this.scheduleOnce(() => {
                cc.director.getScene().emit("DISABLE_MAGIC");
            }, 5)
            cc.loader.loadRes("Json/scenename", (err, data) => {
                if (err) {
                    return;
                }
                let scene = [];
                for (let key in data) {
                    scene.push(data[key]);
                }
                let pre = new cc.Node
                pre.addComponent(cc.Label).string = "上一个场景";
                let com = pre.addComponent(cc.Widget);
                com.isAlignBottom = true;
                com.bottom = 500;
                com.isAlignLeft = true;
                com.left = 200;

                pre.setContentSize(cc.size(100, 100));
                pre.color = cc.color(255, 0, 0);
                cc.director.getScene().addChild(pre);

                let next = cc.instantiate(pre);
                com = next.getComponent(cc.Widget);
                com.isAlignLeft = false;
                com.isAlignRight = true;
                com.right = 200;
                cc.director.getScene().addChild(next);
                next.getComponent(cc.Label).string = "下一个场景";
                let touchEvent: TouchEvent = this.node.getComponent("TouchEvent")
                if (!touchEvent) {
                    touchEvent = this.node.addComponent("TouchEvent");
                }
                touchEvent.addBtn([pre, next]);
                let index = scene.indexOf(cc.director.getScene().name);
                cc.director.getScene().on(EventName.TouchEvent.TOUCH_CLICK, (event: any) => {
                    event = event.detail || event
                    if (event && event.node_array && event.node_array instanceof Array) {
                        for (let i: number = 0, btn: cc.Node; btn = event.node_array[i]; ++i) {
                            let indexTemp = -1;
                            if (btn == pre) {
                                indexTemp = index - 1 > -1 ? index - 1 : scene.length - 1;
                            }
                            if (btn == next) {
                                indexTemp = index + 1 < scene.length ? index + 1 : 0;
                            }
                            if (~indexTemp) {
                                cc.audioEngine.stopAll();
                                cc.director.getScene().destroy();
                                cc.director.loadScene(scene[indexTemp], (err, scene: cc.Scene) => {
                                    console.log(scene.name);
                                    if (err) {
                                        return;
                                    }
                                    if (!scene.getChildByName("Canvas").getComponent("Test")) {
                                        scene.getChildByName("Canvas").addComponent("Test")
                                    }
                                });
                            }
                        }
                    }
                })
            })
        }
    }
}
