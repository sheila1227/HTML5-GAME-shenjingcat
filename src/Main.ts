//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

enum State{
    STATE_START=0,//游戏开始
    STATE_PLAY=1,//游戏主界面
    STATE_OVER//游戏结束
}

class Main extends egret.DisplayObjectContainer {

    //public static STATE_START=0;
    //public static STATE_PLAY=0;
    //public static STATE_OVER=0;

    /*
     * 加载进度界面
     * Process interface loading
     */
    private loadingView:LoadingUI;
    //舞台宽度
    private stageW:number;
    //舞台高度
    private stageH:number;
    //当前状态
    private curState:number;
    //当前显示对象
    private curObject:egret.DisplayObjectContainer;
    //存储游戏结果
    private gameData:any;
    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/resource.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield:egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene():void {
        this.stageW=Util.getStageWidth();
        this.stageH=Util.getStageHeight();
        //背景图,三个状态公用
        var _bg:egret.Bitmap = Util.createBitmapByName("bgImage");
        this.addChild(_bg);
        _bg.width = this.stageW;
        _bg.height = this.stageH;
        //当前状态,初始设为空
        this.curState=-1;
        this.state=State.STATE_START;
    }

    /**
     * 状态机,根据传入的state不同,进入不同界面(游戏开始/游戏主界面/游戏结束)
     * @param _state
     */
    private set state(_state:number){
        if(_state===this.curState) {return;}  //已经是当前状态,不用切换
        this.curState=_state;
        if(this.curObject&&this.curObject.parent){
            this.curObject.parent.removeChild(this.curObject);
        }
        switch (_state){
            case State.STATE_START:
                this.curObject=new GameStart();
                this.curObject.addEventListener(GameEvent.GAME_START,this.gameStart,this);
                this.addChild(this.curObject);
                break;
            case State.STATE_PLAY:
                this.curObject=new GamePlay();
                this.curObject.addEventListener(GameEvent.GAME_OVER,this.gameOver,this);
                this.addChild(this.curObject);
                this.curObject.y=this.stageH*0.35;//避开图片的banner部分
                this.curObject.x=(this.stageW-this.curObject.width)/2;

                break;
            case State.STATE_OVER:
                var gameOver:GameOver=new GameOver(this.gameData);
                gameOver.addEventListener(GameEvent.GAME_START,this.gameStart,this);
                this.curObject.addChild(gameOver);
                this.addChild(this.curObject);
                gameOver.x=0;
                gameOver.y=(-1)*this.curObject.y;

                break;
            default:
                break;
        }
    }

    private gameStart():void{
        console.log('game start 啦');
        this.state=State.STATE_PLAY;
    }


    private gameOver(event:GameEvent):void{
        this.gameData=event.data;
        console.log('game over 啦');
        this.state=State.STATE_OVER;
    }
}


