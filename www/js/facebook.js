    var client_browser;
    var device_id;  //  Store the ID of the phone.  Will use this to match FB access tokens with users. 
    var access_token;  // The Facebook access token used to make Graph API calls

    var post_message;
    var post_appUrl;
    var post_imgUrl;

    var facebook_dialogBox;

    function Facebook_Initialize()
    {
        try
        {
            client_browser = ChildBrowser.install();
        }
        catch(e)
        {
            alert(e);    
        }
    }

    function showExternal(item)
    {
        client_browser.onLocationChange = null;
        if (client_browser != null)
        {
            window.plugins.childBrowser.showWebPage(item.attributes["title"].value);
        }
    }

    function Facebook_Post_Default()
    {
        Facebook.Post("Posting is fun", "adamwestman.se", "http://www.adiumxtras.com/images/pictures/chuck_norris_random_fact_generator_6_3957_2224_image_2578.jpg" );
    }
    
    function Facebook_Post(message, appUrl, imgUrl)
    {
        if(!navigator.onLine)
        {
            facebook_dialogBox("La connexion au réseau n’est pas disponible. Veuillez réessayer plus tard.");
            return false;
        }
        
        window.plugins.googleAnalyticsPlugin.trackPageview("/outbound/facebook");
        
        post_message = message;
        post_appUrl = appUrl + "?id=2";
        post_imgUrl = imgUrl;
        
        onPubFacebookBtn();
        
        return true;
    }


    function onPubFacebookBtn()
    {
        //var my_client_id = "325339457499435",  //Insert your Facebook App Id here //Break It Off info
        var my_client_id = "227449507343395",  //Insert your Facebook App Id here // Pour En Finir Info
        
        
        /*The redirect URI is not terribly important, we are just going to be looking for the access_token
         GET parameter and pull it out at this uri */
        my_redirect_uri = "http://www.facebook.com/connect/login_success.html",
        my_type = "user_agent",
        
        /* Tells Facebook to serve up an allow access page optimized for data phones */
        my_display = "touch";
        
        /* Build the url to bring users to to authorize app to post on their behalf */
        var authorize_url = "https://graph.facebook.com/oauth/authorize?";
        authorize_url += "client_id=" + my_client_id;
        authorize_url += "&redirect_uri=" + my_redirect_uri;
        authorize_url += "&display=" + my_display;
        
        /* Notice we get both publish_stream and offline_access.  This allows us to only authorize them once*/
        authorize_url += "&scope=publish_stream,offline_access&type=user_agent";
        
        /* Check whether we have the users access token already */
        //var tokenCheck = checkDeviceToken();
        //if (tokenCheck)
        //{
        //    /*Yep, we do have it, attempt to post to Facebook*/
        //    fbPost();
        //}
        //else
        //{
        
        //alert("retrieving access_token");
        /* Do not have the access token associated with this device_id.  */
        /* Fire this function when the child browsers location changes.  Looking for access_token */
        client_browser.onLocationChange = function (loc)
        {
            facebookLocChanged(loc);
        };
        
        /* Open the child browser with the facebook authorize URL */
        if (client_browser != null)
        {
            
            window.plugins.childBrowser.showWebPage(authorize_url);
        }
        
    }

    /* Called whenever the child browser's location changes */
    function facebookLocChanged(loc)
    {
        
        /* Test for the access_token in the URL */
        if (/access_token/.test(loc))
        {
            
            /* parse out the access token */
            var result = unescape(loc).split("#")[1];
            result = unescape(result);
            access_token = result.split("&")[0].split("=")[1];
            
            /* Store it in our database */
            //var r = insertDeviceToken();
            
            try
            {
                /* close our client browser */
                client_browser.close();
            } catch (e) {}
            /* Post with our newly acquired token */
            
            
            postFBWall();
        }
    }
    
    postFBWall = function()
    {
        var message = post_message;
        var urlPost = post_appUrl;
        var urlPicture = post_imgUrl;
        
        var url = 'https://graph.facebook.com/me/feed?access_token=' + this.access_token+'&message='+message;
        
        if (urlPost)
        {
            //url += '&link='+encodeURIComponent("http://giantmedia.dev.datacraft.se/breakitoff.php?title=Apa&t=dasdsa");
            url += '&link='+encodeURIComponent(urlPost);
        }
        
        if (urlPicture)
        {
            url += '&picture='+encodeURIComponent(urlPicture);
        }
        
        var req = this.postFBGraph(url);
        
        req.onload = function()
        {
            document.getElementById('progressContent').innerHTML = "Affichage réussie!";
            //SHOW POSTING LOANDING SCREEN
        };
    }
    
    postFBGraph = function(url)
    {
        var req = new XMLHttpRequest();
        
        req.open("POST", url, true);
        req.send(null);
        //alert("complete");
        $('#fshare').hide(); 
        $('.lightbox-btn-yes').hide();
        $('.lightbox-btn-no').hide();
        
        document.getElementById('progressContent').innerHTML = "Affichage...";
        
        //HIDE POSTING LOANDING SCREEN
        
        return req;
    }
