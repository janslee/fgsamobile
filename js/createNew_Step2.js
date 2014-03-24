var contactId = 0;
function id(element) {
    return document.getElementById(element);
}

$(document).on("pagebeforeshow", "#createNew_step2a", function() {
    contactId = localId;
	fgaDB.contactPic.insertPic({"contactId":-1});
    if(localId == 0){
        contactId = -1;
    }
        
    //test for local storeage
    //fgaDB.open();
    //fgaDB.contactPic.createTable();
    //fgaDB.contactPic.insertPic({"contactId":"0","image1":"","image2":"","image3":""});

    //loading data
    fgaDB.contactPic.getPicById(contactId,function(pics){
        if(pics !== null){
            for (var i = 1; i < 6; i++ ){
                if (pics["image" + i]){
                    var preImageDiv = id("preImageDiv" + i);
                    var preImage = id("preImage" + i);
                    var addBtn = id("add" + i);
                    preImage.src = pics["image" + i];
                    preImageDiv.style.display = "block";
                    addBtn.style.display = "none";
                }
            }
        }
    });
});

$(document).on("pageshow", "#createNew_step2a", function (event) {
    createNewStep2Initialize();
});

var toggleVisible = function (o) {
    if (o.style.display == 'none') {
        o.style.display = 'block';
    } else {
        o.style.display = 'none';
    }
}
var createNewStep2Initialize = function () {
    console.log("camera initialized");
    //register add button onclick event
    $(".add").each(function (i) {
        var j = i + 1;
        $(this).on("tap", function (event) {
            console.log("index is:" + i);
            $("#addPhotoDialog").attr("data-selectedIdx", j);
            $("#addPhotoDialog").popup('open');
        });
    });
    //register remove pic onclick event
    $(".close").each(function (i) {
        var j = i + 1;
        $(this).on("tap", function (event) {
            $("#delPhotoDialog").attr("data-selectedIdx", j);
            $("#delPhotoDialog").popup('open');
        });
    });
    //register next button onclick event
    $("#step2NxtBtn").on("tap", function (event) {
        fgaDB.contactPic.updatePic({"image1":id('preImage1').src,"image2":id('preImage2').src,"image3":id('preImage3').src,"image4":id('preImage4').src,"image5":id('preImage5').src,"contactId":-1});
    })
    //register take photo button on click event
    $("#tp").on("tap", function () {
        capturePhoto();
    });
    //register Choose Existing button on click event
    $("#ce").on("tap", function () {
        getPhotoFromLibrary();
    });
    //register delete photo button on click event
    $('#delPhotoOkBtn').on("tap", function () {
        var idx = $("#delPhotoDialog").attr("data-selectedIdx");
        toggleVisible(id("preImageDiv" + idx));
        toggleVisible(id("add" + idx));
        id("preImage" + idx).src = "";
        console.debug("remove pic # :" + idx);
        $("#delPhotoDialog").popup("close");
    });
}
var capturePhoto = function () {
    // Take picture using device camera and retrieve image as base64-encoded string.
    navigator.camera.getPicture(_onPhotoDataSuccess, _onFail, {
        quality: 20,
        destinationType: 0
    });
}

var getPhotoFromLibrary = function () {
    _getPhoto(0);
}

var _getPhoto = function (source) {
    //alert(source);
    // Retrieve image file location from specified source.
    navigator.camera.getPicture(_onPhotoDataSuccess, _onFail, {
        quality: 20,
        destinationType: 0,
        sourceType: source
    });
}

var _onPhotoDataSuccess = function (imageData) {
    var idx = $("#addPhotoDialog").attr("data-selectedIdx");
    //alert(idx);
    var preImageDiv = id('preImageDiv' + idx);
    var preImage = id('preImage' + idx);
    var addBtn = id('add' + idx);
    preImageDiv.style.display = "block";
    addBtn.style.display = "none";
    preImage.style.display = 'block';
    $("#addPhotoDialog").popup("close");
    // Show the captured photo.
    preImage.src = "data:image/jpeg;base64," + imageData;
}

var _onFail = function (message) {
    alert(message);
    console.error("Error during creating contact: " + message);
}

//added by anson for confirmation when leaving current page
$(document).on("tap", "#createNew_step2a .leaveThisPage", function () {
    toPage = $(this).attr("data");
    $("#saveDraftDialog2").popup('open');
});

$(document).on("tap", "#saveDraftYesBtn2", function () {
    saveContact(toPage);
});

$(document).on("tap", "#saveDraftNoBtn2", function () {
    fgaDB.contactPic.deletePicById(-1, function(){$.mobile.changePage(toPage);}) 

});