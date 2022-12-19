import DeferredPromise from "../../Libraries/DeferredPromise.mjs";
export default class{
  constructor(){
    this.Thing = new DeferredPromise; //Example to show that es6 module importing works
    console.log("Works");
  }
};