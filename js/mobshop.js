// mobShop API communication script

//const itemsUrl = "http://minecraft-ids.grahamedgecombe.com/items.json";
const itemsUrl = "http://shop.mctnet.tk/items.json";
const srvUrl = "http://shopw.mctnet.tk:2001/mobshop/api/v1/";
const connErrMsg = "<h1>Error</h1>" +
					"<p>Could not connect to server. Please check your connection or the availablity of the server." + 
					"<h3>What have just happened?</h3>" + 
					"<p>This web interface could not connect to the gaming server for obtaining online shopping information." +
					"<h3>What should I do?</h3>" + 
					"<p>There are probably few exceptions happening:</p>" + 
					"<ul>" +
					"<li>Computer connection unstable <p>You can try checking the connection to the internet of your computer.</p></li>" + 
					"<li>MCT-Network Server is currently down <p>Server might be down for maintenance.</p></li>" + 
					"<li>Your IP has been blocked. <p>If you had been creating connections so fast (i.e. DDoS attack) or entering passwords wrong, your IP is probably banned. Please <a href=\"contact.html\">contact us</a> if you believe your IP has been blocked for unknown reason.</li>" +
					"</ul>";
const fastErrMsg = "<h1>Error</h1>" +
					"<p>You are connecting to the gaming server too fast!</p>" + 
					"<h3>What have just happened?</h3>" + 
					"<p>The request was ignored and returned a messsage that you are connecting to the server too fast!" +
					"<h3>What should I do?</h3>" + 
					"<p>There are probably few exceptions happening:</p>" + 
					"<ul>" +
					"<li>Having more than one browsers or tabs opening this page <p>Always keep one browser or tab opening the online shopping platform.</p></li>" + 
					"<li>You are running a DDoS attack <p>Hmm... I hope that won't happen on you.</p></li>" +
					"</ul>" +
					"<p>Please solve this problem otherwise a increasing fail count to 10 will cause a ban/block of your IP address!</p>";
const blockedErrMsg = "<h1>Strict Warning</h1>" +
					"<p>Your IP has been blocked for 5 minutes.</p>" + 
					"<h3>What have just happened?</h3>" + 
					"<p>You might have been violating the Terms of Service. Creating new connections too fast or entering wrong password can cause a ban/blocking of your IP address.</p>" +
					"<h3>What should I do?</h3>" + 
					"<ul>" +
					"<li>Wait for 5 minutes to be released</li>" + 
					"<li>Reset your password in MC but not attempting to crack it by entering to the login page</li>" +
					"<li><a href=\"contact.html\">Contact us</a> to tell us a proper reason for release</li>"
					"<li>I don't know what is happening. <p>Your account might be under attack. Please <a href=\"contact.html\">contact us</a></p></li>" +
					"</ul>";
const unknErrMsg = "<h1>Error</h1>" +
					"<p>Unexpected error result code received.</p>" + 
					"<h3>What have just happened?</h3>" + 
					"<p>Something abnormal after the server request</p>" +
					"<h3>What should I do?</h3>" + 
					"<p>Please <a href=\"contact.html\">contact us</a> with this page opened or send the following server message.";
var ajaxQueue = [];
var ajaxQueueTimer = null;

var shopItemUid = null;
var itemsJson = null;
var shopItemsArr = null;

$(document).ready(function (){
	ajaxQueueTimer = setInterval(ajaxQueueHandler, 2000);
	if (typeof(Storage) == "undefined") {
		alert("This page requires LocalStorage to use. But your browser does not support LocalStorage. Now redirecting to home page.");
		window.location = "http://shop.mctnet.tk/";
	}
	
	downloadMcItemJson();
	
	var doc = window.location.pathname.substring(1);
	console.log(doc);
	if (doc.endsWith("shop.html")){
		localStorage.removeItem("shopItemUid");
		localStorage.removeItem("shopItems");
		console.log("shop");
		var shopName = localStorage.getItem("shopName");
		if (shopName == null){
			console.log("nullset");
			localStorage.setItem("shopName", "_____global_____");
			shopName = "_____global_____";	
		}
		
		if (shopName == "_____global_____"){
			console.log("globalshop");
			var reqJson = {
				action: 2
			};
			var fun = function(){
				$.ajax({
					url: srvUrl,
					method: "POST",
					dataType: "json",
					data: JSON.stringify(reqJson),
					timeout: 10000,
					error: function(){
						$("#loadMsgHeading").html("Error when connecting to server");
						$("#loadMsgBody").html(connErrMsg);
					},
					success: function(data){
						console.log(data);
						if (data.result == 0){
							shopItemsArr = data.items;
							localStorage.setItem("shopItems", JSON.stringify(shopItemsArr));
							$("#shopNameTitle").html("All shops");
							$("#loadMsg").attr("style", "display: none");
							$("#shopContainer").attr("style", "display: block");
							refreshShopItems();
						} else if (data.result == -2){
							$("#loadMsgHeading").html("Connection throttled");
							$("#loadMsgBody").html(fastErrMsg + "<p>You have failed to access to the interface for " + data.fail + " times.</p>");
						} else if (data.result == -3){
							$("#loadMsgHeading").html("Your IP address has been blocked");
							$("#loadMsgBody").html(blockedErrMsg);
						} else {
							$("#loadMsgHeading").html("Error when requesting server for information");
							$("#loadMsgBody").html(unknErrMsg + "<h3>Server Message</h3><p>Result code: <code>" + data.result + "</code></p><p>Fail count (if available): <code>" + data.fail + "</code> (automatically blocks if this count is larger than 10)</p><p>Message: <pre>" + data.message + "</pre></p>");
						}
					}
				});
			};
			ajaxQueue.push(fun);
		}
	} else if (doc.endsWith("shop_item.html") || doc.endsWith("purchase.html")){
		shopItemUid = localStorage.getItem("shopItemUid");
		var shopItemsArrStr = localStorage.getItem("shopItems");
		
		if (shopItemUid == null || shopItemsArrStr == null){
			window.location = "shop.html";
			return;	
		}
		
		shopItemsArr = JSON.parse(shopItemsArrStr);
		
		var shopItemJson = getItemByUid(shopItemUid);
		
		if (shopItemJson == null){
			window.location = "shop.html";
			return;
		}
		
		var shopName = shopItemJson.shopName;
		$("#shopNameTitle").html(shopName);
		
		var itemsOfShop = getItemsOfShop(shopName);
		
		if (itemsOfShop != null || itemsOfShop.length > 0){
			var linksNodeStr = "";
			var i;
			for (i = 0; i < itemsOfShop.length; i++){
				linksNodeStr += "<a href=\"#\" onclick=\"item_detail('" + itemsOfShop[i].uid + "')\" class=\"list-group-item" + (itemsOfShop[i].uid == shopItemUid ? " active" : "") + "\">" + itemsOfShop[i].itemName + "</a>";
			}
			$("#shopItemsLinks").html(linksNodeStr);	
		}
		
		var captionNodeStr = "";
		if (shopItemJson.buyAllowed){
			captionNodeStr += "<h4 class=\"pull-right\">mob$" + shopItemJson.buyPrice + " per " + shopItemJson.amount + "</h4>";	
		} else {
			captionNodeStr += "<h4 class=\"pull-right text-danger\">Not for sale</h4>";
		}
		captionNodeStr += "<h4>" + shopItemJson.itemName + "</h4>";
		captionNodeStr += "<p>" + shopItemJson.desc + "</p>";
		
		if (doc.endsWith("shop_item.html")){
			captionNodeStr += "<a href=\"#\" class=\"btn btn-primary\" onclick=\"buy_item('" + shopItemUid + "')\">Buy now</a>";	
		}
		
		$("#shopItemCaption").html(captionNodeStr);
		
		if (itemsJson == null){
			downloadMcItemJson().done(function(){
				var imageSrc = getImgOfItemName(shopItemJson.itemName);
				if (imageSrc != null){
					$("#shopItemImage").attr("src", imageSrc);
				}	
			});	
		} else {
			var imageSrc = getImgOfItemName(shopItemJson.itemName);
			if (imageSrc != null){
				$("#shopItemImage").attr("src", imageSrc);
			}	
		}
	}
});

function item_detail(uid){
	localStorage.setItem("shopItemUid", uid);
	window.location = "shop_item.html";	
}

function buy_item(uid){
	localStorage.setItem("shopItemUid", uid);
	window.location = "purchase.html";	
}

function sendPay(){
		
}

function downloadMcItemJson(){
	return $.ajax({
		url: itemsUrl,
		dataType: "json",
		timeout: 10000,
		success: function(data){
			itemsJson = data;
		},
		error: function(xhr, text_status, err){
			alert("Unexpected error when loading Minecraft items JSON.\n\nText status: " + text_status + "\nError: " + err);
			window.location = "http://shop.mctnet.tk/";	
		}
	});	
}

function getItemsOfShop(shopName){
	if (shopItemsArr != null){
		var items = [];
		var i;
		for (i = 0; i < shopItemsArr.length; i++){
			if (shopItemsArr[i].shopName == shopName){
				items.push(shopItemsArr[i]);
			}
		}
		return items;
	}
}

function getItemByUid(uid){
	if (shopItemsArr != null){
		var i;
		for (i = 0; i < shopItemsArr.length; i++){
			if (shopItemsArr[i].uid == uid){
				return shopItemsArr[i];
			}
		}
	}
}

function getImgOfItemName(name){
	if (itemsJson != null){
		var i;
		for (i = 0; i < itemsJson.length; i++){
			if (itemsJson[i].text_type.toLowerCase() == name.toLowerCase()){
				return "items/" + itemsJson[i].type + "-" + itemsJson[i].meta + ".png";
			}
		}
	}
}

/*
<div class="col-sm-4 col-lg-4 col-md-4">
                        <div class="thumbnail">
                            <img src="http://placehold.it/320x150" alt="">
                            <div class="caption">
                                <h4 class="pull-right">$24.99</h4>
                                <h4><a href="#">First Product</a>
                                </h4>
                                <p>See more snippets like this online store item at <a target="_blank" href="http://www.bootsnipp.com">Bootsnipp - http://bootsnipp.com</a>.</p>
                            </div>
                            <div class="ratings">
                                <p class="pull-right">15 reviews</p>
                                <p>
                                    <span class="glyphicon glyphicon-star"></span>
                                    <span class="glyphicon glyphicon-star"></span>
                                    <span class="glyphicon glyphicon-star"></span>
                                    <span class="glyphicon glyphicon-star"></span>
                                    <span class="glyphicon glyphicon-star"></span>
                                </p>
                            </div>
                        </div>
                    </div>
*/

function refreshShopItems(){
	var nodesStr = "";
	var i;
	for (i = 0; i < shopItemsArr.length; i++){
		var shopItemJson = shopItemsArr[i];
		nodesStr += "<div class=\"col-sm-4 col-lg-4 col-md-4\">";
		nodesStr += "<div class=\"thumbnail\">";
		
		var itemImg = getImgOfItemName(shopItemJson.itemName);
		
		if (itemImg != null){
			nodesStr += "<img src=\"" + itemImg + "\" style=\"width:auto; height:150px;\" alt=\"\">";
		} else {
			nodesStr += "<img src=\"http://placehold.it/320x150\" alt=\"\">";
		}
		
		nodesStr += "<div class=\"caption\">";
		if (shopItemJson.buyAllowed){
			nodesStr += "<h4 class=\"pull-right\">mob$" + shopItemJson.buyPrice + "/" + shopItemJson.amount + "</h4>";	
		} else {
			nodesStr += "<h4 class=\"pull-right text-danger\">Not for sale</h4>"
		}
		nodesStr += "<h4><a href=\"#\" onclick=\"javascript:item_detail('" + shopItemJson.uid + "')\">" + shopItemJson.itemName + "</a></h4>";
		nodesStr += "<p>" + shopItemJson.desc + "</p>";
		nodesStr += "</div>";
		
		nodesStr += "<div class=\"ratings\">";
		nodesStr += "<p class=\"pull-right\">Item not rated</p>";
		nodesStr += "<p>";
		
		//TODO Implement rating system
		nodesStr += "<span class=\"glyphicon glyphicon-star-empty\"></span>";
		nodesStr += "<span class=\"glyphicon glyphicon-star-empty\"></span>";
		nodesStr += "<span class=\"glyphicon glyphicon-star-empty\"></span>";
		nodesStr += "<span class=\"glyphicon glyphicon-star-empty\"></span>";
		nodesStr += "<span class=\"glyphicon glyphicon-star-empty\"></span>";
		
		nodesStr += "</p>";
		nodesStr += "</div>";
		nodesStr += "</div>";
		nodesStr += "</div>";
		/*
		if (shopItemJson.sellAllowed){
			nodesStr += "<h4 class=\"pull-right\">Sell for mob$" + shopItemJson.sellPrice + "</h4>";	
		}
		*/
	}
	$("#shopItemsRow").html(nodesStr);
}

function ajaxQueueHandler(){
	if (ajaxQueue.length > 0){
		ajaxQueue[0]();
		ajaxQueue.shift();
	}
}