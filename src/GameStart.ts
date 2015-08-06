/**
 * Created by sunjing on 15/8/4.
 */
class GameStart extends egret.DisplayObjectContainer{
    public constructor(){
        super();
        if(this.stage){   //已经在舞台上(说明由'再来一次'按钮进入)
            this.init();
        }else{           //初次加载,刚打开游戏页面
            this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
        }
    }

    private init():void{
        var _bg=Util.createBitmapByName('btnStart');
        this.addChild(_bg);
        _bg.y=(Util.getStageHeight()-_bg.height)/2;
        _bg.x=(Util.getStageWidth()-_bg.width)/2;
        this.touchEnabled=true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP,this.tapHandler,this);
    }

    private onAddToStage(event:egret.Event){
        this.removeEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
        this.init();
    }

    private tapHandler(){
        //点击开始界面任意处,触发'游戏开始'事件,主类中将对该事件添加监听
        this.dispatchEvent(new GameEvent(GameEvent.GAME_START));
    }
}