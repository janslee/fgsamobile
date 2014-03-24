var URL = "http://157.56.180.233/ip";
var URL_GET_TOKEN = "https://fgaip-local.accesscontrol.windows.net/WRAPv0.9";
var URL_GET_DIVISIONS = "http://injuryprevention.cloudapp.net/ip/Divisions";
var URL_GET_COMPANIES = "http://injuryprevention.cloudapp.net/ip/Companies";
var URL_GET_DISTRICTS = "http://injuryprevention.cloudapp.net/ip/Districts";
var URL_GET_CATEGORIES = "http://injuryprevention.cloudapp.net/ip/categories";
var URL_GET_LOCATION = URL + "/locations/GetByDistance";
var URL_GET_MYCONTACTS = URL + "/contacts/get/0?isDraft=false";
var URL_GET_MYTASKS = URL + "/tasks/get/0";
var URL_GET_MYTASKSCOUNT = URL + "/tasks/count/0";
var URL_GET_MYCONTACTSCOUNT = URL + "/contacts/count/0?isDraft=false";
var URL_SEARCH_USER_BY_NAME = URL + "/users?filter=";
var URL_CREATE_CONTACT = URL + "/contacts/add/0";

var EDIT_MODE_EDITCONTACT = "EditContact";
var EDIT_MODE_NEWCONTACT = "NewContact";
var EDIT_MODE_EDITDRAFT = "EditDraft";

var accessToken = "";
var emailAddress = "";
var isOnline = true;
var localId = 0;
var myContact;
var editMode;