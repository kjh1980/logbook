/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var searchTypes = ["logbook:", "tag:", "from:", "to:"];
var autocomplete = searchTypes;

$(document).ready(function(){
	// Wait for dataselect
	$('#load_logbooks').on('dataselected', function(e, data){
		generateSearchQuery(data);
	});

	// Wait for dataselect
	$('#load_tags').on('dataselected', function(e, data){
		generateSearchQuery(data);
	});

	// Wait for dataselect
	$('#load_time_from').on('dataselected', function(e, data){
		generateSearchQuery(data);
	});

	// Wait for dataselect
	$('#load_time_to').on('dataselected', function(e, data){
		generateSearchQuery(data);
	});

	// Wait for dataselect
	$('#load_time_from_to').on('dataselected', function(e, data){
		generateSearchQuery(data);
	});

	searchAutocomplete();
});

/**
 * When search event happens, parse input and make search.
 */
function activateSearch(){
	// Simple search
	var searchQuery = parseSearchQuery();

	if(searchQuery === ""){
		page = 1;
		loadLogs(page);

	} else {
		searchForLogs(searchQuery, true);
	}
}

/*
 * Start listening for Search multiple events.
 */
function startListeningForSearchEvents() {
	// Listen to a click of a button
	$("#search-button").click(function(e){
		activateSearch();
	});

	// Listen to press of an Enter key
	$("#search-query").keypress(function(e){

		if(e.which === 13) {
			activateSearch();
		}
	});
}

/**
 * Input search query and request data from the server
 * @param {type} searchQuery prebuilt search query
 * @param {type} resetPageCouner on some occasions we want page counter to be reset
 */
function searchForLogs(searchQuery, resetPageCouner) {

	// Reset pagecouner if new filters are selected
	if(resetPageCouner === true) {
		page = 1;
	}

	searchQuery = serviceurl + 'logs?' + searchQuery + 'page=' + page + '&limit=' + numberOfLogsPerLoad;
	searchURL = searchQuery;
	l(searchQuery);

	// Load logs
	$.getJSON(searchQuery, function(logs) {
		$(".log-last").remove();
		$(".log").remove();
		repeatLogs("template_log", "load_logs", logs);
		startListeningForLogClicks();
		scrollToLastLog();
		
		$('.log img').last().load(function(){
			l("ready!");
			scrollToLastLog();
		});
	});
}

// TODO: not really useful but it is a start
function buildSearchLanguage(value){

	var searchString = "";
	var filterType = "";
	var remainder = "";

	var re = new RegExp("(tag:|logbook:|from:|to:|^)(.*?)(tag:.*|logbook:.*|from:.*|to:.*|$)", "i");
	var searchParts = re.exec(value);

	if(searchParts === null) {
		searchString = value;

	} else {
		filterType = searchParts[1];
		searchString = searchParts[2];
		remainder = searchParts[3];
	}

	return [filterType, searchString, remainder];
}

/**
 * Parse bit by bit of information from search input
 * @returns {String} prepared search query
 */
function parseSearchQuery(){

	var value = $("#search-query").val();
	var query = "";

	var parsedStringParts = buildSearchLanguage(value);

	if(parsedStringParts[0] === "") {
		l("custom: " + parsedStringParts[1]);
		query += keyMap['search:'] + trim(parsedStringParts[1]) + "&";

	} else {
		if(keyMap[parsedStringParts[0]] !== undefined) {

			if(parsedStringParts[0] === "from:" || parsedStringParts[0] === "start:") {
				query += keyMap[parsedStringParts[0]] + returnTimeFilterTimestamp(trim(parsedStringParts[1]), undefined)[0] + "&";

			} else if(parsedStringParts[0] === "to:" || parsedStringParts[0] === "end:") {
				query += keyMap[parsedStringParts[0]] + returnTimeFilterTimestamp(undefined, trim(parsedStringParts[1]))[1] + "&";

			} else {
				query += keyMap[parsedStringParts[0]] + trim(parsedStringParts[1]) + "&";
			}
		}
	}

	while (parsedStringParts[2] !== "") {
		parsedStringParts = buildSearchLanguage(parsedStringParts[2]);
		//l(parsedStringParts[0] + ": " + parsedStringParts[1]);
		l(parsedStringParts);

		if(keyMap[parsedStringParts[0]] !== undefined) {

			if(parsedStringParts[0] === "from:" || parsedStringParts[0] === "start:") {
				query += keyMap[parsedStringParts[0]] + returnTimeFilterTimestamp(trim(parsedStringParts[1]), undefined)[0] + "&";

			} else if(parsedStringParts[0] === "to:" || parsedStringParts[0] === "end:") {
				query += keyMap[parsedStringParts[0]] + returnTimeFilterTimestamp(undefined, trim(parsedStringParts[1]))[1] + "&";

			} else {
				query += keyMap[parsedStringParts[0]] + trim(parsedStringParts[1]) + "&";
			}
		}
	}

	return query;
}

/**
 * Generate search input string and search query
 * @param {type} dataArray currently selected logbooks and tags
 * @returns {undefined}
 */
function generateSearchQuery(dataArray) {

	// If there is no data, try to get data from global variable
	if(dataArray === null) {
		dataArray = selectedElements;
	}

	var value = $("#search-query").val();
	var queryString = "";

	var parsedStringParts = buildSearchLanguage(value);

	var newValue = "";

	// Append general search to a search query
	if(parsedStringParts[0] === "" && value !== ""){
		newValue = parsedStringParts[1];
		queryString += "search=" + newValue + '&';

		if(newValue[newValue.length-1] !== " ") {
			newValue += " ";
		}
	}

	// If at least one logbook is selected, append logbook part to a search query
	if(dataArray['list'] !== undefined && dataArray['list'].length !== 0) {
		newValue += "logbook: " + dataArray['list'] + ' ';
		queryString += "logbook=" + dataArray['list'] + '&';
	}

	// If at least one tag is selected, append tag part to a search query
	if(dataArray['list2'] !== undefined && dataArray['list2'].length !== 0) {
		newValue += "tag: " + dataArray['list2'] + ' ';
		queryString += "tag=" + dataArray['list2'] + '&';
	}

	if(dataArray['from'] !== undefined && dataArray['from'].length !== 0) {
		newValue += "from: " + dataArray['from'] + ' ';
		queryString += "start=" + returnTimeFilterTimestamp(dataArray['from'], undefined)[0] + '&';
	}

	if(dataArray['to'] !== undefined && dataArray['to'].length !== 0) {
		newValue += "to: " + dataArray['to'] + ' ';
		queryString += "end=" + returnTimeFilterTimestamp(undefined, dataArray['to'])[1] + '&';
	}

	$("#search-query").val(newValue);
	searchForLogs(queryString, true);
}

function split(val) {
	return val.split(/ \s*/);
}

function extractLast(term) {
	return split(term).pop();
}

function searchAutocomplete() {

	$("#search-query")
		// don't navigate away from the field on tab when selecting an item
		.bind("keydown", function(event) {
			if (event.keyCode === $.ui.keyCode.TAB &&
				$(this).data("ui-autocomplete").menu.active) {
				event.preventDefault();
			}
		})
		.autocomplete({
			minLength: 0,
			source: function(request, response) {
				// delegate back to autocomplete, but extract the last term
				response($.ui.autocomplete.filter(
				autocomplete, extractLast(request.term)));
			},
			focus: function() {
				// prevent value inserted on focus
				return false;
			},
			select: function(event, ui) {
				var terms = split(this.value);
				// remove the current input
				terms.pop();

				var selectedItem = ui.item.value;

				// add the selected item
				terms.push(ui.item.value);

				if(selectedItem === "tag:") {
					autocomplete = savedTags.concat(searchTypes);

				} else if(selectedItem === "logbook:") {
					autocomplete = savedLogbooks.concat(searchTypes);
				}

				// add placeholder to get the comma-and-space at the end
				terms.push("");
				this.value = terms.join(" ");
				return false;
			}
		});
}