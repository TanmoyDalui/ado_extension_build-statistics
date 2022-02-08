function getRootUri() {
    var webContext = VSS.getWebContext();
    var hostContext = (webContext.account || webContext.host);
    var rootUri = hostContext.uri;
    var relativeUri = hostContext.relativeUri;
    if (rootUri && relativeUri) {
        // Ensure both relative and root paths end with a trailing slash before trimming the relative path.
        if (rootUri[rootUri.length - 1] !== "/") {
            rootUri += "/";
        }
        if (relativeUri[relativeUri.length - 1] !== "/") {
            relativeUri += "/";
        }
        rootUri = rootUri.substr(0, rootUri.length - relativeUri.length);
    }
    return rootUri;
}


function getPreviousDate(duration){
    var today=new Date(); 
    var previousDate = new Date(today.setDate(today.getDate() - duration));
    var offset = previousDate.getTimezoneOffset()
    previousDate = new Date(previousDate.getTime() - (offset*60*1000))
    var preDateStr = previousDate.toISOString().split('T')[0] + "T00:00:00Z";
    //console.log(preDateStr);
    return preDateStr;
}


function getDateInMilliSec(dateString){
    var date = new Date(dateString);
    //var dateStr = date.toString();
    return date.valueOf();
}