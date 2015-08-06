/**
 * Created by sunjing on 15/8/4.
 */
class Util {
    /**
     * 获取舞台高度
     */
    public static getStageHeight():number {
        return egret.MainContext.instance.stage.stageHeight;
    }

    /*
     获取舞台宽度
     */
    public static getStageWidth():number {
        return egret.MainContext.instance.stage.stageWidth;
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    public static createBitmapByName(name:string):egret.Bitmap {
        var result:egret.Bitmap = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 根据name关键字创建一个MovieClip对象。name属性请参考resources/resource.json配置文件的内容。
     */
    public static createMovieClipByName(name:string):egret.MovieClip {

        var data_stay:any = RES.getRes(name + "_json");
        var texture_stay:egret.Texture = RES.getRes(name + "_png");
        var mcFactory_stay:egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data_stay, texture_stay);
        return new egret.MovieClip(mcFactory_stay.generateMovieClipData(name));

    }
}