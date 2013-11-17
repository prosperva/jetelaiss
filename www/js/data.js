var hasBeenRun = false;
var startDate = 0;
var timeSinceSmoke = 0;
var timeUntillSlipup;

var daysInYear = 365;
var milisecondsEachDay = 86400000;

var cigarettesEachDay = 1;
//var ciggarettCost = 0.97;
var packageCost = 10.0;
var ciggarettesInPackage = 25.0;
var breakUpMethod = "none";

var totalSlips = 0;
var totalCravings = 0;

var lastIndex = -1;
var historyTree = new Array();
var triggersToSave = 0;

var watchID;
var storedGeolocation;
var watchedLongitude = 0.0;
var watchedLatitude = 0.0;
var firstTime = false;

var pushNotificationFunc;
var lastNotificationDay = 0;

function startApp()
{
    startDate = new Date($("#date_last_cig_smoked_year").val(), $("#date_last_cig_smoked_month").val(), $("#date_last_cig_smoked_day").val());
    timeSinceSmoke = startDate;
    cigarettesEachDay = $("#num_cigs_smoked_per_day").val();
    breakUpMethod = $("#sel_breakup_methods").val();

    window.plugins.googleAnalyticsPlugin.trackEvent("Overlay", "cigarettes", cigarettesEachDay, cigarettesEachDay);
    window.plugins.googleAnalyticsPlugin.trackEvent("Overlay", "method", breakUpMethod, 0);

    sendAmountSmoked(cigarettesEachDay);
    
    firstTime = true;
    saveAppData();
}

function sendAmountSmoked(amount)
{
    //var ciggUrl = "http://corncrow.dev.datacraft.se/cigs.php?number=" + cigarettesEachDay;	//"http://www.breakitoff.ca/track/cigs?number=" + cigarettesEachDay;
    var ciggUrl = "http://breakitoff.ca/register-dumpings/?amount-smoked=" + amount + "&security-token=1abbbf474dd0b0779919621d53c56760";

    //alert("Start3");

    var xmlhttp = new XMLHttpRequest();
    /*
    xmlhttp.onreadystatechange=function()
    {
        if(xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            //document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
            alert(xmlhttp.responseText);
        }
    }
    */
    //alert("Start4");
    xmlhttp.open("GET",ciggUrl,true);
    xmlhttp.timeout = 5000;
    xmlhttp.send();

    //alert("Start4");
}


function englishTranslateMethod(name)
{
    if(name == "Le timbre")
        return "The Patch";
        
    if(name == "La gomme à la nicotine")
        return "Nicotine Gum";
        
    if(name == "L’inhaleur de nicotine")
        return "Nicotine Inhaler";

    if(name == "Les pastilles à la nicotine")
        return "Nicotine Lozenge";

    if(name == "L’acuponcture")
        return "Acupuncture";

    if(name == "L’hypnose")
        return "Hypnosis";

    if(name == "La thérapie par le laser")
        return "Laser Therapy";

    if(name == "Des médicaments prescrits")
        return "Prescription Medication";

    if(name == "La consultation téléphonique")
        return "Telephone Counselling";

    if(name == "La consultation en personne")
        return "In Person Counselling";

    if(name == "La consultation en ligne")
        return "Online Counselling";

    if(name == "Des programmes d’auto-assistance")
        return "Self Help Quitting";

    if(name == "Abstinence volontaire")
        return "Cold Turkey";
    
    return name;
}

function startWatchingPosition()
{
	var options = { frequency: 3000 };
	watchID = navigator.geolocation.watchPosition(watchSuccess, function() { }, options);
}

function watchSuccess(position)
{
    watchedLongitude = position.coords.longitude;
    watchedLatitude = position.coords.latitude;
}

function getDaysSinceStart(from)
{
    var today = from;
    var formatDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    var timeSince = today - formatDate;
    var daysSince = (timeSince+1) / milisecondsEachDay;
    
    return Math.round(daysSince);
}

//Used by SlipUp and Breakup Stats ( Booty-Calls ).
function getTimeSinceSmoke()
{
    var today = new Date();
    var timeSince = today - timeSinceSmoke;
    var daysSince = timeSince / milisecondsEachDay;
    
    return daysSince;
}

//Used by Breakup Stats ( Dumped Cigarettes )
function getDumpedCigarettes()
{
    var sinceStart = true;
    if(sinceStart)
    {
        var today = new Date();
        var timeSince = today - startDate;
        var daysSince = timeSince / milisecondsEachDay;
        var cigarettesDumped = daysSince * cigarettesEachDay;
        
        for(var i = 0; i < historyTree.length; ++i)
        {
            if(historyTree[i].type == 2)
            {
                --cigarettesDumped;
            }
        }
        
        if(cigarettesDumped < 0.0)
            return 0.0;
        
        return cigarettesDumped;
    }
    else
    {
        var timeSinceSmoke = getTimeSinceSmoke();
        
        return timeSinceSmoke * cigarettesEachDay;
    }
}

//Used by Breakup Stats ( I've Saved )
function getSavedMoney()
{
    var dumpedCigarettes = getDumpedCigarettes();
    return dumpedCigarettes * ( packageCost / ciggarettesInPackage ) ;
}

function getMoneyFromYear()
{
    var today = new Date();
    var calcDate = new Date(today.getFullYear(), 0, 1);
    
    if(calcDate < startDate)
    calcDate = startDate;
    
    var timeSince = today - calcDate;
    var daysSince = timeSince / milisecondsEachDay;
    var cigarettesDumped = daysSince * cigarettesEachDay;
    
    for(var i = 0; i < historyTree.length; ++i)
    {
        if(historyTree[i].type == 2 && historyTree[i].date > calcDate)
        {
            --cigarettesDumped;
        }
    }
    
    if(cigarettesDumped < 0.0)
        return 0.0;
    
    return cigarettesDumped * ( packageCost / ciggarettesInPackage );
}

//Used by Breakup Stats ( I've Saved )
function getMoneyLeftToSave()
{
    var moneyFromPrevious = getMoneyFromYear();
        
    var today = new Date();
    var nextYear = new Date(today.getFullYear()+1, 0, 1);
    
    var timeDifference = nextYear - today;
    
    var daysSince = timeDifference / milisecondsEachDay;
        
    var moneyFromNow = ( daysSince * cigarettesEachDay ) * ( packageCost / ciggarettesInPackage );
    
    return moneyFromPrevious + moneyFromNow;
}


function getTotalCravings()
{
    var cravingNumber = 0;
    
    for( var i = 0; i < historyTree.length; ++i)
    {
        if(historyTree[i].type == 1)
        {
            ++cravingNumber;
        }
    }
    
    /*
    0 == Trophies
    
    1 == cravings
    
    2 == Slipups
    */
    
    return cravingNumber;
}

function getTotalSlipUps()
{
    var slipupNumber = 0;    
    
    for( var i = 0; i < historyTree.length; ++i)
    {
        
        if(historyTree[i].type == 2)
        {
            ++slipupNumber;
        }
    }
    
    /*
     0 == Trophies

     1 == cravings     

     2 == Slipups
     */
    

    return slipupNumber;
}

function getMostCommonCravingTime()
{    
    var cravingTime = findMostCommonCravingTime();
    
    if(cravingTime < 12)
    {
        return "" + cravingTime + "<span>am</span>";
    }
    else
    {
        return "" + ( cravingTime - 12 ) + "<span>pm</span>";
    }
    
    return "7<span>pm</span>";
}

//Calculate which one of the saved times that is the most common;
function findMostCommonCravingTime()
{
    var times = new Array();
    for( var i = 0; i < historyTree.length; ++i)
    {
        times.push(historyTree[i].date.getHours());
    }
    
    var hours = new Array();
    for( var hour = 0; hour < 25; ++hour)
    {
        hours.push(0);
    }
    
    for( var timeCounter = 0; timeCounter < times.length; ++timeCounter)
    {
        ++hours[ times[timeCounter] ];
    }
    
    var highest = 0;
    for( var hourCounter = 0; hourCounter < 25; ++hourCounter)
    {
        if(highest < hours[hourCounter])
        {
            highest = hourCounter;
        }
    }
    
    return highest;
}


function getMostCommonCravingType()
{
    var allSlipups = new Array();
    
    for( var i = 0; i < historyTree.length; ++i)
    {
        if(historyTree[i].type == 1)
        {
            allSlipups.push(historyTree[i].name);
        }
    }


    var nameCounts = new Array();
    var found;
    var nameCountAddition;
    for( i = 0; i < allSlipups.length; ++i)
    {
        found = false;
        
        for( var y = 0; y < nameCounts.length; ++y)
        {
            if(nameCounts[y].name == allSlipups[i])
            {
                found = true;
                nameCounts[y].count++;
                break;
            }
        }
        
        if(!found)
        {
            nameCountAddition =
            {
                name: allSlipups[i],
                count: 1
            };
            nameCounts.push( nameCountAddition );
        }
    }
    
    var slipup = "aucune pour l’instant";   //Aucun encore";//None Yet";
    var highest = 0;
    
    for( i = 0; i < nameCounts.length; ++i)
    {
        if(highest < nameCounts[i].count)
        {
            highest = nameCounts[i].count;
            slipup = nameCounts[i].name;
        }
    }

    return modifyTriggerName(slipup);
}

function getMostCommonSlipupType()
{
    var allSlipups = new Array();
    
    for( var i = 0; i < historyTree.length; ++i)
    {
        if(historyTree[i].type == 2)
        {
            allSlipups.push(historyTree[i].name);
        }
    }

    var nameCounts = new Array();
    var found;
    var nameCountAddition;
    for( i = 0; i < allSlipups.length; ++i)
    {
        found = false;
        
        for( var y = 0; y < nameCounts.length; ++y)
        {
            if(nameCounts[y].name == allSlipups[i])
            {
                found = true;
                nameCounts[y].count++;
                break;
            }
        }
        
        if(!found)
        {
            nameCountAddition =
            {
                name: allSlipups[i],
                count: 1
            };
            nameCounts.push( nameCountAddition );
        }
    }
    
    var slipup = "aucune pour l’instant";    //Aucun encore";//None Yet";
    var highest = 0;
    
    for( i = 0; i < nameCounts.length; ++i)
    {
        if(highest < nameCounts[i].count)
        {
            highest = nameCounts[i].count;
            slipup = nameCounts[i].name;
        }
    }
    
    return modifySlippupName(slipup);
}

function modifyTriggerName(name)
{
    if(name == "J’étais stressé(e)")//"I was stressed")
        return "le stress";//"stress";
    
    if(name == "Je m’ennuyais")//I was tipsy")
        return "l’ennui";//"being tipsy";
    
    if(name == "J’étais pompette")//I was bored")
        return "l’alcool";//"boredom";
    
    if(name == "Je n’arrivais pas à me concentrer")//I couldn't concentrate")
        return "le besoin de me concentrer";//"needing to concentrate";
    
    if(name == "Je n’arrivais pas à me détendre")//I couldn't relax")
        return "le travail";//"work";
    
    if(name == "Je venais de manger")//I just ate")
        return "d’être gavé";//"d’avoir trop mangé";//"being stuffed";
    
    if(name == "J’étais en compagnie de fumeurs")//I was with smokers")
        return "d’être en compagnie de fumeurs";//"being with smokers";
    
    if(name == "J’étais en colère")//I was angry")
        return "la colère";//"anger";
    
    //alert("Modify Trigger Name - failed at: " + name);
    
    return name;
}

function modifySlippupName(name)
{
    if(name == "J’étais stressé(e)")//"I was stressed")
        return "le stress";//"stress";
    
    if(name == "Je m’ennuyais")//I was tipsy")
        return "l’ennui";//"being tipsy";
    
    if(name == "J’étais pompette")//I was bored")
        return "l’alcool";//"boredom";
    
    if(name == "Je n’arrivais pas à me concentrer")//I couldn't concentrate")
        return "le besoin de me concentrer";//"needing to concentrate";
    
    if(name == "Je n’arrivais pas à me détendre")//I couldn't relax")
        return "le travail";//"work";
    
    if(name == "Je venais de manger")//I just ate")
        return "les gros repas";//"being stuffed";
    
    if(name == "J’étais en compagnie de fumeurs")//I was with smokers")
        return "la compagnie des fumeurs";//"being with smokers";
    
    if(name == "J’étais en colère")//I was angry")
        return "la colère";//"anger";
    
    
    //alert("Modify Trigger Name - failed at: " + name);
    
    return name;
}


function getDaysUntillSlipup()
{
    return Math.round( timeUntillSlipup / milisecondsEachDay );
}

function getWeeklyProgress(date)
{
    var progressString;
    
    var sevenDayOffset = 7;
    var daysSinceStart = Math.round( getDaysSinceStart(date) );
    
    if(daysSinceStart < sevenDayOffset)
        sevenDayOffset = daysSinceStart;
    
    var lastDay = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    
    lastDay.setFullYear(year, month, day - sevenDayOffset);
    
    var dumpedDuringWeek =  sevenDayOffset * cigarettesEachDay;
    var saveDuringWeek = 0;
    var ressistsDuringWeek = 0;
    
    for(var i = historyTree.length -1; i > 0;  --i)
    {
        if(historyTree[i].date > lastDay)
        {
            if(historyTree[i].type == 1)
            {
                ++ressistsDuringWeek;
            }
            else if(historyTree[i].type == 2)
            {
                --dumpedDuringWeek;
            }
        }
    }
    
    if(dumpedDuringWeek < 0)
    dumpedDuringWeek = 0;
    
    saveDuringWeek = (Math.round( dumpedDuringWeek * ( packageCost / ciggarettesInPackage )  * 100) / 100).toFixed(2);
    
    progressString = "J’ai rompu " + dumpedDuringWeek;//"I've dumped"
    
    if(dumpedDuringWeek == 1)
        progressString += " cigarette, épargné environ $" + saveDuringWeek + " et résisté à l’envie de fumer " + ressistsDuringWeek;
    else
        progressString += " cigarettes, épargné environ $" + saveDuringWeek + " et résisté à l’envie de fumer " + ressistsDuringWeek;//"saved" variable "and resissted smoking"
    
    if(ressistsDuringWeek == 1)
        progressString += " fois."; //"time"
    else
        progressString += " fois.";//"times"
    
    return progressString;
}


function getWeeklyProgressEnd(date)
{
    var progressString;
    
    var sevenDayOffset = 7;
    var daysSinceStart = Math.round( getDaysSinceStart(date) );
    
    if(daysSinceStart < sevenDayOffset)
        sevenDayOffset = daysSinceStart;
    
    var lastDay = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    
    lastDay.setFullYear(year, month, day - sevenDayOffset);
    
    var dumpedDuringWeek =  sevenDayOffset * cigarettesEachDay;
    var saveDuringWeek = 0;
    var ressistsDuringWeek = 0;
    
    for(var i = historyTree.length -1; i > 0;  --i)
    {
        if(historyTree[i].date > lastDay)
        {
            if(historyTree[i].type == 1)
            {
                ++ressistsDuringWeek;
            }
            else if(historyTree[i].type == 2)
            {
                --dumpedDuringWeek;
            }
        }
    }
    
    if(dumpedDuringWeek < 0)
        dumpedDuringWeek = 0;
    
    saveDuringWeek = (Math.round( dumpedDuringWeek * ( packageCost / ciggarettesInPackage )  * 100) / 100).toFixed(2);
    
    progressString = "&c=" + dumpedDuringWeek + "&m=" + saveDuringWeek + "&r=" + ressistsDuringWeek + "&e=0";
    
    return progressString;
}

function getWeeklyFacebookMessage(date)
{
    var progressString;

    var sevenDayOffset = 7;
    var daysSinceStart = Math.round( getDaysSinceStart(date) );

    if(daysSinceStart < sevenDayOffset)
        sevenDayOffset = daysSinceStart;

    var lastDay = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();

    lastDay.setFullYear(year, month, day - sevenDayOffset);

    var dumpedDuringWeek = sevenDayOffset * cigarettesEachDay;
    var saveDuringWeek = 0;
    var ressistsDuringWeek = 0;

    for(var i = historyTree.length -1; i > 0; --i)
    {
        if(historyTree[i].date > lastDay)
        {
            if(historyTree[i].type == 1)
            {
                ++ressistsDuringWeek;
            }
            else if(historyTree[i].type == 2)
            {
                --dumpedDuringWeek;
            }
        }
    }

    if(dumpedDuringWeek < 0)
        dumpedDuringWeek = 0;

    saveDuringWeek = (Math.round( dumpedDuringWeek * ( packageCost / ciggarettesInPackage )  * 100) / 100).toFixed(2);

    progressString = "Je me suis lassé de la cigarette, alors j’ai écrasé et je passe à autre chose. Déjà, cette semaine, j’ai jeté " + dumpedDuringWeek;
    //"I got tired of smoking's stupid games, so we broke up and I'm moving on. So far this week, I've dumped " + 
    
    if(dumpedDuringWeek == 1)
       progressString += " cigarette, épargné " + saveDuringWeek + "$ et résisté à l’envie de fumer " + ressistsDuringWeek;
    else
        progressString += " cigarettes, épargné " + saveDuringWeek + "$ et résisté à l’envie de fumer " + ressistsDuringWeek;
    
    /*
    if(dumpedDuringWeek == 1)
       progressString += " cigarette, saved $" + saveDuringWeek + " and resisted smoking " + ressistsDuringWeek;
    else
        progressString += " cigarettes, saved $" + saveDuringWeek + " and resisted smoking " + ressistsDuringWeek;
    */
    
    
    if(ressistsDuringWeek == 1)
    {
        progressString += " fois. Vous aussi êtes prêt à écraser la cigarette? Visitez breakitoff.ca pour commencer à arrêter.";
    }
    else
    {
        progressString += " fois. Vous aussi êtes prêt à écraser la cigarette? Visitez breakitoff.ca pour commencer à arrêter.";
    }

    /*
    if(ressistsDuringWeek == 1)
    {
        progressString += " time. Ready to dump smoking too? Visit breakitoff.ca to get started.";
    }
    else
    {
        progressString += " times. Ready to dump smoking too? Visit breakitoff.ca to get started.";
    }
    */

    return progressString;
}


// APP DATA

function saveAppData()
{
    $.mobile.fixedToolbars.show(true);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotAppDataFileSystemWrite, appDataWriteFail);
}

function gotAppDataFileSystemWrite(fileSystem)
{   
    fileSystem.root.getFile("appData.bin", {create: true}, gotAppDataFileEntryWrite, appDataWriteFail);
}

function gotAppDataFileEntryWrite(fileEntry)
{
    fileEntry.createWriter(gotAppDataWriter, appDataWriteFail);
}

function gotAppDataWriter(writer)
{      
    writer.onwrite = function(evt)
	{
        if(firstTime)
        {
            showInstructions(false,true);
            firstTime = false;
        }
    };

    var outputData = "";
    
    outputData = startDate.getFullYear() + "," + startDate.getMonth() + "," + startDate.getDate() + ",";
    outputData += timeSinceSmoke.getFullYear() + "," + timeSinceSmoke.getMonth() + "," + timeSinceSmoke.getDate() + ",";
    outputData += cigarettesEachDay + ",";
    outputData += breakUpMethod + ",";
    outputData += lastNotificationDay;
        
    for(var index = 0; index < customTriggerArray.length; ++index)
    {
        outputData += "," + customTriggerArray[index];
    }
    
    writer.write(outputData);
}

function appDataWriteFail(error)
{
    if(firstTime)
    {
        showInstructions(false,true);
        firstTime = false;
    }
}

var loadSuccess;
var loadFail;
var loadFunction;

function loadAppData(onSuccess, onFail)
{
    loadSuccess = onSuccess;
    loadFail = onFail;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotAppDataFileSystemRead, appDataReadFail);
}

function gotAppDataFileSystemRead(fileSystem)
{
    fileSystem.root.getFile("appData.bin", 0, gotAppDataFileEntryRead, appDataReadFail);
}

function gotAppDataFileEntryRead(fileEntry)
{
    fileEntry.file(gotAppDataFile, appDataReadFail);
}

function gotAppDataFile(file)
{
    readAppData(file);
}

function readAppData(file)
{
    var reader = new FileReader();
    reader.onloadend = function(evt) 
    {
        var results = evt.target.result.split(',');
        
        startDate = new Date(results[0], results[1], results[2]);
        
        timeSinceSmoke = new Date();
        timeSinceSmoke.setFullYear(results[3], results[4], results[5]);
        cigarettesEachDay = results[6];
        breakUpMethod = results[7];
        
        var triggerStart = 8;
        
        if(results.length >= 9)
 		{
 			if(!isNaN(results[triggerStart]))
 			{
		        lastNotificationDay = results[triggerStart];
 				++triggerStart;
 			}
 		}
        
        customTriggerArray = [];
        for (var i = triggerStart; i < results.length; ++i) 
        {
            var name = results[i];
            customTriggerArray.push(name);
        }
        
        loadHistoryData();
    };
    
    reader.readAsText(file);
}

function appDataReadFail(error)
{
    loadFail();
}

// APP DATA END


// HISTORY DATA

function saveHistoryData()
{    
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotHistoryDataFileSystemWrite, historyDataWriteFail);
}

function gotHistoryDataFileSystemWrite(fileSystem)
{  
    fileSystem.root.getFile("appHistory.bin", {create: true}, gotHistoryDataFileEntryWrite, historyDataWriteFail);
}

function gotHistoryDataFileEntryWrite(fileEntry)
{
    fileEntry.createWriter(gotHistoryDataWriter, historyDataWriteFail);
}

function gotHistoryDataWriter(writer)
{    
    writer.onwrite = function(evt)
	{
    };
    
    var outputData = "";
    
    if(historyTree.length != 0)
    {
        for(var index = 0; index < triggersToSave; ++index)
        {
            var node = historyTree[historyTree.length-triggersToSave+index];
            if(!(outputData.length == 0 && writer.length == 0))
                outputData += ",";
            
            outputData += node.type + ",";
            outputData += node.name + ",";
            outputData += node.date + ",";
            outputData += node.longitude + ",";
            outputData += node.latitude;
            
        }
    }
    
    writer.seek(writer.length);
    writer.write(outputData);
}

function historyDataWriteFail(error)
{
}

function loadHistoryData()
{
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotHistoryDataFileSystemRead, historyDataReadFail);
}

function gotHistoryDataFileSystemRead(fileSystem)
{
    fileSystem.root.getFile("appHistory.bin", 0, gotHistoryDataFileEntryRead, historyDataReadFail);
}

function gotHistoryDataFileEntryRead(fileEntry)
{
    fileEntry.file(gotHistoryDataFile, historyDataReadFail);
}

function gotHistoryDataFile(file)
{
    readHistoryData(file);
}

function readHistoryData(file)
{
    var reader = new FileReader();
    reader.onloadend = function(evt) 
    {
        var results = evt.target.result.split(',');      
        
        for(var index = 0; index < results.length / 5; ++index)
        {
            var startIndex = index * 5;
            //alert(results[startIndex] + "," + results[startIndex+1] + "," + results[startIndex+2] + "," + results[startIndex+3] + "," + results[startIndex+4]);
            var node = new HistoryNode(results[startIndex], results[startIndex+1], new Date(results[startIndex+2]));
            node.longitude = results[startIndex+3];
            node.latitude = results[startIndex+4];
            historyTree.push(node);
            
        }
        checkDailyNotification();
        
        loadSuccess();
    };
    
    reader.readAsText(file);
}

function checkDailyNotification()
{
	var thisDay = new Date();
	thisDay = new Date(thisDay.getFullYear(), thisDay.getMonth(), thisDay.getDate() );
	
	var daysSinceStart = getDaysSinceStart(thisDay);
    
	if(lastNotificationDay < daysSinceStart)
	{
		var todaysTrophies = getTrophiesOfDate(thisDay);
		
		if(todaysTrophies.length != 0)
		{
			var trophyName = todaysTrophies[todaysTrophies.length - 1].name;
			
			pushNotificationFunc(trophyName);
		}
        
		lastNotificationDay = daysSinceStart;
        saveAppData();
	}
}

function historyDataReadFail(error)
{
    loadSuccess();
}

// HISTORY DATA END

function HistoryNode(type, name, date)
{
    this.type = type;
    this.name = name;
    this.date = date;
    this.longitude = 0.0;
    this.latitude = 0.0;
    this.complete = false;
    this.longitude = watchedLongitude;
    this.latitude = watchedLatitude;
}

function addHistory(type, name)
{
    graphCurrentDate = null;
    triggersToSave = 1;
    
    var tDate = new Date();
    tDate
    
    var node = new HistoryNode(type, name, new Date());    
    historyTree.push(node);
    
    if(type == 1)
    {
        var cravingCounter = 0;
        var third = false;
        var thirdWasFound = false;
        var tenth = false;
        
        for(var index = historyTree.length - 1; index >= 0; --index)
        {
            var testNode = historyTree[index];
            
            
            if(testNode.type == 0)
            {
                if(testNode.name == "Vous avez inscrit 3 déclencheurs!")//Entered 10 triggers")
                {
                    tenth = false;
                    third = false;
                    break;
                }
                else if(testNode.name == "Vous avez inscrit 10 déclencheurs!")//Entered 3 triggers")
                {
                    thirdWasFound = true;
                    third = false;
                }
                
                continue;
            }
            else if(testNode.type == 1)
                ++cravingCounter;
            else if(testNode.type == 2)
            {
                break;
            }
            
            if(cravingCounter == 3 && !thirdWasFound)
                third = true;
            if(cravingCounter == 10)
            {
                tenth = true;
            }
        }

        if(third)
        {
            ++triggersToSave;
            historyTree.push(new HistoryNode(0, "Vous avez inscrit 3 déclencheurs!", new Date()));//Entered 3 triggers", new Date()));
            pushNotificationFunc("Vous avez inscrit 3 déclencheurs!");
        }
        else if(tenth)
        {
            ++triggersToSave;
            historyTree.push(new HistoryNode(0, "Vous avez inscrit 10 déclencheurs!", new Date()));//Entered 10 triggers", new Date()));
            pushNotificationFunc("Vous avez inscrit 10 déclencheurs!");
        }    
    }
    
    saveHistoryData();
}