// http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/
// We start by checking if the browser supports the
// Clipboard object. If not, we need to create a
// contenteditable element that catches all pasted data

var targetId = "";
var pasteCatcher = undefined;

$(document).ready(function(){
	var ctrlDown = false;
	var ctrlKey = 17, vKey = 86, cKey = 67;

	$(document).keydown(function(e) {
		if (e.keyCode === ctrlKey) ctrlDown = true;

	}).keyup(function(e) {
		if (e.keyCode === ctrlKey) ctrlDown = false;
	});

	$("body").keydown(function(e) {
		if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)){
			$("#paste-area").css("display", "block");
			$("#paste-area").focus();
		}
	});

	$("body").keyup(function(e) {
		if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)){
			$("#paste-area").blur();
			//do your sanitation check or whatever stuff here
			$("#paste-area").css("display", "none");
		}
	});
});

function startListeningForPasteEvents(target) {

	targetId = target;
	pasteCatcher = $('#paste-area');

	if (!window.Clipboard) {

		// Firefox allows images to be pasted into contenteditable elements
		pasteCatcher.attr("contenteditable", "");

		// We can hide the element and append it to the body,
		//pasteCatcher.style.opacity = 0;
		//document.body.appendChild(pasteCatcher);

		// as long as we make sure it is always in focus
		pasteCatcher.focus();
		$(document).on("click", function() { pasteCatcher.focus(); });
	}
	// Add the paste event listener
	window.addEventListener("paste", pasteHandler);
}

/* Handle paste events */
function pasteHandler(e) {
	l(e.clipboardData);
	// We need to check if event.clipboardData is supported (Chrome)
	if (e.clipboardData && e.clipboardData.items !== undefined) {
	// Already solved in anotrer lib
	// If we can't handle clipboard data directly (Firefox),
	// we need to read what was pasted from the contenteditable element
	// Get the items from the clipboard
      var items = e.clipboardData.items;
      if (items) {
         // Loop through all items, looking for any kind of image
         for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
               // We need to represent the image as a file,
               var blob = items[i].getAsFile();
			   l(blob);
               // and use a URL or webkitURL (whichever is available to the browser)
               // to create a temporary URL to the object
              //var URLObj = window.URL || window.webkitURL;
               //var source = URLObj.createObjectURL(blob);
				var reader = new FileReader();
				reader.onload = function(event){
					l(event.target.result)
					var index = firefoxPastedData.push(event.target.result);
					createImage(event.target.result, index-1, targetId);
				}; // data url!
				reader.readAsDataURL(blob);

               // The URL can then be used as the source of an image
            }
         }
      }

	} else {
		// This is a cheap trick to make sure we read the data
		// AFTER it has been inserted.
		setTimeout(checkInput, 1);
	}
}

/* Parse the input in the paste catcher element */
function checkInput() {
	// Store the pasted content in a variable
	var children = pasteCatcher.children();
	pasteCatcher.html("");

	$.each(children, function(index, child){
		// Clear previously pasted files
		//$(pasteCatcher).html("");
		l("child " + child.tagName);

		if (child) {
			// If the user pastes an image, src will represent base64 encoded image
			if (child.tagName === "IMG") {
				var index = firefoxPastedData.push(child.src);
				createImage(child.src, index-1, targetId);
			}
		}
	});
}