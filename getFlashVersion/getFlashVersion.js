/**
 * [isSupportFlash description]
 * @return {number} [ -1（不支持flash） | flash版本号]
 */
function getFlashVersion() {
    var version = -1;
    if( window.ActiveXObject ) {
        try{
            var swf = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            version = parseInt( swf.GetVariable("$version").split(" ")[1].split(",")[0]);
        }
        catch(e){}
    }
    else{
        if( navigator.plugins && navigator.plugins["Shockwave Flash"] ) {
            var arr = navigator.plugins['Shockwave Flash'].description.split(' ');
            var i = 0;
            var length = arr.length;
            if ( arr ) {
                for ( ; i < length ; i++) {
                    if (!isNaN( Number(arr[i]) )) {
                        version = Number(arr[i]);
                        break;
                    }
                }
            }
        }
    }
    return version;
}