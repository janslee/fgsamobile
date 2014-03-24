function showLoader() {
    $('body').append("<div class='ui-loader-background'> </div>");
    $.mobile.loading('show', {
        text: 'loading...',
        textVisible: true,
        theme: 'a',
        textonly: false,
        html: ""
    });
}


function hideLoader() {
    $.mobile.loading('hide');
}