export class Clock {

    constructor(hour, minute){
        if (hour < 0 || 23 < hour) {
            throw Error("The hour argument must be between 0 and 23");
        } else {
            this._hour = hour
        }
        if (minute < 0 || minute > 60) {
            throw Error("Error: minute value must be >= 0 and < 60")
        } else {
            this._minute = minute
        }
    }
    
    tick(){
        this._minute++;
        if (this._minute == 60) {
            this._minute = 0
            this._hour = (this._hour + 1) % 24; 
        }   
    }
    
    set alarm(alarm) {
        this._alarmIsActive = true
        this._alarm = alarm
    }

    get alarm(){
        return this._alarm;
    }
    deactivateAlarm() {
        this._alarmIsActive = false
    }
    activateAlarm() {
        this._alarmIsActive = true
    }
    get isTriggered() {
        if(this._alarmIsActive){
            return (this.time.hour.toString().padStart(2, '0') + ':' + this.time.minute.toString().padStart(2, '0')) >= this._alarm
        }
    }
    
    get time() {
        return { hour: this._hour, minute: this._minute }
    }
}