var clientId;
var clientSecret;
// var authorizationBasic = $.base64.btoa(clientId + ':' + clientSecret);
var authorizationBasic;

var noneCount = 0;
var successCount = 0;
var partialSuccessCount = 0;
var failureCount = 0;
var cancelCount = 0;

var totalProjectCount = 0;
var currentProjectCount = 0;

function resetCounters(){
    noneCount = 0;
    successCount = 0;
    partialSuccessCount = 0;
    failureCount = 0;
    cancelCount = 0;

    totalProjectCount = 0;
    currentProjectCount = 0;
}

function getCollections(userId, password, duration, ChartServices, callback){
    clientId = userId;
    clientSecret = password;
    authorizationBasic = window.btoa(clientId + ':' + clientSecret);
    //console.log("User ID: " + clientId + " :: Password: " + clientSecret);

    var minTime = getPreviousDate(duration);

    resetCounters();
    var request = new XMLHttpRequest();
    request.open("GET", getRootUri() + "/_apis/projectCollections?$top=1000", true);
    request.setRequestHeader('Authorization', 'Basic ' + authorizationBasic);
    request.send();

    request.onreadystatechange = function(){
        if (request.readyState === 4) {
            //alert(request.responseText);
            var responseObj = JSON.parse(request.responseText);
            var collectionCount = responseObj.value.length;
            responseObj.value.forEach(function (item, index) {
                //alert(item.name);
                //console.log(item.name);
                getProjects(ChartServices, item.name, minTime);
            });
    
        }
    };
}


function getProjects(ChartServices, collectionName, minTime){
    var request = new XMLHttpRequest();
    request.open("GET", getRootUri() + "/" + collectionName + "/_apis/projects?api-version=6.0", true);
    request.setRequestHeader('Authorization', 'Basic ' + authorizationBasic);
    request.send();

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            //alert(request.responseText);
            var responseObj = JSON.parse(request.responseText);
            var projectCount = responseObj.value.length;
            responseObj.value.forEach(function (item, index) {
                totalProjectCount++;
                getBuilds(ChartServices, collectionName, item.name, minTime);
            });
        }
    };
}


function getBuilds(ChartServices, collectionName, projectName, minTime){
    var request = new XMLHttpRequest();
    request.open("GET", getRootUri() + "/" + collectionName + "/" + projectName + "/_apis/build/builds?api-version=6.0&minTime=" + minTime, true);
    request.setRequestHeader('Authorization', 'Basic ' + authorizationBasic);
    request.send();

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            //alert(request.responseText);
            var responseObj = JSON.parse(request.responseText);
            var builds = responseObj.value;
            
            noneCount = noneCount + builds.reduce((acc, cur) => cur.result === BuildResult.None ? ++acc : acc, 0);
            successCount = successCount + builds.reduce((acc, cur) => cur.result === BuildResult.Succeeded ? ++acc : acc, 0);
            partialSuccessCount = partialSuccessCount + builds.reduce((acc, cur) => cur.result === BuildResult.PartiallySucceeded ? ++acc : acc, 0);
            failureCount = failureCount + builds.reduce((acc, cur) => cur.result === BuildResult.Failed ? ++acc : acc, 0);
            cancelCount = cancelCount + builds.reduce((acc, cur) => cur.result === BuildResult.Canceled ? ++acc : acc, 0);

            currentProjectCount++;

            //console.log(collectionName + " : " + projectName + "-" + successCount + "-" + failureCount);

            // Display the chart at last project of last collection
            if(currentProjectCount === totalProjectCount){
                displayChart(ChartServices, noneCount, successCount, partialSuccessCount, failureCount, cancelCount);
            }
        }
    };
}