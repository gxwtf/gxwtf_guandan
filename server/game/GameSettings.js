/**
 * 游戏设置配置类
 * @property {number} timeLimit=30 - 默认出牌时间（秒）
 * @property {unlimitedTime} unlimitedTime=false - 是否开启无时间限制
 * @property {boolean} tribute=true - 是否开启进贡模式
 * @property {'single'|'multi'} gameMode='multi' - 单局/多局模式
 */

export default class GameSettings {
    constructor() {
        this.timeLimit = 30;
        this.tribute = true;
        this.gameMode = 'multi';
        this.unlimitedTime = false;
    }
}