// mobShop API communication script

var ajaxQueue = [];
var ajaxQueueTimer;

$(document).ready(function (){
	ajaxQueueTimer = setInterval(ajaxQueueHandler, 2000);
	
	var doc = window.location.pathname.substring(1);
});

function ajaxQueueHandler(){
	if (ajaxQueue.length > 0){
		ajaxQueue[0]();
		ajaxQueue.shift();
	}
}