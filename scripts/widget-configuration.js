var backgroundColor;
var $allCollectionCheckbox;
var $userId;
var $password;
var durationDropdown;
var statType = " for Current Project";
var statDuration = "During last 1 day(s)";

VSS.init({                        
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require("TFS/Dashboards/WidgetHelpers", 
    function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetConfigurationStyles();
        VSS.register("BuildStatWidget.Configuration", function () {  

            $backgroundColor = $("#backgroundColor");
            $allCollectionCheckbox = $("#all-collection");
            $userId = $("#user-id");
            $password = $("#password");
            $durationDropdown = $("#duration-dropdown");
            console.log("Inside configuration");

            return {
                load: function (widgetSettings, widgetConfigurationContext) {
                    var settings = JSON.parse(widgetSettings.customSettings.data);
                    
                    // Load stored settings data
                    if (settings) {
                        //console.log("inside if condition: " + settings.allCollection);
                        if (settings.backgroundColor){
                            $backgroundColor.val(settings.backgroundColor);
                        }
                        if (settings.allCollection){
                            $allCollectionCheckbox.prop("checked", settings.allCollection);
                        }
                        if (settings.userId){
                            $userId.val(settings.userId);
                        }
                        if (settings.password){
                            $password.val(settings.password);
                        }
                        if (settings.duration){
                            $durationDropdown.val(settings.duration);
                        }
                    }

                    // show or hide credentials based on allCollectionCheckbox checked status
                    enableCredentials($allCollectionCheckbox.is(':checked'));

                    $backgroundColor.on("change", function (){ 
                        fieldChangedEvent(WidgetHelpers, widgetConfigurationContext);
                    });

                    $allCollectionCheckbox.on("change", function (){ 
                        fieldChangedEvent(WidgetHelpers, widgetConfigurationContext);
                    });

                    $userId.on("change", function (){ 
                        fieldChangedEvent(WidgetHelpers, widgetConfigurationContext);
                    });

                    $password.on("change", function (){ 
                        fieldChangedEvent(WidgetHelpers, widgetConfigurationContext);
                    });

                    $durationDropdown.on("change", function (){ 
                        fieldChangedEvent(WidgetHelpers, widgetConfigurationContext);
                    });

                    return WidgetHelpers.WidgetStatusHelper.Success();
                },
                onSave: function() {
                    //console.log("Saved : " + $allCollectionCheckbox.is(':checked'));
                    var customSettings = {data: JSON.stringify({
                        backgroundColor: $backgroundColor.val(),
                        allCollection: $allCollectionCheckbox.is(':checked'),
                        userId: $userId.val(),
                        password: $password.val(),
                        duration: $durationDropdown.val(),
                        statType: statType,
                        statDuration: statDuration
                    })};
                    return WidgetHelpers.WidgetConfigurationSave.Valid(customSettings); 
                }
            }
        });
        VSS.notifyLoadSucceeded();
});



// Event fired for each of the field change and then refresh
function fieldChangedEvent(WidgetHelpers, widgetConfigurationContext){
    //console.log("Changed to " + $allCollectionCheckbox.is(':checked'));
    // show or hide credentials based on allCollectionCheckbox checked status
    enableCredentials($allCollectionCheckbox.is(':checked'));

    statDuration = "During last " + $durationDropdown.val() + " day(s)";

    var customSettings = {data: JSON.stringify({
        backgroundColor: $backgroundColor.val(),
        allCollection: $allCollectionCheckbox.is(':checked'),
        userId: $userId.val(),
        password: $password.val(),
        duration: $durationDropdown.val(),
        statType: statType,
        statDuration: statDuration
    })};


    if(!($allCollectionCheckbox.is(':checked')) || 
        ($allCollectionCheckbox.is(':checked') && $userId.val() && $password.val()) ){
        notifyConfiguration(WidgetHelpers, widgetConfigurationContext, customSettings);
    }
}


function notifyConfiguration(WidgetHelpers, widgetConfigurationContext, customSettings){
    var eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
    var eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
    widgetConfigurationContext.notify(eventName, eventArgs);
}


function enableCredentials(isChecked){
    //console.log("Show credentials? " + isChecked);
    // show and enable credentials
    if(!isChecked) { // if undefined or false
        //console.log("Hide credentials.");
        statType = " for Current Project";
        $("#credentials").hide();
    }else {
        //console.log("Show credentials.");
        statType = " for All Projects"
        $("#credentials").show();
    }
}