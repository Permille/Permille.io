export default class EventPromise extends Promise{
  static{
    EventPromise.prototype.constructor = Promise;
  }
  constructor(TargetObject, EventName, Check = false){
    let resolve, reject;
    super(function(Resolve, Reject){
      resolve = Resolve;
      reject = Reject;
    });
    if(Check){
      resolve();
      return;
    }
    let State = 0;
    Object.defineProperties(this, {
      "IsPending":{
        "get": function(){
          return State === 0;
        }
      },
      "IsFulfilled":{
        "get": function(){
          return State === 1;
        }
      },
      "IsRejected":{
        "get": function(){
          return false;
        }
      }
    });
    if(TargetObject instanceof EventTarget) TargetObject.addEventListener(EventName, resolve, {"once": true});
    else throw new Error("Target object isn't instance of EventTarget");
  }
};

