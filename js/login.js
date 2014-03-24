var userName = "fgaip-webapi";
var passWord = "wine+beer=Queer!";

function handleLogin() {
    //disable the button and the form, so we can't resubmit while we wait
    emailAddress = $("#emailAddress").val();
    $("#emailAddress").textinput("disable");
    $("#loginBtn").data("disabled", true);

    if (emailAddress != "") {
        getAccessToken(userName, passWord, URL_GET_TOKEN);
        if (accessToken == "" || accessToken == undefined) {
            alert("There maybe some problems to get Token!");
            $("#emailAddress").textinput("enable");
            $("#loginBtn").data("disabled", false);
        } else {
            accessToken = prepToken(accessToken, emailAddress);

            $("#emailAddress").textinput("enable");
            $("#loginBtn").data("disabled", false);
            $.mobile.changePage("home.html");
            //$.mobile.changePage("createNew.html"); //for test
            //fgaDB.open(); //for test            
            //initContactTable(); //for test
        }
    } else {
        alert("please type in Email Address before log in!");
        $("#emailAddress").textinput("enable");
        $("#loginBtn").data("disabled", false);
    }
}

function getAccessToken(username, password, desturl) {
    $.ajax({
        type: "POST",
        async: false,
        url: desturl,
        data: {
            wrap_name: userName,
            wrap_password: passWord,
            wrap_scope: "http://injuryprevention.cloudapp.net/ip"
        },
        success: function (data) {
            accessToken = data;
        }
    });
}

function prepToken(token, email) {
    var newtoken = token.split("&")[0].split("=")[1];
    newtoken = 'WRAP access_token=\"' + decodeURIComponent(newtoken) + '\"';

    newtoken = newtoken.replace(/%3a/g, ":");
    newtoken = newtoken.replace(/%2f/g, "/");

    email = '&http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress=' + email;
    // add an email address claim
    newtoken = newtoken.split("&Audience")[0] + email + "&Audience" + newtoken.split("&Audience")[1];
    newtoken = newtoken.replace(/:/g, "%3a");
    newtoken = newtoken.replace(/\//g, "%2f");
    return newtoken;
}

$(document).on("tap", "#loginBtn", function () {
    if (!$("#loginBtn").data("disabled")) {
        isOnline = checkConnection();
        if (!isOnline) {
            alert("Now, enter the Offline mode!");
            $.mobile.changePage("home.html");
        }
        handleLogin();
    }
});

// $(document).on("pageshow", function () {
//     
//     if (!isOnline) {
//         alert("There is no network connection!");
//         $.mobile.changePage("home.html");
//     }
// });