/**
 * Created by sunjing on 15/8/4.
 */
    enum CircleStatus{
        Available=0,//可以走
        Blocked=1,//不能走
        TargetIn=2//猫在里面
    }
class Circle extends egret.Sprite{
    private _status:CircleStatus;
    private size:number;//尺寸
    public cx:number;//在圆圈矩阵中的位置
    public cy:number;

    private  img_available:egret.Bitmap;
    private  img_blocked:egret.Bitmap;
    private sound_set:egret.Sound;
    public constructor(x:number,y:number,size:number){
        super();
        this.cx=x;
        this.cy=y;
        this.size=size;
        this.setResources();
        this.initStatus();
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
    }

    private onAddToStage(event:egret.Event){
        this.removeEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
        this.touchEnabled=true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP,this.tapHandler,this);
    }

    private tapHandler(){
        //切换status
        if(this._status!==CircleStatus.Blocked){
            this.sound_set.play();//音效
            this.setStatus(CircleStatus.Blocked);
            this.dispatchEvent(new GameEvent(GameEvent.GAME_MOVE_CAT));
        }
    }

    private setResources(){
        this.sound_set = RES.getRes("set_sound");
        this.img_available?void 0:this.img_available=Util.createBitmapByName('pot1');
        this.img_blocked?void 0:this.img_blocked=Util.createBitmapByName('pot2');
        this.img_blocked?void 0:this.img_blocked=Util.createBitmapByName('pot2');
    }

    private initStatus():void{
        this.setStatus(CircleStatus.Available);//默认状态为available
    }

    public setStatus(status:CircleStatus){
        this._status=status;
        this.removeChildren();

        switch (this._status){
            case CircleStatus.Available:
                this.img_available.width=this.size;
                this.img_available.height=this.size;
                this.addChild(this.img_available);
                break;
            case CircleStatus.Blocked:
                this.img_blocked.width=this.size;
                this.img_blocked.height=this.size;
                this.addChild(this.img_blocked);
                break;
            case CircleStatus.TargetIn:
                this.img_blocked.width=this.size;
                this.img_blocked.height=this.size;
                this.addChild(this.img_available);
                break;
        }
    }

    public getStatus(){
        return this._status;
    }

}