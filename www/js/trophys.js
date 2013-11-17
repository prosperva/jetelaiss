/*
 
 
 
 smokefree
 
 
 
 1 day.
 
 3 day.
 
 7 day.
 
 30 day.
 
 182 day.
 
 365 day.
 
 
 
 
 
 
 
 newRecord.
 
 
 
 3 triggers punch.
 
 10 triggers punch.
 
 
 
 
 
 */

/*
 
 this.type = type;
 
 this.name = name;
 
 this.date = date;
 
 */

function getTrophiesOfDate(date)
{
    var trophies = new Array();
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    var daysSinceSmoke = calcTimeSinceSmoke(date);
    
    var record = gotSmokeFreeRecord(date);
    if(record != null)
    {
        var record_trophy =
        {
            type: 0,
            name: record,
            date: date
        };
        
        trophies.push(record_trophy);
    }    
    
    var timeTrophie = gotTimeTrophie(daysSinceSmoke);
    if(timeTrophie != null)
    {
        var time_trophy =
        {
            
            type: 0,
            name: timeTrophie,
            date: date
            
        };
        trophies.push(time_trophy);
    }
    
    return trophies;
}


function gotSmokeFreeRecord(checkDate)
{
    var maxTime = 0;
    var currentTime = 0;
    var lastDate = startDate;
    
    
    for(var i = 0; i < historyTree.length; ++i)
    {
        if(historyTree[i].type == 2)
        {
            if(historyTree[i].date < checkDate)
            {
                currentTime = historyTree[i].date - lastDate;
                if(currentTime > maxTime)
                    maxTime = currentTime;
                
                lastDate = historyTree[i].date;
            }
            else
            {
                break;
            }
        }
    }
    
    var timeSince = checkDate - lastDate;
    
    if(maxTime > timeSince)
        return null;
    
    var daysSince = timeSince / milisecondsEachDay;
    
    var fullDays = Math.round(daysSince);
    
    if(fullDays == 0)
        return null;
    
    if(fullDays == 1)
        return fullDays + " journée d’affilée";//JOUR SANS FUMER";//DAY STRAIGHT";
    else
        return fullDays + " journées d’affilée";//JOURS SANS FUMER";//DAYS STRAIGHT";
}


function gotTimeTrophie(daysSinceSmoke)
{
    if(daysSinceSmoke == 1)
        return "1 journée complète!";//Smoke free 1 day";
 
    if(daysSinceSmoke == 3)
        return "3 jours sans fumer!";//Smoke free 3 days";
    
    if(daysSinceSmoke == 7)
        return "1 semaine sans fumer!";//Smoke free 1 week";
    
    if(daysSinceSmoke == 30)
        return "1 moise complete!";//Smoke free 1 month";
    
    if(daysSinceSmoke == 182)
        return "6 mois sans fumer!";//Smoke free 6 months";
    
    if(daysSinceSmoke == 365)
        return "1 année complète!";//Smoke free 1 year";
    
    return null;
}


function calcTimeSinceSmoke(checkDate)
{
    var lastDate = startDate;
    
    for(var i = 0; i < historyTree.length; ++i)
    {
        if(historyTree[i].type == 2)
        {
            if(historyTree[i].date < checkDate)
            {
                lastDate = historyTree[i].date;
            }
            else
            {
                break;
            }
        }
    }
    
    var timeSince = checkDate - lastDate;
    
    var daysSince = timeSince / milisecondsEachDay;
    
    return Math.round(daysSince);
}

String.prototype.contains = function(it)
{
    return this.indexOf(it) != -1;
};


function getFacebookMessage(source)
{
    if(source.contains("d’affilée"))//STRAIGHT"))
    {
        var recordDay;
        if(source.contains("journées"))//DAYS")
            recordDay = source.replace(" journées d’affilée", "");    //DAYS STRAIGHT", ""); JOUR SANS FUMER
        else
            recordDay = source.replace(" journée d’affilée", "");     //DAY STRAIGHT", "");
            
        return getRecordMessage(recordDay);
    }

    if(source.contains("1 journée"))//1 day"))
        return getOneDayFreeMessage();

    if(source.contains("3 jours"))//3 days"))
        return getThreeDayFreeMessage();

    if(source.contains("1 semaine"))//1 week"))
        return getOneWeekFreeMessage();

    if(source.contains("1 moise"))//1 month"))
        return getOneMonthFreeMessage();

    if(source.contains("6 mois"))//6 months"))
        return getSixMonthFreeMessage();

    if(source.contains("1 année"))//1 year"))
        return getOneYearFreeMessage();

    if(source.contains("3 déclencheurs"))//3 triggers"))
        return getThreePunched();

    if(source.contains("10 déclencheurs"))//"10 triggers"))
        return getTenPunched();


    return "";
}

function getFacebookMessageURL(source)
{
    if(source.contains("d’affilée"))//STRAIGHT"))
    {
        return "http://www.breakitoff.ca/mobile-helper/breakitoff_fr.php?t=6";
    }
    
    if(source.contains("1 journée"))//1 day"))
        return "http://www.breakitoff.ca/mobile-helper/breakitoff_fr.php?t=0";
    
    if(source.contains("3 jours"))//3 days"))
        return "http://www.breakitoff.ca/mobile-helper/breakitoff_fr.php?t=1";
    
    if(source.contains("1 semaine"))//1 week"))
        return "http://www.breakitoff.ca/mobile-helper/breakitoff_fr.php?t=2";
    
    if(source.contains("1 moise"))//1 month"))
        return "http://www.breakitoff.ca/mobile-helper/breakitoff_fr.php?t=3";
    
    if(source.contains("6 mois"))//6 months"))
        return "http://www.breakitoff.ca/mobile-helper/breakitoff_fr.php?t=4";
    
    if(source.contains("1 année"))//1 year"))
        return "http://www.breakitoff.ca/mobile-helper/breakitoff_fr.php?t=5";
    
    if(source.contains("3 déclencheurs"))//3 triggers"))
        return "http://www.breakitoff.ca/mobile-helper/breakitoff_fr.php?t=7";
    
    if(source.contains("10 déclencheurs"))//10 triggers"))
        return "http://www.breakitoff.ca/mobile-helper/breakitoff_fr.php?t=8";
    
    
    return "";
}

function getOneDayFreeMessage()
{
    return "J’ai rompu avec la cigarette depuis une journée!";
    
    //"It's been a day since I dumped smoking!";
}

function getThreeDayFreeMessage()
{
    return "Ça fait 3 jours que j’ai rompu avec la cigarette!";
    
    //"It's been 3 days since I dumped smoking!";
}

function getOneWeekFreeMessage()
{
    return "Ça fait une semaine que j’ai rompu avec la cigarette!";
    
    //"It's been a week since I dumped smoking!";
}

function getOneMonthFreeMessage()
{
    return "Ça fait un mois que j’ai rompu avec la cigarette!";
    
    //"It's been a month since I dumped smoking!";
}

function getSixMonthFreeMessage()
{
    return "J’ai rompu avec la cigarette il y a 6 mois!";
    
    //"It's been 6 months since I dumped smoking!";
}

function getOneYearFreeMessage()
{
    return "Ça fait un an que j’ai rompu avec la cigarette!";
    
    //"It's been 1 year since I dumped smoking!";
}

function getRecordMessage(days)
{
    if(days == 1)
        return "Il s’est écoulé " + days + " jour depuis que j’ai rompu avec la cigarette!";
        //return "It's been " + days + " day since I dumped smoking!";
    else
        return "Il s’est écoulé " + days + " jours depuis que j’ai rompu avec la cigarette!";
        //return "It's been " + days + " days since I dumped smoking!";
}

function getThreePunched()
{
    return "J’ai inscrit 3 déclencheurs dans mon Calendrier de l’abandon du tabagisme!";
    
    //I've entered 3 triggers into my Break It Off timeline!";
}

function getTenPunched()
{
    return "J’ai inscrit 10 déclencheurs dans mon Calendrier de l’abandon du tabagisme!";
    
    //I've entered 10 triggers into my Break It Off timeline!";
}


function getNotificationMessage(source)
{
    if(source.contains("d’affilée"))//STRAIGHT"))
    {
        var recordDay;
        if(source.contains("journées"))//DAYS")
            recordDay = source.replace(" journées d’affilée", "");    //DAYS STRAIGHT", ""); JOUR SANS FUMER
        else
            recordDay = source.replace(" journée d’affilée", "");     //DAY STRAIGHT", "");
            
		return getRecordNotification(recordDay);
	}
	
    if(source.contains("1 journée"))//1 day"))
        return getOneDayNotification();
    
    if(source.contains("3 jours"))//3 days"))
        return getThreeDayNotification();
    
    if(source.contains("1 semaine"))//1 week"))
        return getOneWeekNotification();
    
    if(source.contains("1 moise"))//1 month"))
        return getOneMonthNotification();
    
    if(source.contains("6 mois"))//6 months"))
        return getSixMonthNotification();
    
    if(source.contains("1 année"))//1 year"))
        return getOneYearNotification();
    
    if(source.contains("3 déclencheurs"))//3 triggers"))
        return getThreePunchedNotification();
    
    if(source.contains("10 déclencheurs"))//"10 triggers"))
        return getTenPunchedNotification();

    //alert("Notification not found: " + source);
	return "";
}

function getOneDayNotification()
{
	return "Il s’est écoulé une journée depuis votre dernière cigarette. Vos poumons devraient déjà mieux fonctionner et vous ne vous sentez probablement plus à court de souffle. Ne lâchez pas!";
    
    //It's been a day since your last smoke. Your lungs should be working better already and you probably don't feel so out of breath. Keep it up!";
}

function getThreeDayNotification()
{
	return "Votre dernière cigarette remonte à 3 jours, ce qui signifie que la nicotine devrait avoir complètement quitté votre corps! Continuez comme ça, vous vous en sortez très bien!";
    
    //"It's been 3 days since your last smoke, which means the nicotine should be out of your body completely! Keep going, you're doing amazing!";
}

function getOneWeekNotification()
{
	return "Il s’est écoulé une semaine depuis votre dernière cigarette! Cela veut dire que le débit sanguin vers vos mains et vos pieds devrait s’être amélioré; vous n’avez peut-être plus aussi froid qu’avant. Vous vous en sortez très bien, ne lâchez pas!";
    
    //"It's been a week since your last smoke! That means the blood flow to your hands and feet should be improving and you probably don't feel as cold. You're doing great, keep it up!";
}

function getOneMonthNotification()
{
	return "Il s’est écoulé un mois depuis votre dernière cigarette! Votre circulation sanguine s’est assurément améliorée, vos poumons fonctionnent mieux et vous trouvez sûrement plus facile d’être actif. Excellent travail, continuez comme ça!";
    
    //"It's been a month since your last smoke! You blood circulation has likely improved, your lungs are working better and it's probably easier to be physically active. Amazing work, keep it up!";
}

function getSixMonthNotification()
{
	return "Ça fait 6 mois que vous avez rompu avec la cigarette! Vous avez probablement remarqué que vous toussez moins, que vos sinus ne sont plus congestionnés et que vous n’avez plus le souffle court. Félicitations, continuez dans cette voie!";
    
    //"It's been 6 months since you broke up with smoking! You've probably noticed less coughing, sinus congestion and shortness of breath. Congratulations, and keep it up!";
}

function getOneYearNotification()
{
	return "Ça fait un an que vous avez rompu avec la cigarette! Félicitations! Vos chances d’être atteint de problèmes cardiaques sont réduites de moitié comparées à celles du fumer moyen. Vous vous en sortez à merveille, continuez d’apprécier votre nouvelle vie sans fumée!";
    
    //"It's been a whole year since you broke it off smoking! Congratulations! Your risk of coronary heart disease should now be about half of what it is for an average smoker. You're doing amazing, keep enjoying life smoke-free!";
}

function getRecordNotification(days)
{
    return "Il s’est écoulé " + days + " jours depuis votre dernière cigarette – c’est un nouveau record! Maintenez vos efforts, vous vous en sortez très bien!";

	//return "It's been " + days + " days since your last smoke - that's a new record! Keep up the great work, you're doing great!";
}

function getThreePunchedNotification()
{
	return "Vous avez inscrit 3 déclencheurs dans votre Calendrier de l’abandon du tabagisme. Identifier et comprendre vos envies vous aideront à arrêter de fumer pour de bon. Continuez, vous vous en sortez bien!";
    
    //"You entered 3 triggers into your Break It Off timeline. Understanding your cravings is a key part of successfully breaking up with smoking. Keep at it, you're doing awesome!";
}

function getTenPunchedNotification()
{
	return "Vous avez inscrit 10 déclencheurs dans votre Calendrier de l’abandon du tabagisme. Vous avez certainement identifié les éléments qui déclenchent vos envies de fumer ainsi que la façon de les combattre. Poursuivez ainsi, vous vous en sortez bien!";
    
    //"You entered 10 triggers into your Break It Off timeline. You should now have a good idea of what your most common triggers are, and how to overcome them. Keep it up, you're doing great!";
}
