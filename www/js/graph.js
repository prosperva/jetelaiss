var drawableTriggers = [];
var boundHistory = [];
var graphCurrentDate = null;
var graphPostToFacebook;
var graphPlot = null;
var graphSlips = 0;

function clearBubble()
{
    var infoDiv = document.getElementById('bubble');   
        
    if(infoDiv != null)
        $(infoDiv).hide();
}

function pFacebook(name, date)
{
    if(graphPostToFacebook(name, date))
        clearBubble();
}

function showTriggerAtMap(lat, lng)
{        
    clearBubble();
    showMarker(lat, lng);
}

function initGraph()
{
    $("#graph-canvas").bind("plotclick", function (event, pos, item) 
    {
        if(item) 
        {
            clearBubble();
                                
            showTriggerInfo(item.pageX, item.pageY, item.dataIndex - 1);                     
        }
        else
        {
            clearBubble();
        }
                        
    });
}


function onGraphSwipe(event, obj)
{
    clearBubble();
}


function showTriggerInfo(x, y, index) 
{
    var node = boundHistory[index];
    var date = node.date;
    
    var dateString = date.getDayName() + " " + date.getDate() + ", " + date.getMonthName() + ", " + date.getFullYear();
    
    var posX = x;
    var posY = y;
    
    var bubbleButtonType = "bubble-fb";
    var onclickFunc = "";
    if(node.type != 0)
    {
        bubbleButtonType = "bubble-map";
        onclickFunc = "showTriggerAtMap(" + node.latitude + ", " + node.longitude + ");";
    }
    else
       onclickFunc = "pFacebook('" + node.name + "','" + node.date + "');";
    
    
    var bubbleType = "";
    
    var bubbleDiv = document.getElementById('bubble');   
    
    if(bubbleDiv != null)
    {         
        var bubbleTitle = document.getElementById('bubble-title');  
        var bubbleDate = document.getElementById('bubble-date');  
        var bubbleButton = document.getElementById('bubble-button');   
    
        var testName = node.name;
        /*
        if(testName.length > 25)
        {
            testName = testName.slice(0, 23);
            testName += "..";
        }
          */  
        
        bubbleTitle.innerHTML = testName;
        bubbleDate.innerHTML = dateString;
        
        bubbleButton.setAttribute('class', bubbleButtonType);
        bubbleButton.setAttribute('onclick', onclickFunc);
    
        
        // Mitten
        var screenWidth = screen.width;
        var screenHeight = screen.height;
        
        if(screenWidth < screenHeight)
        {
            var temp = screenWidth;
            screenWidth = screenHeight;
            screenHeight = temp;
        }
        
        var chartHeaderHeight = $('.chart-header').outerHeight();
        var contentLeftWidth = $('.graph-content-left').outerWidth();
        
        posX = ((screenWidth - contentLeftWidth) * 0.5) - ($(bubbleDiv).outerWidth() * 0.5);
        posY = ((screenHeight - chartHeaderHeight) * 0.5) - ($(bubbleDiv).outerHeight() * 0.5);
        
        $(bubbleDiv).css({left: posX, top: posY});        
        
        $(bubbleDiv).show();
    }
}

function drawGraph(startAtBeg) 
{   
    clearBubble();
    
    var endPos = drawableTriggers.length-1;
    if(graphSlips > 0)
        endPos += 1;
    
    $('#graph-currentday-field').hide();
    $('#graph-canvas').hide();
    graphPlot = $.plot(  $("#graph-canvas"),
                        [ { data: drawableTriggers, label: null} ], 
                        {
                            series: 
                            {
                                lines: { show: true, lineWidth: 8 },
                                points: { show: true }
                            },
                            
                            colors: ['#000000'],
                            shadowSize: 0,
                            grid: { clickable: true, show: false },
                            yaxis: { min: 0.0, max: 3.0 },
                            xaxis: { min: 0.0, max: endPos}
                        });  
    
    if(startAtBeg)
    {
        $("#graph-overlay-container").scrollview("resetScrollSize");
        $("#graph-overlay-container").scrollview("scrollTo", 0, 0, 0);
    }
    else
    {
        $("#graph-overlay-container").scrollview("resetScrollSize");
        $("#graph-overlay-container").scrollview("scrollTo", -($("#graph-canvas").width() -  $("#graph-overlay-container").width() * 1.0), 0, 0);
    }
    
    $('#graph-canvas').show();
    $('#graph-currentday-field').show();
}