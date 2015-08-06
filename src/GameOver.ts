/**
 * Created by sunjing on 15/8/4.
 */
class GameOver extends egret.DisplayObjectContainer {
    public constructor(gameData:any) {
        super();
        this.init(gameData);

    }

    private init(data:any):void {

        var hasLost=data.result===GameResult.FAIL;
        var sound:egret.Sound;//音效
        var bg:egret.Bitmap;//背景图
        var infoLine1:egret.TextField=new egret.TextField();;//第一行文本
        var infoLine2:egret.TextField=new egret.TextField();;//第二行文本
        infoLine1.textColor = 0xff0000;
        infoLine1.bold=true;
        infoLine2.textColor=0xffffff;
        infoLine2.strokeColor=0x000000;
        infoLine2.stroke=2;
        infoLine2.bold=true;
        if(hasLost){
            sound=RES.getRes('fail_sound');
            bg=Util.createBitmapByName('failed_bg');
            infoLine1.text = "你没有抓住神!经!猫!";
            infoLine2.text="精神病院长又发神经病了!";
        }else{
            sound=RES.getRes('victory_sound');
            bg=Util.createBitmapByName('victory_bg');
            infoLine1.text = "你花了"+data.step+"步抓住了神经猫";
            infoLine2.text="神经全国排名"+Math.ceil(data.step+1000*Math.random())+'位';
        }
        sound.play();
        this.addChild(bg);
        var gap = 30;//图片与按钮y坐标间隔

        var _replayBtn = Util.createBitmapByName('replay_btn')//'再来一次'按钮
        this.addChild((_replayBtn));

        bg.y = (Util.getStageHeight() - (bg.height + _replayBtn.height + gap)) / 2;
        bg.x = (Util.getStageWidth() - bg.width) / 2;


        _replayBtn.y = bg.y + bg.height + 30;
        _replayBtn.x = (Util.getStageWidth() - _replayBtn.width) / 2;
        _replayBtn.touchEnabled = true;
        _replayBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);

        this.addChild(infoLine1);
        this.addChild(infoLine2);
        infoLine1.x=(Util.getStageWidth() - infoLine1.width) / 2;
        infoLine1.y=bg.y+(bg.height - infoLine1.height) / 2;
        infoLine2.x=(Util.getStageWidth() - infoLine2.width) / 2;
        infoLine2.y=infoLine1.y+50;
    }


    private tapHandler() {
        //点击'再来一次',触发'游戏开始'事件,主类中将对该事件添加监听
        console.log('taped');
        this.dispatchEvent(new GameEvent(GameEvent.GAME_START));
    }
}