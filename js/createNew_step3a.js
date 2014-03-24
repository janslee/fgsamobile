/*
	Page specific JavaScript:
*/
//var URL_GET_LOCATION = "http://injuryprevention.cloudapp.net/ip/locations/GetByDistance";
var locations = new Array();

$(document).on('pagecreate', '#createNew_step3a', function(event) {
	//search pick location from contact table 
	/*fgaDB.db.transaction(function(tx) {
		tx.executeSql('SELECT Location FROM Contact WHERE Id=? AND IsDraft=1', [localId], function(tx, results) {
			if(results.rows.length === 0) {
				return;
			}
			window.localStorage["PICK_LOCATION"] = pickedLocation = results.rows.item(0).Location;
		}, fgaDB.onError);
	});*/
	//pickedLocation = window.localStorage["PICK_LOCATION"];
	//check if the pickedLocation in local DB
	if(myContact.LocationId != null){
		renderLocations();
	}
	/*else
	{
		fgaDB.contactLoc.insertLoc({"contactId":localId});
  	}
	*/

  	$('.chooseLocSearch div.ui-input-text').append('<img/>');
});

$(document).on('pageshow', '#createNew_step3a', function(event) {
	//prompts user if allow the GPS if not picked yet
	if(myContact.LocationId == null){
		$("#chooseLocationDialog").popup('open');
	}

	//event when user click the "Yes" button on allow gps dialog
	$("#btnTurnGPS").on('click', function() {
		// Allow GPS
		var latitude,longitude;
		event.preventDefault();
		navigator.geolocation.getCurrentPosition(
		        function(position) {
		        	//get postion
		            latitude = position.coords.latitude;
		            longitude = position.coords.longitude;       
		            //search locatoins via Geolocation  
		            //renderLocationByGeocode();
		            getLocationDataFromServer(URL_GET_LOCATION,{Geocode:[longitude,latitude]});

		        },
		        function() {
		            alert('Error getting location, please use Search button to query locations');
		     	}
		     );
	});

	//event when user hit search button
	$(document).on('click', '.chooseLocSearch img', function(event) {
		//Search locations
		var location = $('#strLocation').val();
		getLocationDataFromServer(URL_GET_LOCATION,{Address1:location});
		      
	});
});


function getLocationDataFromServer(url,loc) {
	//call rest service to get jSON data
	$.ajax({
                type: "GET",
                async: false,
                url: url,
                data: {byDistance:true, location:loc},
                contentType: "application/json",
                dataType: 'json',
                headers: {
                    "Authorization": accessToken
                },
                success: function(data){
					renderLocationFromServer (data);
				},
				error: function (error) {
         			 alert('error; ' + eval(error));
      			}

           });
}


function renderLocationFromServer (data) {

	var nearContent = "";
	var othercontent = "";
	var count = 0;
   if(data == null || data.length == 0){
   	// prompt user
		//nearContent += '<li><fieldset class="ui-field-contain">NO DATA</fieldset></li>';
   }
	$.each(data, function(key, val) {
		count++;
		if(count <= 3)
		{
			nearContent += '<li><fieldset class="ui-field-contain"><input type="radio" name="location" id="location" value="'+ val.Id+'"/><label for="location">' 
				+ val.Name + '</label></fieldset></li>';
			
		}
		else if(count <=6)
		{
			othercontent += '<li><fieldset class="ui-field-contain"><input type="radio" name="location" id="location" value="'+ val.Id+'"/><label for="location">' 
					+ val.Name  + '</label></fieldset></li>';
		}
		else
		{
			return false;
		}
	});

	$("ul.nearList").html(nearContent);
	$("ul.otherList").html(othercontent);
	$("#createNew_step3a").trigger("create");
}


//method to render the location radios from local 
function renderLocations() {
	
	var nearContent = "";
	var othercontent = "";
	var count = 1;
	var needExpended = false;
	if(locations != null && locations.length > 0)
	 {
      
		for (var key in locations) {
	    	//console.log('  ' + key + ': ' + results[key]);
	    	if(count <=3)
	    	{	nearContent += '<li><fieldset class="ui-field-contain"><input type="radio" name="location" id="location" value="'+ key +'"/><label for="location">' 
						+ locations[key] + '</label></fieldset></li>';
			}
			else
			{			
				othercontent += '<li><fieldset class="ui-field-contain"><input type="radio" name="location" id="location" value="'+key +'"/><label for="location">' 
						+ locations[key] + '</label></fieldset></li>';	
				if(myContact.LocationId == key) 
					needExpended = true;
			}
			count++;					
		}
	}
	$("ul.nearList").html(nearContent);
	$("ul.otherList").html(othercontent);
	//add class
	$("#createNew_step3a").trigger("create");   
     
	//checked the radio button by the pickedLocation
	$("input[name=location][value='"+myContact.LocationId+"']").attr("checked",true);
	if(needExpended)
	{
		$(".locationChoice > li > div.collapsed").trigger("click");	
	}
}

/* pick the location data */
$(document).on("tap", "#stepNxtBtnLoc", function () {

	myContact.LocationId = $('input[name=location]').filter(':checked').val();
	myContact.LocationName = $('input[name=location]').filter(':checked').prev().text();
	console.log('Id:' + myContact.LocationId + ', Name: ' + myContact.LocationName);
	//if user pick the location, then save to the contact table, and also save the location search data(?)
    if (myContact.LocationId != null) {
		$('input[name=location]').each(function(){
			locations[$(this).attr("value")] = $(this).prev().text();
	     });

        $.mobile.changePage("createNew_step4.html");
    } else {
        alert("Please choose the location!");
    }
});

//added by anson for confirmation when leaving current page
$(document).on("tap", "#createNew_step3a .leaveThisPage", function () {
    toPage = $(this).attr("data");
    $("#saveDraftDialog3").popup('open');
});

$(document).on("tap", "#saveDraftYesBtn3", function () {
    saveContact(toPage);
});

$(document).on("tap", "#saveDraftNoBtn3", function () {
	localId = 0;
	myContact = null;
    $.mobile.changePage(toPage);
});