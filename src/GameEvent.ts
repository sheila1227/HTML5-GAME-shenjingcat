/**
 * Created by sunjing on 15/8/4.
 */
class GameEvent extends egret.Event{
    public static GAME_START="game_start_event";//'游戏开始'事件
    public static GAME_OVER="game_over_event";//'游戏结束'事件
    public static GAME_MOVE_CAT="game_move_cat";//'游戏结束'事件

    public constructor(type:string, bubbles:boolean = false, cancelable:boolean = false){
        super(type,bubbles,cancelable);
    }
}