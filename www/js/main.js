var canAllowToRotate = false;
var allowedToRotate = false;
var lastWidth = 0;
var lastHeight = 0;
var windowOrientation = 0;

var normalState = "initialize";
var graphState = "#graph";
var graphActive = false;

var currentDate = null;
var lastSmokeDate = null;
var cigaretteCount = 1;

var graphLoadedFirstTime = true;
var saveHeight = 0;

var firstTimeSlipup = true;
var emptyDay = false;

var pushNotification = "";
var newNotification = false;

var googleAnalytics = null;                                        

// JavaScript Document
$(document).bind("mobileinit", function(){
    $.mobile.defaultPageTransition = 'none';
});

// One finger scroll fix
jQuery.fn.oneFingerScroll = function() {
    var scrollStartPos = 0;
    $(this).bind('touchstart', function(event) {
        // jQuery clones events, but only with a limited number of properties for perf reasons. Need the original event to get 'touches'
        var e = event.originalEvent;
        scrollStartPos = $(this).scrollTop() + e.touches[0].pageY;
        //e.preventDefault();
    });
    $(this).bind('touchmove', function(event) {
        var e = event.originalEvent;
        $(this).scrollTop(scrollStartPos - e.touches[0].pageY);
        e.preventDefault();
    });
    return this;
};

// One finger horizontal scroll fix
jQuery.fn.horizontalScroll = function() {
    var scrollStartPos = 0;
    $(this).bind('touchstart', function(event) {
        // jQuery clones events, but only with a limited number of properties for perf reasons. Need the original event to get 'touches'
        var e = event.originalEvent;
        scrollStartPos = $(this).scrollLeft() + e.touches[0].pageX;
        //e.preventDefault();
    });
    $(this).bind('touchmove', function(event) {
        var e = event.originalEvent;
        $(this).scrollLeft(scrollStartPos - e.touches[0].pageX);
        e.preventDefault();
    });
    return this;
};

// Initialize on DOM ready
$(document).ready(function(e)
{
    $('#summary-list').horizontalScroll(); 
});

function place()
{
    if(graphLoadedFirstTime)
    {
        saveHeight = screen.width;
        if(screen.height < screen.width)
            saveHeight = screen.height;
        
        if(screen.height < screen.width)
            graphLoadedFirstTime = false;
    }
    
    var headerHeight = $('.chart-header').height();
    
    $('.graph-content').css('height', ((saveHeight - headerHeight) + 5) + 'px');
    $('.graph-canvas').css('height', ((saveHeight - headerHeight) + 5) + 'px');
    $('#map-container').css('height', ((saveHeight - headerHeight) + 3) + 'px');
}
 
function initializeApp()
{   
    hideProgressBox();
    
    window.addEventListener("resize", checkOrientation, false);
    window.addEventListener("orientationchange", checkOrientation, false);     
         
    document.addEventListener("deviceready", onDeviceReady, false);
    hookPages();
}

function onDeviceReady()
{
    place();
    
    loadAppData(showTriggers, showGettingStarted);
    onTriggerChange = saveAppData;
    onHistoryChange = addHistory;
    
    initGraph();
    
    pushNotificationFunc = setPushNotification;
    
    trigger_dialogBox = showDialog;
    trigger_hideDialog = hideDialog;
    map_dialogBox = showDialog;
    facebook_dialogBox = showDialog;
    
    Date.prototype.getMonthName = function() {
        var m = ['Janv','Févr','Mars','Avr','Mai','Juin','Juil',
        'Août','Sept','Oct','Nov','Déc'];

        //var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul',
        //'Aug','Sept','Oct','Nov','Dec'];
        return m[this.getMonth()];
    } 
    Date.prototype.getDayName = function() {
        var d = ['Dim','Lu','Ma','Me',
        'Jeu','Vend','Sam'];
        
        //var d = ['Sun','Mon','Tue','Wed',
        //'Thu','Fri','Sat'];
        return d[this.getDay()];
    }
    
    $('.graph-overlay-container').live('swipeleft', function(event)
    {
        if($("#graph-overlay-container").scrollview("getScrollPosition").x > $("#graph-canvas").width() - $("#graph-overlay-container").width() - 5)
            showGraphNextDay();
    });
    
    
    $('.graph-overlay-container').live('swiperight', function(event)
    {
        if($("#graph-overlay-container").scrollview("getScrollPosition").x < 5)
            showGraphPreviousDay();
    });
    
    $('.custom').live('swipeleft', function(event)
    {
        var visible = $(this).find('.triggers-delete').is(':visible');
        var deleteObjs = $('.triggers-delete');
        if(deleteObjs != null) deleteObjs.toggle(false);

        if(!visible)
            $(this).find('.triggers-delete').show("slide", { direction: "right" }, 200);

        event.preventDefault();
    });
    
    $('.custom-trigger-input').live( "focus", function() {
        if($(this).val() == 'Ajoutez votre déclencheur personnel'){
            $(this).val(''); //Aêli-a mûéáèà
        }
    });
    
    $('.custom-trigger-input').live( "blur", function() {
        if($(this).val() == ""){
            $(this).val('Ajoutez votre déclencheur personnel');
        }
    });    
    
    Facebook_Initialize();
    graphPostToFacebook = trophyPosting;
    
    startWatchingPosition();
    
    document.addEventListener("resume", onResume, false);
    document.addEventListener("pause", onPause, false);
    
    window.plugins.googleAnalyticsPlugin.startTrackerWithAccountID("UA-3782432-12'"); // Lush
    //window.plugins.googleAnalyticsPlugin.startTrackerWithAccountID("UA-28235977-1");    // Test
    
    
    $('.custom-trigger-input').keypress(function(e)
    {
        if(e.which == 13) {
        jQuery(this).blur();
        jQuery('.custom-trigger-submit').focus().click();
    }
    });
}

function onPause()
{
    if($('.ui-page-active').attr('id') == "getting_started")
        return;
    
    if(( window.orientation == -90 || window.orientation == 90 ))
        normalState = "#triggers";
    else if($.mobile.activePage != "#triggers")
    {
        $.mobile.changePage($("#triggers"), { transition: "none"} );
    }
    
    $("#trigger-scroll").scrollview("resetScrollSize");
    $("#trigger-scroll").scrollview("scrollTo", 0, 0, 0);
}

function onResume()
{
    if($('.ui-page-active').attr('id') == "getting_started")
        return;
        
    if(!( window.orientation == -90 || window.orientation == 90 ))
    {
        checkPushNotification(null, null);
        checkPushNotification(null, null);
    }
    else
    {
        if($('.ui-page-active').attr('id') == "chart")
        {
            onChartLoad(1,2);
            $("#summary-list-wrapper").scrollview("resetScrollSize");
            $("#summary-list-wrapper").scrollview("scrollTo", 0, 0, 0);
        }
    }
 }

function hookPages()
{    
    $( '#triggers' ).live( 'pageinit', onTriggersLoad );
    
    var infoDiv = document.getElementById('bubble');   
    
    if(infoDiv != null)
        $(infoDiv).hide();
    
    $( '#slip-up' ).live( 'pageinit', onSlipupLoad );
    $( '#graph' ).live( 'pageshow', onGraphLoad );
    $( '#map' ).live( 'pageshow', onMapLoad );
	$( '#triggers' ).live( 'pageshow', checkPushNotification);
    $( '#trigger_generic' ).live( 'pageshow', onGenericCravingLoad);
    
    $('.graph-overlay-container').live( 'touchstart', onGraphSwipe);
    
    //Slipups

    $( '#slip-base' ).live( 'pageshow', onBaseSlip);
    $( '#slip-angry' ).live( 'pageshow', onAngrySlip );
    $( '#slip-bored' ).live( 'pageshow', onBoredSlip );
    $( '#slip-cant-concentrate' ).live( 'pageshow', onConcentrateSlip );
    $( '#slip-cant-relax' ).live( 'pageshow', onRelaxSlip );
    $( '#slip-with-smokers' ).live( 'pageshow', onSmokersSlip );
    $( '#slip-stressed' ).live( 'pageshow', onStressedSlip );
    $( '#slip-stuffed' ).live( 'pageshow', onStuffedSlip );
    $( '#slip-tipsy' ).live( 'pageshow', onTipsySlip );
}

function checkOrientation()
{
    if(allowedToRotate && hasSizeChanged())
    {
        reactToOrientationChange();
    }
}

function hasSizeChanged()
{
    var myWindowOrientation = window.orientation;
    
    if(windowOrientation != myWindowOrientation)
    {
        windowOrientation = myWindowOrientation;
        return true;
    }
    
    return false;
}

function reactToOrientationChange()
{
    
    if(( window.orientation == -90 || window.orientation == 90 ))
    {
        //Landscape
        $('.lightbox').hide();	//We hide the notification window when turning to landscape view.
        enterGraph();
    }
    else
    {
        //Portrait
        leaveGraph();
        //$.mobile.fixedToolbars.show(false);
    }
}

function setRotationAllowed(value)
{
    allowedToRotate = value;
}

function showGettingStarted()
{
    $.mobile.changePage($("#getting_started"), { transition: "none"} );

    currentDate = new Date();
    
    document.getElementById('date_last_cig_smoked_day').value = currentDate.getDate();
    document.getElementById('date_last_cig_smoked_month').value = currentDate.getMonth();
    document.getElementById('date_last_cig_smoked_year').value = currentDate.getFullYear();

    $(document.getElementById('date_last_cig_smoked_day')).selectmenu("refresh",true);
    $(document.getElementById('date_last_cig_smoked_month')).selectmenu("refresh",true);
    $(document.getElementById('date_last_cig_smoked_year')).selectmenu("refresh",true);
    
    $("#getting_started-scroll").scrollview("resetScrollSize");
}

//Check to see if any parametre fails the submit button.
function checkEnableDone()
{
    currentDate = new Date();
    
    var day = document.getElementById('date_last_cig_smoked_day').value;
    var month = document.getElementById('date_last_cig_smoked_month').value;
    var year = document.getElementById('date_last_cig_smoked_year').value;
    
    if(day == "jour" || month == "moise" || year == "année")//day == "day" || month == "month" || year == "year")
    {
        $(document.getElementById('DoneButton')).css('visibility', 'hidden');
        return;
    }
    
    lastSmokeDate = new Date(year, month, day);
    
    if(lastSmokeDate == null || lastSmokeDate > currentDate)
        $(document.getElementById('DoneButton')).css('visibility', 'hidden');
    else
        $(document.getElementById('DoneButton')).css('visibility', 'visible');
}


function showInstructions(showBack, hideFacebookShare)
{
    pageBeforeInstructions = $.mobile.activePage;
    $.mobile.changePage($("#instructions"), { transition: "none"} );
    
    $("#instructions-content").scrollview("resetScrollSize");
    $("#instructions-content").scrollview("scrollTo", 0, 0, 0);
    
    if(showBack)
    {
        window.plugins.googleAnalyticsPlugin.trackEvent("Overlay", "help", "", 0);
        $(document.getElementById('BackButton')).show();
    }
    else
    {
         $(document.getElementById('BackButton')).hide();
    }
}

var pageBeforeInstructions;
function leaveInstructions()
{
    $.mobile.changePage($(pageBeforeInstructions), { transition: "none"} );
}

function showTriggers()
{
    $.mobile.changePage($("#triggers"), { transition: "none"} );
    $("#trigger-scroll").scrollview("resetScrollSize");
    allowedToRotate = true;
    setTimeout("reactToOrientationChange()", 100);
}

function getPreviousPage()
{
    history.back();
    
    return false;
}

function showAllSlipupsOnMap()
{
    if(!navigator.onLine)
    {
        map_dialogBox("La connexion au réseau n’est pas disponible. Veuillez réessayer plus tard.");
        return;
    }

    var markers = new Array();
    
    var totalLat = 0.0, totalLng = 0.0;
    var showingSlipups = 0;
    
    for(var index = historyTree.length-1; index >= 0; --index)
    {
        var node = historyTree[index];
        if(node.type == 2 && (node.longitude != 0.0 || node.latitude != 0.0))
        {
            ++showingSlipups;
            if(totalLat == 0 && totalLng == 0)
            {
                totalLat = node.latitude;
                totalLng = node.longitude;
            }
            
            
            markers.push(getLatLngObj(node.latitude, node.longitude));
            
            if(showingSlipups >= 10)
                break;
        }
    }
    
    if(markers.length == 0)
    {
        showDialog("Aucun emplacement trouvé qui provoque une rechute.");//No slip-ups with known locations were found.");
        return;
    }
    
    showMarkerArray(totalLat, totalLng, markers);
}

function showChart()
{
    window.plugins.googleAnalyticsPlugin.trackEvent("Inbound", "pie_chart", "", 0);
    $('#graph-canvas').hide();
    onChartLoad(1,2);
    $.mobile.changePage($("#chart"), { transition: "none"} );
    $("#summary-list-wrapper").scrollview("resetScrollSize");
    $("#summary-list-wrapper").scrollview("scrollTo", 0, 0, 0);
}

function clearGraph()
{
    $('#graph-canvas').hide();
}

function showGraph()
{
    $.mobile.changePage($("#graph"), { transition: "none"} );
}

function enterGraph()
{
    if(graphActive)
        return;
    
    clearGraph();
    
    normalState = $.mobile.activePage;
    $.mobile.changePage($(graphState), { transition: "none"} );
    
    if($('.ui-page-active').attr('id') == "chart")
    {
        onChartLoad(1,2);
        $("#summary-list-wrapper").scrollview("resetScrollSize");
        $("#summary-list-wrapper").scrollview("scrollTo", 0, 0, 0);
    }
    
    graphActive = true;
}


function leaveGraph()
{
    if(normalState == "initialize" || !graphActive)
        return;    
    
    graphState = $.mobile.activePage;
    $.mobile.changePage($(normalState), { transition: "none"} );
    
    graphActive = false;
}



function isGraphPage(page)
{
    if(page == "#graph")
        return true;
    
    return false;
}


function isNormalPage(page)
{
    if(page == "#getting_started")
        return true;
    else if(page == "#instructions")
        return true;
    else if(page == "#triggers")
        return true;
    
    return false;
}


//START    //////////////////////////////// PAGE LOAD EVENTS ////////////////////////////

function onGraphLoad(event, obj)
{
    place();
    
    if(graphCurrentDate == null)
    {
        var formatDate = new Date();
        graphCurrentDate = new Date(formatDate.getFullYear(), formatDate.getMonth(), formatDate.getDate());
    }
    
    if(loadGraphData(graphCurrentDate, 0, -1))
        drawGraph(true);
}

function loadGraphData(date, emptyDays, direction)
{   
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    
    graphSlips = 0;
    
    graphCurrentDate = date;
    
    boundHistory = [];
    drawableTriggers = [];
    drawableTriggers.push([0, 0.0]);    
    
    var triggersToday = 1;
    var triggerIcons = 0;
    
    var trophysArray = getTrophiesOfDate(date);
    for(var i = 0; i < trophysArray.length; ++i)
    {
        drawableTriggers.push([triggersToday, 2.5]);
        boundHistory.push(trophysArray[i]);
        ++triggersToday;
        ++triggerIcons;
    }
    
    var first = true;
    var addedLast = false;
    var foundPrev = false;
    var laterDate = null;
    var prevDate = null;
    
    for(var index = 0; index < historyTree.length; ++index)
    {
        var historyNode = historyTree[index];
        
        var historyDate = new Date(historyNode.date.getFullYear(), historyNode.date.getMonth(), historyNode.date.getDate()); 
        
        if(!addedLast && (date - historyDate) < 0)
        {     
            laterDate = new Date(historyDate.getFullYear(), historyDate.getMonth(), historyDate.getDate());
            
            var endPos = triggersToday;
            if(graphSlips > 0)
                endPos += 2;
            
            if(historyNode.type == 0)
                drawableTriggers.push([endPos, 2.5]);
            else if(historyNode.type == 1)
                drawableTriggers.push([endPos, 1.5]);
            else if(historyNode.type == 2)
                drawableTriggers.push([endPos, 0.5]);
            
            addedLast = true;
            
            break;
        }
        
        if( year != historyDate.getFullYear() ||
            month != historyDate.getMonth()  ||
            day != historyDate.getDate())
        {   
            prevDate = new Date(historyDate.getFullYear(), historyDate.getMonth(), historyDate.getDate());
            
            if(historyTree[index].type == 0)
                drawableTriggers[0] = [0, 2.5];
            else if(historyTree[index].type == 1)
                drawableTriggers[0] = [0, 1.5];
            else if(historyTree[index].type == 2)
                drawableTriggers[0] = [0, 0.5];
            
            foundPrev = true;
            
            continue;
        }        
        
        if(historyNode.type == 0)
            drawableTriggers.push([triggersToday, 2.5]);
        else if(historyNode.type == 1)
            drawableTriggers.push([triggersToday, 1.5]);
        else if(historyNode.type == 2)
        {
            drawableTriggers.push([triggersToday, 0.5]);
            ++graphSlips;
        }
        
        boundHistory.push(historyNode);
        ++triggerIcons;
        ++triggersToday;
    }
    
    var endPos = triggersToday;
    if(graphSlips > 0)
        endPos += 2;    
    
    var tempDate = new Date(graphCurrentDate.getFullYear(), graphCurrentDate.getMonth(), graphCurrentDate.getDate());
    
    var tempEndDate = new Date();
    tempEndDate = new Date(tempEndDate.getFullYear(), tempEndDate.getMonth(), tempEndDate.getDate());    
        
    while(tempDate < tempEndDate)
    {
        tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate() + 1);
        
        if(laterDate != null && tempDate > laterDate)
            break;
        
        if(getTrophiesOfDate(tempDate).length > 0)
        {
            if(addedLast)
            {
                laterDate = tempDate;
                drawableTriggers[drawableTriggers.length-1] = [endPos, 2.5];
            }
            else
            {
                laterDate = tempDate;
                drawableTriggers.push([endPos, 2.5]);
                addedLast = true;
            }           
            break;
        }
    }
    
    tempDate = new Date(graphCurrentDate.getFullYear(), graphCurrentDate.getMonth(), graphCurrentDate.getDate());
    
    var tempStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    while(tempDate > tempStartDate)
    {
        tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate() - 1);

        if(prevDate != null && tempDate <= prevDate)
            break;
        
        if(getTrophiesOfDate(tempDate).length > 0)
        {   
            prevDate = tempDate;
            drawableTriggers[0] = [0, 2.5];
            break;
        }
    }
    
    if(!addedLast)
        drawableTriggers.push(drawableTriggers[drawableTriggers.length-1]);
    
    var width = 0;
    
    if(triggersToday > 5)
    {
        var graphObj = document.getElementById('graph-canvas');
        
        if(graphSlips > 0)
            width = 25;
        width += (100 + (endPos - 5) * 25);
    }
    else
    {
        if(triggerIcons == 2 && graphSlips > 0)
        {
            width = 120;
        }
        else if(triggerIcons == 3 && graphSlips > 0)
        {
            width = 140;
        }
        else if(triggerIcons == 4 && graphSlips > 0)
        {
            width = 170;
        }
        else
            width = 100;
    }
    
    width += "%";

    var graphObj = document.getElementById('graph-canvas');
    
    graphObj.style.width=width;   
    
    var currentDayObj = document.getElementById('graph-current-day');  
    var curDay = getDaysSinceStart(graphCurrentDate) + 1;
    --emptyDays;
    
    if(direction == 0 && emptyDays > 0)
    {
        var sDate = new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate() + curDay);
        var eDate = new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate() + curDay + emptyDays);
        document.getElementById('graph-currentday-field').innerHTML = getDateFormatFrom(sDate, eDate);
        currentDayObj.innerHTML = curDay + "-" + (curDay + emptyDays);
    }
    else if(direction == 1 && emptyDays > 0)
    {
        var sDate = new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate() + curDay - emptyDays);
        var eDate = new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate() + curDay);
        document.getElementById('graph-currentday-field').innerHTML = getDateFormatFrom(sDate, eDate);
        currentDayObj.innerHTML = (curDay - emptyDays) + "-" + curDay;    
    }
    else if((direction != -1 && emptyDays == 0) || thisDayHaveTriggers(graphCurrentDate))
    {
        document.getElementById('graph-currentday-field').innerHTML = getDateFormat(graphCurrentDate);
        currentDayObj.innerHTML = curDay;
    }
    else
    {        
        var startDayNum = 0;
        var endDayNum = 0;
        
        if(prevDate == null)
            startDayNum = 1;
        else
            startDayNum = getDaysSinceStart(prevDate) + 1;
        
        if(laterDate == null)
        {
            endDayNum = getDaysSinceStart(tempEndDate) + 1;
            graphCurrentDate = tempEndDate;
        }
        else
            endDayNum = getDaysSinceStart(laterDate);
        
        if(endDayNum - startDayNum <= 1)
        {
            document.getElementById('graph-currentday-field').innerHTML = getDateFormat(graphCurrentDate);
            currentDayObj.innerHTML = endDayNum;
        }
        else
        {
            var sDate = new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate() + startDayNum + 1);
            var eDate = new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate() + endDayNum);
            document.getElementById('graph-currentday-field').innerHTML = getDateFormatFrom(sDate, eDate);

            currentDayObj.innerHTML = (startDayNum + 1) + "-" + endDayNum; 
        }
    }
        
    return true;
}

function getDateFormat(date)
{
    return date.getDate()+ " " + date.getMonthName() + ", " + date.getFullYear();
}

function getDateFormatFrom(from, to)
{
    var dateString = "";
    
    var tempDate = new Date(from.getFullYear(), from.getMonth(), from.getDate() - 1);
    
    dateString = tempDate.getDate() + " " + tempDate.getMonthName() +  ", " + tempDate.getFullYear() + " à ";//" to ";
    tempDate = new Date(to.getFullYear(), to.getMonth(), to.getDate() - 1);
    dateString += tempDate.getDate() + " " + tempDate.getMonthName() + ", " + tempDate.getFullYear();
    
    return dateString;
}

function thisDayHaveTriggers(date)
{
     var year = date.getFullYear();
     var month = date.getMonth();
     var day = date.getDate();
     
    
    var formatDate = new Date(year, month, day);
    
     var trophysArray = getTrophiesOfDate(formatDate);
     if(trophysArray.length > 0)
        return true;
     
     for(var index = 0; index < historyTree.length; ++index)
     {
         var historyNode = historyTree[index];
     
         if(year != historyNode.date.getFullYear() ||
            month != historyNode.date.getMonth()  ||
            day != historyNode.date.getDate())
            continue;    
     
         return true;
     }
     
     return false;
}

function showGraphPreviousDay()
{      
    var tempDate = new Date(graphCurrentDate.getFullYear(), graphCurrentDate.getMonth(), graphCurrentDate.getDate());
    
    var dayIsEmpty = !thisDayHaveTriggers(tempDate);
    
    var tempStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());    
    
    if(!(tempDate > tempStartDate || tempDate < tempStartDate))
        return;
    
    var emptyDays = 0;
    var prevDate = tempDate;
     while(tempDate > tempStartDate)
     {
         tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate() - 1);
         if(thisDayHaveTriggers(tempDate))
        {
            if(emptyDays > 0 && !dayIsEmpty)
                tempDate = prevDate;
            else
                emptyDays = 0;
            break;
        }
        prevDate = tempDate;
        ++emptyDays;
     }
        
     if(tempDate < tempStartDate)
        return;
    
     if(loadGraphData(tempDate, emptyDays, 0))
        drawGraph(false);
}

function showGraphNextDay()
{ 
    var tempDate = new Date();
    tempDate.setFullYear(graphCurrentDate.getFullYear(), graphCurrentDate.getMonth(), graphCurrentDate.getDate());

    var dayIsEmpty = !thisDayHaveTriggers(tempDate);
    
    var tempEndDate = new Date();    
    tempEndDate = new Date(tempEndDate.getFullYear(), tempEndDate.getMonth(), tempEndDate.getDate());
    
    if(tempDate == tempEndDate)
        return;
    
    var emptyDays = 0;
    var prevDate = tempDate;
    while(tempDate < tempEndDate)
    {
        tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate() + 1);
        if(thisDayHaveTriggers(tempDate))
        {
            if(emptyDays > 0 && !dayIsEmpty)
                tempDate = prevDate;
            else
                emptyDays = 0;
            break;
        }
        prevDate = tempDate;
        ++emptyDays;
    }
    
    if(tempDate > tempEndDate)
        return;
    
    if(loadGraphData(tempDate, emptyDays, 1))
        drawGraph(true);
}

function onChartLoad(event, obj)
{
    document.getElementById('bootyCallCount').innerHTML = "" + Math.round( getTimeSinceSmoke() );

    document.getElementById('dumpedCigarettesCount').innerHTML = "" + Math.round( getDumpedCigarettes() );

    var mSave = (Math.round( getSavedMoney() * 100) / 100).toFixed(2);
    mSave = mSave.split(".");
    var mSavePart1 = mSave[0];
    var mSavePart2 = mSave[1];
    
    document.getElementById('savedMoneyCount').innerHTML = "<span class='small-upper'></span>" + mSavePart1 + "<span class='small-upper'>," + mSavePart2 + "</span>$";
    
    var mlSave = (Math.round( getMoneyLeftToSave() * 100) / 100).toFixed(2);
    mlSave = mlSave.split(".");
    var mlSavePart1 = mlSave[0];
    var mlSavePart2 = mlSave[1];
    
    document.getElementById('leftToSave').innerHTML = "<span class='small-upper'></span>" + mlSavePart1 + "<span class='small-upper'>," + mlSavePart2 + "</span>$";

    document.getElementById('cravingCount').innerHTML = "" + Math.round( getTotalCravings() );

    document.getElementById('slipupCount').innerHTML = "" + Math.round( getTotalSlipUps() );

    document.getElementById('commonVulnerabilityTime').innerHTML = "" + getMostCommonCravingTime();

    document.getElementById('commonCraving').innerHTML = "" + getMostCommonCravingType();

    document.getElementById('commonSlipup').innerHTML = "" + getMostCommonSlipupType();
}

function onGenericCravingLoad(event, obj)
{
    $('#randomContent1').hide();
    $('#randomContent2').hide();
    $('#randomContent3').hide();
    
    var randomElement = "#randomContent";
    randomElement += Math.ceil(3*Math.random());
    
    $(randomElement).show();
}

function onMapLoad(event, obj)
{
    InitializeMap();
}

function onTriggersLoad()
{
    addLoadedTriggers();
}

function onSlipupLoad(event, obj)
{
    var slipupsList = document.getElementById('sel_slip_ups');
    $(slipupsList).val("#slip-stressed");
    $(slipupsList).selectmenu("refresh",true);
}

function showSlipups()
{
    if(!firstTimeSlipup)
    {
        var slipupsList = document.getElementById('sel_slip_ups');
        $(slipupsList).val("#slip-stressed");
        $(slipupsList).selectmenu("refresh",true);
    }
    $.mobile.changePage($("#slip-up"), { transition: "none"} );

    $("#slip-up-page-scroll").scrollview("resetScrollSize");
    $("#slip-up-page-scroll").scrollview("scrollTo", 0, 0, 0);
    firstTimeSlipup = false;
}

//SLIPUPS

function onBaseSlip()
{
    var myVal = getDaysUntillSlipup();
    var myString = myVal;
    if(myVal == 1)
        myString += " jour!";//day!";
    else
        myString += " jours!";//days!";
    document.getElementById('timeBeforeSlip').innerHTML = myString;
}

function onStressedSlip()
{
    var myVal = getDaysUntillSlipup();
    var myString = myVal;
    if(myVal == 1)
        myString += " jour!";//day!";
    else
        myString += " jours!";//days!";
    document.getElementById('stessedTimeBeforeSlip').innerHTML = myString;
}

function onBoredSlip()
{
    var myVal = getDaysUntillSlipup();
    var myString = myVal;
    if(myVal == 1)
        myString += " jour!";//day!";
    else
        myString += " jours!";//days!";
    document.getElementById('boredTimeBeforeSlip').innerHTML = myString;
}

function onTipsySlip()
{
    var myVal = getDaysUntillSlipup();
    var myString = myVal;
    if(myVal == 1)
        myString += " jour!";//day!";
    else
        myString += " jours!";//days!";
    document.getElementById('tipsyTimeBeforeSlip').innerHTML = myString;
}

function onConcentrateSlip()
{
    var myVal = getDaysUntillSlipup();
    var myString = myVal;
    if(myVal == 1)
        myString += " jour!";//day!";
    else
        myString += " jours!";//days!";
    document.getElementById('concentrateTimeBeforeSlip').innerHTML = myString;
}

function onRelaxSlip()
{
    var myVal = getDaysUntillSlipup();
    var myString = myVal;
    if(myVal == 1)
        myString += " jour!";//day!";
    else
        myString += " jours!";//days!";
    document.getElementById('relaxTimeBeforeSlip').innerHTML = myString;
}

function onStuffedSlip()
{
    var myVal = getDaysUntillSlipup();
    var myString = myVal;
    if(myVal == 1)
        myString += " jour!";//day!";
    else
        myString += " jours!";//days!";
    document.getElementById('stuffedTimeBeforeSlip').innerHTML = myString;
}

function onSmokersSlip()
{
    var myVal = getDaysUntillSlipup();
    var myString = myVal;
    if(myVal == 1)
        myString += " jour!";//day!";
    else
        myString += " jours!";//days!";
    document.getElementById('smokersTimeBeforeSlip').innerHTML = myString;
}

function onAngrySlip()
{
    var myVal = getDaysUntillSlipup();
    var myString = myVal;
    if(myVal == 1)
        myString += " jour!";//day!";
    else
        myString += " jours!";//days!";
    document.getElementById('angryTimeBeforeSlip').innerHTML = myString;
}



//END    //////////////////////////////// PAGE LOAD EVENTS ////////////////////////////



//SOCIAL COMMUNICATION

function trophyPosting(name, date)
{
var postMessage = getFacebookMessage(name);
    var appURL = getFacebookMessageURL(name);//"www.breakitoff.ca";
    var trophyURL = "http://staging.lushconcepts.com/fb/smoking/breakitoff.png";


    Facebook_Post(postMessage, appURL, trophyURL);
}


function postWeeklyUpdate()
{
    var date = new Date();
    
    var postMessage     = "Mes statistiques d’abandon hebdomadaires:";
    var appURL          = "htpp://www.breakitoff.ca/mobile-helper/breakitoff_fr.php?t=9" + getWeeklyProgressEnd(date);
    var trophyURL       = "http://staging.lushconcepts.com/fb/smoking/breakitoff.png";
    
    if(Facebook_Post(postMessage, appURL, trophyURL))
    {
    }
}

function showWeeklyProgress()
{
    var date = new Date();
    var weeklyProgress = getWeeklyProgress(date);
    
    
    $('.lightbox').show();
    
    $('.lightbox-btn-yes').show();
    $('.lightbox-btn-no').show();
    $('#fshare').hide();

    document.getElementById('lightboxCaption').innerHTML = "Aimeriez-vous partager vos progrès hebdomadaires sur Facebook?";
    //Would you like to share your weekly break-up status on Facebook?";
    
    document.getElementById('progressContent').innerHTML = weeklyProgress;
    
}

function hideProgressBox()
{
    $('.lightbox').hide();
}



var active_dialog = false;
function showDialog(message, button1, button2)
{
    active_dialog = true;
    
    $("#dimmed").show();
    $('.custom-dialog').show();
    
    document.getElementById('dialogText').innerHTML = message;
    
    
    $('#dialog_true').unbind('click');
    $('#dialog_true').click(hideDialog);
    
    if(button1 != null)
    {
        $('#dialog_true').click(button1);
    }
    
    if(button2 == null)
    {
        document.getElementById('dialog_true').innerHTML = "Ok";
        $('#dialog_false').hide();
    }
    else
    {
        document.getElementById('dialog_true').innerHTML = "Oui";//Yes
        $('#dialog_false').unbind('click');
        $('#dialog_false').click(button2);
        $('#dialog_false').click(hideDialog);
        
        $('#dialog_false').show();
    }
    
    var minHeight = $.mobile.activePage.height();
    $('#dimmed').css('min-height', minHeight + 'px');
    $(window).scrollTop(0);
}

function hideDialog()
{
    active_dialog = false;
    
    $('#dimmed').hide();
    $('.custom-dialog').hide();
        
}

function blockScrollDuringPopup(event)
{
    if(active_dialog)
        event.preventDefault();
}


function disableWebbScroll(event)
{    
    event.preventDefault();
}

///////// PUSH NOTIFICATION ////////////


function setPushNotification(value)
{
	pushNotification = value;
	newNotification = true;
}

function checkPushNotification(event, obj)
{
    $("#trigger-scroll").scrollview("resetScrollSize");
    $("#trigger-scroll").scrollview("scrollTo", 0, 0, 0);
    
	checkDailyNotification();
	
	
	if(newNotification)
	{        
		var notificationMessage = getNotificationMessage(pushNotification);
        
        
	    $('.lightbox').show();
	    
	    $('.lightbox-btn-yes').hide();
	    $('.lightbox-btn-no').hide();
	    $('#fshare').show();
	    
	    document.getElementById('lightboxCaption').innerHTML = "Vous vous êtes mérité un trophée!";//You earned a trophy!";
	    document.getElementById('progressContent').innerHTML = notificationMessage;
        
		newNotification = false;
	}
}

function postPushNotification()
{
	var postMessage     = getFacebookMessage(pushNotification);      
    var appURL          = getFacebookMessageURL(pushNotification);                
    var trophyURL       = "http://staging.lushconcepts.com/fb/smoking/breakitoff.png";
    
	
	if(Facebook_Post(postMessage, appURL, trophyURL))
	{
	}
}

///Content Related/////
var timerStart;
function startTimer()
{
    if(timerStart == null)
    {
        timerStart = new Date();
        
        //Change to stop button.
        var button = document.getElementById('button_timer');
        button.innerHTML = "Recommencer";
        button.setAttribute('onclick','stopTimer()');
    }
}

//var recordTime = 0;
function stopTimer()
{
    if(timerStart != null)
    {
        var timerStop = new Date();
        var timeSince = timerStop - timerStart;
        
        showNewRecord(timeSince);
        timerStart = null;
        
        //Change to start button.
        var button = document.getElementById('button_timer');
        button.innerHTML = "Débuter";
        button.setAttribute('onclick','startTimer()');
        
    }
}

function showNewRecord(time)
{
    var min = Math.floor(time / 60000);
    time = time % 60000;
    
    var sec = Math.floor(time / 1000);
    time = time % 1000;
    
    var hundreth = Math.floor(time / 100);
    
    if(min < 10)
        min = "0" + min;
    
    if(sec < 10)
        sec = "0" + sec;
    
    if(hundreth < 10)
        hundreth = "0" + hundreth;
    
    var formatTime = min + ":" + sec + "." + hundreth;
    
    showDialog("Votre temps a été de: " + formatTime, null,null);//"Your time was "
}
