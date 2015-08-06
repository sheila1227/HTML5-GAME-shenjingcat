/**
 * Created by sunjing on 15/8/4.
 */


    enum Direction{
        LEFT=0,
        TOP_LEFT=1,
        TOP_RIGHT=2,
        RIGHT=3,
        BOTTOM_RIGHT=4,
        BOTTOM_LEFT=5
    }

    enum GameResult{
        WIN=0,
        FAIL=1
    }
class GamePlay extends egret.DisplayObjectContainer {
    private RowNum:number = 9;
    private ColNum:number = 9;
    private defaultBlockedNum = 15;
    private circleArray:Circle[][] = new Array();
    private circleMarginRight:number = 4;
    private circleSize:number;
    private catCircle:Circle;//猫所在的圆圈
    private mc_cat_stay:egret.MovieClip;//未被围住动画
    private mc_cat_catched:egret.MovieClip;//被围住动画
    private isCatSurrounded:boolean=false;//猫是否被围住
    private result:GameResult;//游戏结果
    private step:number=0;//总的游戏步数

    public constructor() {
        super();
        if (this.stage) {
            this.init();
        } else {
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        }
    }

    private init():void {
        this.mc_cat_stay = Util.createMovieClipByName("stay");
        this.mc_cat_catched=Util.createMovieClipByName("weizhu");
        this.createCirclArray();
        this.createRandomBlocks();
        this.drawCircles();
        this.setTargetPosition();
    }

    /*
     构建circle二维数据
     */
    private createCirclArray() {
        this.circleArray = [];
        this.circleSize = Util.getStageWidth() / (this.ColNum + 1) - this.circleMarginRight;
        for (var i = 0; i < this.RowNum; i++) {
            var row = [];
            for (var j = 0; j < this.ColNum; j++) {
                var circle = new Circle(j, i, this.circleSize);
                this.addChild(circle);
                row.push(circle);
            }
            this.circleArray.push(row);
        }
    }

    /*
     按照给定的默认路障数量创建随机路障
     */
    private createRandomBlocks() {
        for (var i = 0; i < this.defaultBlockedNum;) {
            var r = Math.floor(Math.random() * 1000 % this.RowNum);
            var c = Math.floor(Math.random() * 1000 % this.ColNum);
            if (this.circleArray[c][r].getStatus() === CircleStatus.Available && (c !== Math.floor(this.ColNum / 2) && r != Math.floor(this.RowNum / 2))) {
                this.circleArray[c][r].setStatus(CircleStatus.Blocked);
                i++;
            }
        }
    }

    private setTargetPosition() {
        var x = Math.floor(this.ColNum / 2);
        var y = Math.floor(this.RowNum / 2);
        this.setCatCircle(x, y);
    }

    /*
     将circle二维数组中的元素画到界面上
     */
    private drawCircles() {
        var startX:number = 0;

        for (var i = 0; i < this.RowNum; i++) {
            var startY:number = 0;
            if (i % 2 != 0) {  //偶数行缩进
                startX = this.circleSize / 2;
            } else {
                startX = 0;
            }
            for (var j = 0; j < this.ColNum; j++) {
                var circle = this.circleArray[i][j];
                circle.x = startX + j * (this.circleSize + this.circleMarginRight);
                circle.y = startY + i * this.circleSize;
                circle.addEventListener(GameEvent.GAME_MOVE_CAT, this.moveCatHandler, this);
                this.addChild(circle);
            }
        }
    }

    private onAddToStage(event:egret.Event) {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this.init();
    }


    /*
    由x,y从矩阵中获取元素
     */
    private getCircleAt(x:number, y:number) {
        return this.circleArray[y][x];
    }

    /*
    判断传入的circle是否在边界上
     */
    private isCircleAtEdge(circle:Circle) {
        return circle.cx * circle.cy === 0 || circle.cx === this.ColNum - 1 || circle.cy === this.RowNum - 1;
    }

    private setCatCircle(x, y) {
        this.catCircle = this.getCircleAt(x, y);
        this.catCircle.setStatus(CircleStatus.TargetIn);
        var x:any=this.catCircle.x + (this.catCircle.width - this.mc_cat_stay.width) / 2;
        var y:any=this.catCircle.y - this.mc_cat_stay.height * 0.75;
        if(this.isCatSurrounded){
            if(this.getChildIndex(this.mc_cat_catched)<0){ //说明刚刚由未围住切换到围住状态
                this.removeChild(this.mc_cat_stay);
                this.addChild(this.mc_cat_catched);
            }
            this.mc_cat_catched.x=x;
            this.mc_cat_catched.y=y;
            this.mc_cat_catched.play(-1);
        }else{
            if(this.getChildIndex(this.mc_cat_stay)<0){
                this.addChild(this.mc_cat_stay);
            }
            this.mc_cat_stay.x=x;
            this.mc_cat_stay.y=y;
            this.mc_cat_stay.play(-1);
        }
    }

    /*
    处理GameEvent.GAME_MOVE_CAT事件
     */
    private moveCatHandler(event:egret.Event) {
        //切换status
        var circle = event.target;
        if(this.isCircleAtEdge(this.catCircle)){
            this.gameLose();
        }else{
            this.moveCat();

        }
    }

    private moveCat(){
        var maxVal=-999;
        var direction=Direction.LEFT;
        for(var i=Direction.LEFT;i<=Direction.BOTTOM_LEFT;i++){  //获取所有方向中可达性最高的

                var accessibility=this.getAccessibilityToEdge(this.catCircle,i);
                if(accessibility>maxVal){
                    maxVal=accessibility;
                    direction=i;
                }


        }
        if(maxVal<=-1){
            this.gameWin();
        }else{
            this.moveCatTowards(direction);
            if(!this.isCatSurrounded){
                if(!this.canExitAt(this.catCircle)){
                    this.isCatSurrounded=true;
                    this.setCatCircle(this.catCircle.cx,this.catCircle.cy);
                }
            }

        }

    }

    /*
    将猫向某方向移动
     */
    private moveCatTowards(direction:Direction){
        var newPositon=this.getCircleNeighbor(this.catCircle,direction);//新的cat位置
        if(this.catCircle.getStatus()!==CircleStatus.Blocked){
            this.catCircle.setStatus(CircleStatus.Available);//旧的位置还原成available状态
        }

        this.setCatCircle(newPositon.cx,newPositon.cy);
        this.step++;
    }

    /*
    获取某circle在某方向的可达性值
     */
    private getAccessibilityToEdge(circle:Circle,direction:Direction){
        var ngb:Circle=circle;
        var distance=0;
        var isBlocked:Boolean=true;
        while(true){
            distance++;
            ngb=this.getCircleNeighbor(ngb,direction);
            if(ngb.getStatus()===CircleStatus.Blocked){
                isBlocked=true;
                break;
            }else if(this.isCircleAtEdge(ngb)){
                isBlocked=false;
                break;
            }

        }
        if(distance===0){
            distance=-1;//第一步即遇上障碍,可达性设为最小
        }else if(isBlocked){
            distance=(-1)/distance;
        }else{
            distance=1/distance;
        }
        return distance;
    }


    private getCircleNeighbor(circle:Circle,direction:Direction):Circle{
        switch (direction){
            case Direction.LEFT:
                return this.getCircleAt(circle.cx-1,circle.cy);
            case Direction.RIGHT:
                return this.getCircleAt(circle.cx+1,circle.cy);
            case Direction.TOP_LEFT:
                var newX=circle.cy%2?circle.cx:circle.cx-1;
                return this.getCircleAt(newX,circle.cy-1);
            case Direction.TOP_RIGHT:
                var newX=circle.cy%2?circle.cx+1:circle.cx;
                return this.getCircleAt(newX,circle.cy-1);
            case Direction.BOTTOM_LEFT:
                var newX=circle.cy%2?circle.cx:circle.cx-1;
                return this.getCircleAt(newX,circle.cy+1);
            case Direction.BOTTOM_RIGHT:
                var newX=circle.cy%2?circle.cx+1:circle.cx;
                return this.getCircleAt(newX,circle.cy+1);
            default:
                return null;
        }
    }


    private canExitAt(circle:Circle):boolean{
        var ignoreArr=[];//不用再处理的circle集合
        var toDealWithArr=[circle];//还需进行判断的circle集合
        while(true){
            if(toDealWithArr.length<1){
                return false;
            }else{
                var _first=toDealWithArr.shift();
                ignoreArr.push(_first);
                if(_first.getStatus()!==CircleStatus.Blocked&&this.isCircleAtEdge(_first)){
                    return true;
                }else{
                    for(var i=Direction.LEFT;i<=Direction.BOTTOM_LEFT;i++){
                        var nbr=this.getCircleNeighbor(_first,i);
                        if(!(ignoreArr.indexOf(nbr)>-1||toDealWithArr.indexOf(nbr)>-1))
                        if(nbr.getStatus()!==CircleStatus.Available){
                            ignoreArr.push(nbr);
                        }else{
                            toDealWithArr.push(nbr);
                        }
                    }
                }
            }
        }

    }

    private gameWin() {
        var evt=new GameEvent(GameEvent.GAME_OVER);
        evt.data={
            result:GameResult.WIN,
            step:this.step
        }
        this.dispatchEvent(evt);
    }

    private gameLose(){
        var evt=new GameEvent(GameEvent.GAME_OVER);
        evt.data={
            result:GameResult.FAIL
        }
        this.dispatchEvent(evt);
    }
}