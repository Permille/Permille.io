export default class Version extends String{
  static RELEASE = 3;
  static BETA = 2;
  static ALPHA = 1;
  static DEV = 0;

  static Zero = new Version("0-dev");
  static Any = new Version("Any");
  #VersionString;
  #VersionType;
  constructor(VersionString){
    if(!/Any$|([0-9\.]+\+?)$|([0-9\.])+(a|b|\-dev)([0-9]*)\+?$/.exec(VersionString)) throw new Error("Badly formatted version");
    let FormattedString = "";
    if(Number.isNaN(Number.parseInt(VersionString))) FormattedString = "Any";
    else{
      const Numbers = VersionString.split(".").map(a => "" + Number.parseInt(a)).slice(0, 4);
      while(Numbers.length < 4) Numbers.push("");

      for(let i = 0; i < 4; ++i) FormattedString += Numbers[i].padStart(16, " ");
    }
    const VersionType = {
      "": Version.RELEASE,
      "b": Version.BETA,
      "a": Version.ALPHA,
      "-dev": Version.DEV
    }[/(?!([0-9\.]))(?<=Any|[0-9])(a|b|\-dev)?/.exec(VersionString)[0]];
    FormattedString += VersionType + ("" + Number.parseInt("0" + /[0-9]*\+?$/.exec(VersionString)[0])).padStart(16, " ") + /\+?$/.exec(VersionString)[0]; //This adds the development release number (e.g. 1.2.0a1 => 1, 0.0.6-dev13 => 13)
    super(FormattedString);

    this.#VersionString = VersionString;
    this.#VersionType = VersionType;
  }
  get s(){
    return this.#VersionString;
  }
  get VersionType(){
    return this.#VersionType;
  }
  toString(){
    return this.#VersionString;
  }
}
