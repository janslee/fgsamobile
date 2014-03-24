/*
	Page specific JavaScript:
*/
$(document).on('pageshow', '#myDrafts', function(event) {
	var rightColHeight = 0;
	var leftColHeight = 0;
	var $nextBlock;

	$('.draftBlock:even').each(function() {
		$nextBlock = $(this).next('.draftBlock');
		leftColHeight = $(this).height();
		rightColHeight = $nextBlock.height();

		if(leftColHeight > rightColHeight) {
			$nextBlock.height(leftColHeight);
		} else if(leftColHeight < rightColHeight) {
			$(this).height(rightColHeight);
		} else {
		}
	});
});

$(document).on('tap', ".contactList > li > .contactTitle.collapsed", function(event) {
	$(this).nextAll('.contactContent').show(); // for devices that don't support ~ selector
	$(this).toggleClass('collapsed');
	$(this).toggleClass('expanded');
	return false;
});

$(document).on('tap', ".contactList > li > .contactTitle.expanded", function(event) {
	$(this).nextAll('.contactContent').hide(); // for devices that don't support ~ selector
	$(this).toggleClass('expanded');
	$(this).toggleClass('collapsed');
	return false;
});

$(document).on('pagecreate', '#createNew_step3a', function(event) {
	$(".locationChoice > li > div").off().on('click', function(event) {
		if($(this).hasClass('collapsed')) {
			$(this).toggleClass('collapsed');
			$(this).toggleClass('expanded');
			return false;
		}

		if($(this).hasClass('expanded')) {
			$(this).toggleClass('expanded');
			$(this).toggleClass('collapsed');
			return false;
		}
	});
});

/*
remove, it is already defined in createNew_step3a.js
$(document).on('pageshow', '#createNew_step3a', function(event) {
	$("#chooseLocationDialog").popup('open');
});
*/
$(document).on('pagecreate', '#createNew_step4', function(event) {
	$(".addTasks > li > div.add").on('click', function() {
		$(this).addClass('inactive');
		$(this).siblings(".editTask").removeClass('inactive');
	});
});

$(document).on('pagecreate', '#createNew_complete', function(event) {
	$(".locationChoice > li > div").click(function() {
		//alert('hello world');
		if($(this).hasClass('collapsed')) {
			$(this).toggleClass('collapsed');
			$(this).toggleClass('expanded');
			return false;
		}

		if($(this).hasClass('expanded')) {
			$(this).toggleClass('expanded');
			$(this).toggleClass('collapsed');
			return false;
		}
	});
});

$(document).on('pagecreate', '#completeTask', function(event) {
	$(".addTasks > li > div").click(function() {
		$(this).addClass('inactive');
		$(this).next("div").removeClass('inactive');
	});
});