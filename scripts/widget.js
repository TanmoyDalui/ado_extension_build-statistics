const BuildResult = {
    None: "none", //1,
    Succeeded: "succeeded", //2,
    PartiallySucceeded: "partiallySucceeded", //4,
    Failed: "failed", //8,
    Canceled: "canceled" //32
};

const BuildResultNumeric = {
    None: 1,
    Succeeded: 2,
    PartiallySucceeded: 4,
    Failed: 8,
    Canceled: 32
};

VSS.init({                        
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require(["TFS/Dashboards/WidgetHelpers", "TFS/Build/RestClient", "Charts/Services"], 
    function (WidgetHelpers, TFS_Build_WebApi, ChartServices) {
        WidgetHelpers.IncludeWidgetStyles();

        VSS.register("BuildStatWidget", function () {    
             
            var backgroundColor;
            var allCollection;
            var userId;
            var password;
            var duration = 1;
            var statType;
            var statDuration;
            //alert(VSS.getWebContext().collection.name);
            
            var getBuildCount = function (widgetSettings) {
                
                // Load the settings
                var settings = JSON.parse(widgetSettings.customSettings.data);

                if (!settings || !settings.allCollection) {
                    allCollection = false;
                } else {
                    allCollection = settings.allCollection;
                }

                if(settings) {
                    backgroundColor = settings.backgroundColor;
                    $("#widgetBody").css("background", backgroundColor);

                    duration = settings.duration;

                    statType = settings.statType;
                    $("#statType").text(statType);

                    statDuration = settings.statDuration;
                    $("#statDuration").text(statDuration);
                }

                // Display either all projects builds or current project builds
                if(allCollection){
                    // assign user id from settings
                    userId = settings.userId;
                    // assign password from settings
                    password = settings.password;

                    getCollections(userId, password, duration, ChartServices, displayChart);
                }else
                    getTotalBuilds(TFS_Build_WebApi, duration, ChartServices, displayChart);

                return WidgetHelpers.WidgetStatusHelper.Success();
                
            }

            return {
                load: function (widgetSettings) {
                    // Set widget title
                    var $title = $("#innerTitle");
                    $title.text(widgetSettings.name);
                    
                    showLoading();
                    return getBuildCount(widgetSettings);
                },
                reload: function (widgetSettings) {
                    // Set widget title
                    var $title = $("#innerTitle");
                    $title.text(widgetSettings.name);

                    showLoading();
                    return getBuildCount(widgetSettings);
                }
            }
        });
        VSS.notifyLoadSucceeded();
});

function getTotalBuilds(TFS_Build_WebApi, duration, ChartServices, callback){
    var projectId = VSS.getWebContext().project.id;
    //console.log("Project Name: " + projectId);
    // Get a Build REST client to make REST calls to Azure DevOps Services
    // https://docs.microsoft.com/en-us/previous-versions/azure/devops/extend/reference/client/api/tfs/build/restclient/buildhttpclient2_2#method_getBuilds
    TFS_Build_WebApi.getClient().getBuilds(projectId)
        .then(function (builds) {
            //console.log(JSON.stringify(builds));
            // Print the total build number
            var count = Object.keys(builds).length;
            
            var noneCount = builds.reduce((acc, cur) => (cur.result === BuildResultNumeric.None && getDateInMilliSec(cur.finishTime) > getDateInMilliSec(getPreviousDate(duration))) ? ++acc : acc, 0);
            var successCount = builds.reduce((acc, cur) => (cur.result === BuildResultNumeric.Succeeded && getDateInMilliSec(cur.finishTime) > getDateInMilliSec(getPreviousDate(duration))) ? ++acc : acc, 0);
            var partialSuccessCount = builds.reduce((acc, cur) => (cur.result === BuildResultNumeric.PartiallySucceeded && getDateInMilliSec(cur.finishTime) > getDateInMilliSec(getPreviousDate(duration))) ? ++acc : acc, 0);
            var failureCount = builds.reduce((acc, cur) => (cur.result === BuildResultNumeric.Failed && getDateInMilliSec(cur.finishTime) > getDateInMilliSec(getPreviousDate(duration))) ? ++acc : acc, 0);
            var cancelCount = builds.reduce((acc, cur) => (cur.result === BuildResultNumeric.Canceled && getDateInMilliSec(cur.finishTime) > getDateInMilliSec(getPreviousDate(duration))) ? ++acc : acc, 0);

            callback(ChartServices, noneCount, successCount, partialSuccessCount, failureCount, cancelCount);
        }, 
        function (error) {                            
            return WidgetHelpers.WidgetStatusHelper.Failure(error.message);
        }
    );
}

function displayChart(ChartServices, noneCount, successCount, partialSuccessCount, failureCount, cancelCount){
    // Create the chart
    ChartServices.ChartsService.getService().then(function(chartService){
        var $container = $('#Chart-Container');
        var chartOptions = { 
            "hostOptions": { 
                "height": "280", 
                "width": "300"
            },
            //"colorCustomizationOptions": {
                //"customColors": ["#FF0000", "#00CC00", "#302772", "#22CC00", "#00FF00"]
            //},
            "colorCustomizationOptions": {
                "customColors": [
                    {backgroundColor: "#7FB3D5", value: "None"},
                    {backgroundColor: "#00CC00", value: "Succeeded"},
                    {backgroundColor: "#F39C12", value: "PartiallySucceeded"},
                    {backgroundColor: "#FF0000", value: "Failed"},
                    {backgroundColor: "#808B96", value: "Canceled"}
                ]
            },
            "chartType": "pie",
            "series": [{
                "data": [noneCount, successCount, partialSuccessCount, failureCount, cancelCount]
            }],
            "xAxis": { 
                "labelValues": Object.keys(BuildResult) 
            }, 
            "specializedOptions": {
                "showLabels": "true",
                "size": 220
            } 
        };
        $container.html("");
        chartService.createChart($container, chartOptions);
    });
}

function showLoading(){
    var $container = $('#Chart-Container');
    $container.html('<div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"><img src="img/loading-2.gif" width="150" height="150" /></div>');
}
