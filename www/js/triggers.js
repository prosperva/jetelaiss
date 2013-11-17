var customTriggerArray = new Array();
var onTriggerChange;
var onHistoryChange;


var nodeTypeToAdd = 0;
var nodeNameToAdd = "";
var nodePage = "";
var triggerResponse = false;

var trigger_dialogBox;
var trigger_hideDialog; 
var removeCravingTest = false;

function validateSlipup()
{
}

function submitSlipup()
{    
    window.plugins.googleAnalyticsPlugin.trackEvent("Inbound", "slip_up", "submit", 0);
    
    var slipupsList = document.getElementById('sel_slip_ups');
    var selectedOption = slipupsList.options[slipupsList.selectedIndex];
    var page = selectedOption.value;
    
    addSlipupToHistory($("#sel_slip_ups option:selected").text());
   
    timeUntillSlipup = new Date() - timeSinceSmoke;
    timeSinceSmoke = new Date();
    
    if(page.indexOf("#") >= 0)
    {
        $.mobile.changePage($(page), { transition: "none"} );
        $(page + "-scroll").scrollview("resetScrollSize");
        $(page + "-scroll").scrollview("scrollTo", 0, 0, 0);
    }
    else
    {
        $.mobile.changePage($("#slip-base"), { transition: "none"} );
        $("#slip-base-scroll").scrollview("resetScrollSize");
        $("#slip-base-scroll").scrollview("scrollTo", 0, 0, 0);
    }
    
    $("scroll-wrapper").scrollview("resetScrollSize");
    
    saveAppData();
        
    return false;
}

function addLoadedTriggers()
{   
    for(var index = 0; index < customTriggerArray.length; ++index)
        addTriggerToHTML(customTriggerArray[index]);
}

function clearCustomCravings()
{
    $('li').remove('.custom');
}

function clearCustomSlipups()
{
    $('option').remove('.customSelectitem');
}

function changeTriggerPage()
{
    if(window.orientation == -90 || window.orientation == 90)
        return;
    
    if(nodePage != "")
    {
        if(nodePage[0] == '#')
        {
            $.mobile.changePage($(nodePage), { transition: "none"} );
            $(nodePage + "-scroll").scrollview("resetScrollSize");
            $(nodePage + "-scroll").scrollview("scrollTo", 0, 0, 0);
        }
        else
        {
            document.getElementById('trigger-generic-text').innerHTML = nodeNameToAdd;
            $.mobile.changePage($("#trigger_generic"), { transition: "none"} );
            $("#trigger_generic-scroll").scrollview("resetScrollSize");
            $("#trigger_generic-scroll").scrollview("scrollTo", 0, 0, 0);
        }
    }
}

function promtRemoveCraving(item)
{
    removeCravingTest = true;
    
    var triggerItem = item;
    
    while(!$(triggerItem).is("li"))
    {
        triggerItem = triggerItem.parentNode;
    }
    
    nodeNameToAdd = triggerItem.attributes["name"].value;
    
    trigger_dialogBox("Aimeriez-vous retirer<br>'<i>" + nodeNameToAdd + "</i>' ?", function()//"Would you like to delete xxx"
                      {
                      removeTrigger(triggerItem);
                      removeCravingTest = false;
                      },
                      function() {trigger_hideDialog(); removeCravingTest = false;});
}

function promtAddCraving(item)
{
    nodeNameToAdd = item.attributes["name"].value;
    nodePage = item.attributes["title"].value;
    
    trigger_dialogBox("Aimeriez-vous ajouter<br>'<i>" + nodeNameToAdd + "</i>' à votre ligne de temps?", function()//"Would you like to add" xxx "to your timeline"
    {
        addCravingToHistory(item);
        changeTriggerPage(nodePage);
    },
    trigger_hideDialog);
}

function addCravingToHistory(item)
{
    var modName = pastTenseTrigger(nodeNameToAdd);
    var anaName = analyticsTriggerName(nodeNameToAdd);
    if(anaName != null)
        window.plugins.googleAnalyticsPlugin.trackEvent("Overlay", "trigger", anaName, 0);
    onHistoryChange(1, modName);
}

function addCustomCravingToHistory(item)
{
    if(!removeCravingTest)
        promtAddCraving(item);    
}

function addSlipupToHistory(name)
{
    var anaName = analyticsSlipupName(name);
    if(anaName != null)
        window.plugins.googleAnalyticsPlugin.trackEvent("Overlay", "slip_up", anaName, 0);
    onHistoryChange(2, name);
}

function addTrigger()
{
    var inputField = document.getElementById('textinput');
    var name = inputField.value;
    
    /*
    var pattern = new RegExp("/^[a-zàâçéèêëîïôûùüÿñæœ .-]*$/i", "g");
    //var pattern = new RegExp("[a-zA-Z' ]+", "g");
    //var pattern = new RegExp("[^\d\w\s']+", "g");
    var tempName = inputField.value.match(pattern);//escape(inputField.value);//
    //alert(tempName);
    var name = "";
    if(tempName.length > 0)
    {
        for(var i = 0; i < tempName.length; ++i)
        {
            name += tempName[i];
        }
    }
    */
    
    if(name != "Ajoutez votre déclencheur personnel")
    {    
        //alert("OK1");
        var length = inputField.value.length;// name.length;//    
    
        if(length > 0 && length <= 25)
        {
            for(var i = 0; i < customTriggerArray.length; ++i) 
            {
                if(customTriggerArray[i] == name)
                {
                
                    inputField.value = "Ajoutez votre déclencheur personnel";
                    return;
                }
            }
        
            window.plugins.googleAnalyticsPlugin.trackEvent("Inbound", "add_trigger", name, 0);
            customTriggerArray.push(name);
            addTriggerToHTML(name);
            onTriggerChange();
        }
        else
        {
            //alert("OK2");
            if(length == 0)
            {
                trigger_dialogBox("Hum, vous devez entrer plus d’un caractère. Essayez encore",null,null);
            }
            else if(length > 25)
            {
            
            }
        }
    }
    else
    {
        trigger_dialogBox("Hum, vous devez entrer plus d’un caractère. Essayez encore",null,null);
    }
    
    $("#trigger-scroll").scrollview("resetScrollSize");
    $("#trigger-scroll").scrollview("scrollTo", 0, 0, 0);

    inputField.value = "Ajoutez votre déclencheur personnel";
    $(inputField).blur();
    $(window).scrollTop(99999999);
    //alert("OK3");
}

function addTriggerToHTML(name)
{
    addTriggerToCravings(name);
    addTriggerToSlipups(name);
}

function addTriggerToCravings(name)
{
    var cravingsList = document.getElementById('cravingsList');
    
    var listItem = document.createElement('li');
    listItem.setAttribute('class','custom');
    listItem.setAttribute('data-icon','false');     
    listItem.setAttribute('title', name);   
    listItem.setAttribute('name', name);
    listItem.setAttribute('onclick','addCustomCravingToHistory(this)');
    listItem.innerHTML = "<a>" + name + "</a> <span class='triggers-delete ui-corner-all' onclick='promtRemoveCraving(this)'>supprimer</span>";
    cravingsList.insertBefore(listItem, cravingsList.childNodes[0]);
    $(cravingsList).listview("refresh");
}

function addTriggerToSlipups(name)
{
    var slipupsList = document.getElementById('sel_slip_ups');
    
    var listItem = document.createElement('option');
    listItem.setAttribute('class','customSelectitem');
    listItem.setAttribute('value', name);
    listItem.setAttribute('name', name);
    listItem.innerHTML = name;
    $(slipupsList).prepend(listItem);
}

function removeTriggerByIndex(index)
{
    customTriggerArray.splice(index, 1);
}

function removeTrigger(triggerItem)
{
    var name = triggerItem.attributes["name"].value;
    for (var i = 0; i < customTriggerArray.length; ++i) 
    {
        if(customTriggerArray[i] == name)
        {
            var slipupsList = document.getElementById('sel_slip_ups');
            for (var j = 0; j < slipupsList.options.length; ++j) 
            {
                var node = slipupsList.options[j];
                if(node.value == name)
                {
                    $(node).remove();
                    break;
                }
            }
          
            removeTriggerByIndex(i);
            $(triggerItem).remove();
            
            onTriggerChange();
            $("#trigger-scroll").scrollview("resetScrollSize");
            
            break;
        }
    }
}

function pastTenseTrigger(value)
{
    if(value == "Je suis stressé(e)")//"I'm stressed")
        return "J’étais stressé(e)";//I was stressed";
    
    if(value == "Je m’ennuie")//"I'm tipsy")
        return "Je m’ennuyais";//I was tipsy";
    
    if(value == "Je suis pompette")//"I'm bored")
        return "J’étais pompette";//I was bored";
    
    if(value == "Je n’arrive pas à me concentrer")//"I can't concentrate")
        return "Je n’arrivais pas à me concentrer";//I couldn't concentrate";
    
    if(value == "Je n’arrive pas à me détendre")//"I can't relax")
        return "Je n’arrivais pas à me détendre";//I couldn't relax";
    
    if(value == "Je suis gavé(e)")//"I'm stuffed")
        return "Je venais de manger";//I just ate";
    
    if(value == "Je suis en compagnie de fumeurs")//"I'm with smokers")
        return "J’étais en compagnie de fumeurs";//I was with smokers";
    
    if(value == "Je suis en colère")//"I'm angry")
        return "J’étais en colère";//I was angry";

    return value;
}



function analyticsTriggerName(value)
{
     if(value == "Je suis stressé(e)")//"I'm stressed")
        return "stressed";
    
    if(value == "Je m’ennuie")//"I'm tipsy")
        return "tipsy";
    
    if(value == "Je suis pompette")//"I'm bored")
        return "bored";
    
    if(value == "Je n’arrive pas à me concentrer")//"I can't concentrate")
        return "concentrate";
    
    if(value == "Je n’arrive pas à me détendre")//"I can't relax")
        return "relax";
    
    if(value == "Je suis gavé(e)")//"I'm stuffed")
        return "stuffed";
    
    if(value == "Je suis en compagnie de fumeurs")//"I'm with smokers")
        return "smokers";
    
    if(value == "Je suis en colère")//"I'm angry")
        return "angry";
    
    //alert("AnalyticsTriggerName - Name not found: " + value);    

    return value;
}

function analyticsSlipupName(value)
{
    if(value == "J’étais stressé(e)")//"I was stressed")
        return "stressed";
    
    if(value == "Je m’ennuyais")//I was tipsy")
        return "tipsy";
    
    if(value == "J’étais pompette")//I was bored")
        return "bored";
    
    if(value == "Je n’arrivais pas à me concentrer")//I couldn't concentrate")
        return "concentrate";
    
    if(value == "Je n’arrivais pas à me détendre")//I couldn't relax")
        return "relax";
    
    if(value == "Je venais de manger")//I just ate")
        return "stuffed";
    
    if(value == "J’étais en compagnie de fumeurs")//I was with smokers")
        return "smokers";
    
    if(value == "J’étais en colère")//I was angry")
        return "angry";
        
    //alert("AnalyticsTriggerName - Name not found: " + value);    

    return value;
}