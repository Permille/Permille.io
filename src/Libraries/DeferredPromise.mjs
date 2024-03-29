/**
 * This is a wrapper around the standard Promise to allow for nicer syntax when deferring promise resolutions. Example use:
 * <pre>
 *   const Wait = new DeferredPromise;
 *    setTimeout(function(){
 *      Wait.resolve();
 *    }, 1000);
 *    await Wait;
 *    console.log("1 second passed");
 * </pre>
 */
export default class DeferredPromise extends Promise{
  static{
    DeferredPromise.prototype.constructor = Promise;
  }
  constructor(Options = {}){
    let resolve, reject;
    super(function(Resolve, Reject){
      resolve = Resolve;
      reject = Reject;
    });
    this.State = 0;
    this.resolve = function(){
      this.State = 1;
      resolve();
    }.bind(this);
    this.reject = function(){
      this.State = 2;
      reject();
    }.bind(this);

    Object.defineProperties(this, {
      "IsPending":{
        "get": function(){
          return this.State === 0;
        }.bind(this)
      },
      "IsFulfilled":{
        "get": function(){
          return this.State === 1;
        }.bind(this)
      },
      "IsRejected":{
        "get": function(){
          return this.State === 2;
        }.bind(this)
      }
    });

    if(Options.Timeout){
      globalThis.setTimeout((Options.Throw ?? true ? this.reject : this.resolve).bind(this), +Options.Timeout);
    }
  }
};