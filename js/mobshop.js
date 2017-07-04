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
const wrongCredErrMsg = "<h1>Unable to login</h1>" +
					"<p>Your username or password was incorrect. You might have not registered for online service. <b>Do not try password.</b> Reset or setup your account at <a href=\"register.html\">here</a>.</p>" + 
					"<h3>What have just happened?</h3>" + 
					"<p>Payment have failed as the credentials specified was invalid. Or the account specified is even not registered." +
					"<h3>What should I do?</h3>" + 
					"<p>There are probably few exceptions happening:</p>" + 
					"<ul>" +
					"<li>You have not registered for online service <p>You have to register for online service with <a href=\"register.html\">these instructions</a>.</p></li>" + 
					"<li>You are trying for a correct password <p>No, please stop. You are violating the Terms of Service.</p></li>" +
					"<li>You accidentally typed a wrong password <p>Okay, try it again :D</p></li>"
					"</ul>" +
					"<p>Please solve this problem otherwise a increasing fail count to 10 will cause a ban/block of your IP address!</p>";
const noItemErrMsg = "<h1>Error</h1>" +
					"<p>The specified shop item does not exist.</p>" + 
					"<h3>What have just happened?</h3>" + 
					"<p>Could not find the requested shop item." +
					"<h3>What should I do?</h3>" + 
					"<p>There are probably few exceptions happening:</p>" + 
					"<ul>" +
					"<li>The shop item was removed by the owner recently.</li>" + 
					"<li>You entered to a wrong page.</li>" +
					"</ul>";
const mcItemInvalidErrMsg = "<h1>Error</h1>" +
					"<p>The Minecraft Item Name for the shop item was invalid.</p>" + 
					"<h3>What have just happened?</h3>" + 
					"<p>In the Minecraft items database, this shop item's Minecraft item name was not found in the database." +
					"<h3>What should I do?</h3>" + 
					"<p>The database of shop items is probably broken. Please <a href=\"contact.html\">contact us</a> immediately with this page open.</p>";
const noBalanceErrMsg = "<h1>Insufficient balance</h1>" +
					"<p>Opps... you don't have enough mobs$ (money) to buy this shop item!</p>" + 
					"<p>You can gain mobs$ (money) by selling items in-game in the offical or residence shops. Nevertheless, you can also <a href=\"support_srv.html\">support us</a> to gain mobs$ (money)!</p>";
const noStackErrMsg = "<h1>Insufficient stack</h1>" +
					"<p>The shop item owner does not have enough remaining stacks for purchasing this shop item.</p>" + 
					"<p>Please contact the shop owner in-game using the <code>/mail</code> command!</p>";
const transErrMsg = "<h1>Transaction Error</h1>" +
					"<p>Unexpected transaction error occurred. Please <a href=\"contact.html\">contact us</a> immediately with this page open.</p>";
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
var shopsArr = null;

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
							shopsArr = data.shops;
							localStorage.setItem("shops", JSON.stringify(shopsArr));
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
		var shopsArrStr = localStorage.getItem("shops");
		
		if (shopItemUid == null || shopItemsArrStr == null || shopsArrStr == null){
			window.location = "shop.html";
			return;	
		}
		
		shopsArr = JSON.parse(shops);
		shopItemsArr = JSON.parse(shopItemsArrStr);
		
		var shopItemJson = getItemByUid(shopItemUid);
		
		if (shopItemJson == null){
			window.location = "shop.html";
			return;
		}
		
		var shopName = shopItemJson.shopName;
		
		var shopJson = getShopByName(shopName);
		
		if (shopJson == null){
			alert("The associated shop of this shop item does not exist. The shop identifier sign may be removed.");
			window.location = "shop.html";
			return;
		}
		
		if (doc.endsWith("shop_item.html")){
			$("#shopNameTitle").html(shopName + " <a href=\"http://shopw.mctnet.tk:2001/map/?worldname=world&mapname=flat&zoom=6&x=" + shopJson.x + "&y=" + shopJson.y + "&z=" + shopJson.z + "\" class=\"btn btn-info\" target=\"_blank\">Show In Map</a>");
		
			var itemsOfShop = getItemsOfShop(shopName);
		
			if (itemsOfShop != null || itemsOfShop.length > 0){
				var linksNodeStr = "";
				var i;
				for (i = 0; i < itemsOfShop.length; i++){
					linksNodeStr += "<a href=\"#\" onclick=\"item_detail('" + itemsOfShop[i].uid + "')\" class=\"list-group-item" + (itemsOfShop[i].uid == shopItemUid ? " active" : "") + "\">" + itemsOfShop[i].itemName + "</a>";
				}
				$("#shopItemsLinks").html(linksNodeStr);	
			}
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
			if (shopItemJson.buyAllowed){
				captionNodeStr += "<a href=\"#\" class=\"btn btn-primary\" onclick=\"buy_item('" + shopItemUid + "')\">Buy now</a>";	
			}
			captionNodeStr += "<a href=\"http://shopw.mctnet.tk:2001/map/?worldname=world&mapname=flat&zoom=6&x=" + shopItemJson.x + "&y=" + shopItemJson.y + "&z=" + shopItemJson.z + "\" class=\"btn btn-info\" target=\"_blank\">Show Shop Item Sign On Map</a>"	
		}
		
		if (doc.endsWith("purchase.html")){
			if (!shopItemJson.buyAllowed){
				alert("This shop item is marked as not for sale. You cannot buy this product.");
				window.location = "shop.html";
				return;
			}
			$("#paymentNotice").html("You are paying " + shopItemJson.owner + " (" + shopName + ") for mob$" + shopItemJson.buyPrice + ".");	
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

function boldObj(obj){
	var html = obj.html();
	if (!html.startsWith("<b>") && !html.endsWith("</b>")){
		obj.html("<b>" + html + "</b>");	
	}
}

function unboldObj(obj){
	var html = obj.html();
	if (html.startsWith("<b>") && html.endsWith("</b>")){
		obj.html(html.substring(3, html.length - 4));
	}
}

function sendPay(){
	if ($("#usr").val() == "" || $("#pwd").val() == ""){
		alert("Please enter your credentials.");
		return;	
	}
	
	if (!confirm("Please verify your credentials. Are you sure to pay?")){
		return;
	}
	
	$("#noticeContainer").attr("style", "display: none");
	$("#progressContainer").attr("style", "display: block");
	
	ajaxQueue.push(function(){
		unboldObj($("#prog1"));
		boldObj($("#prog2"));
	
		var reqJson = {
			action: 3,
			shopItemUid: shopItemUid,
			user: $("#usr").val(),
			pass: $("#pwd").val()
		};
	
		$("#usr").val("");
		$("#pwd").val("");
		
		usr = null;
		pwd = null;
		$.ajax({
			url: srvUrl,
			method: "POST",
			data: JSON.stringify(reqJson),
			dataType: "json",
			success: function(data){
				if (data.result == 0){
					unboldObj($("#prog2"));
					boldObj($("#prog6"));
					$("#statusIcon").html("<i class=\"text-success glyphicon glyphicon-ok\" style=\"font-size:6em;\"></i>");
					$("#details").html("<h3>Success</h3><p>Transaction success! You can gain your items by typing in <b>Games Server</b>: <code>/shop items</code>.</p><p class=\"text-center\"><a href=\"shop.html\" class=\"btn btn-primary\">Back to shop page</a></p>");
				} else if (data.result == -2){
					$("#statusIcon").html("<i class=\"text-danger glyphicon glyphicon-warning-sign\" style=\"font-size:6em;\"></i>");
					$("#details").html(fastErrMsg + "<p>You have failed to access to the interface for <code>" + data.fail + "</code> times.</p>");
				} else if (data.result == -3){
					$("#statusIcon").html("<i class=\"text-danger glyphicon glyphicon-warning-sign\" style=\"font-size:6em;\"></i>");
					$("#details").html(blockedErrMsg);
				} else if (data.result == -5){
					unboldObj($("#prog2"));
					boldObj($("#prog3"));
					$("#statusIcon").html("<i class=\"text-danger glyphicon glyphicon-warning-sign\" style=\"font-size:6em;\"></i>");
					$("#details").html(wrongCredErrMsg + "<p>You have failed to access to the interface for <code>" + data.fail + "</code> times.</p>");
				} else if (data.result == -6){
					unboldObj($("#prog2"));
					boldObj($("#prog4"));
					$("#statusIcon").html("<i class=\"text-danger glyphicon glyphicon-warning-sign\" style=\"font-size:6em;\"></i>");
					$("#details").html(noItemErrMsg);
				} else if (data.result == -7){
					unboldObj($("#prog2"));
					boldObj($("#prog4"));
					$("#statusIcon").html("<i class=\"text-danger glyphicon glyphicon-warning-sign\" style=\"font-size:6em;\"></i>");
					$("#details").html(mcItemInvalidErrMsg);
				} else if (data.result == -8){
					unboldObj($("#prog2"));
					boldObj($("#prog5"));
					$("#statusIcon").html("<i class=\"text-danger glyphicon glyphicon-warning-sign\" style=\"font-size:6em;\"></i>");
					$("#details").html(noBalanceErrMsg);
				} else if (data.result == -9){
					unboldObj($("#prog2"));
					boldObj($("#prog5"));
					$("#statusIcon").html("<i class=\"text-danger glyphicon glyphicon-warning-sign\" style=\"font-size:6em;\"></i>");
					$("#details").html(noStackErrMsg);
				} else if (data.result == -10){
					unboldObj($("#prog2"));
					boldObj($("#prog5"));
					$("#statusIcon").html("<i class=\"text-danger glyphicon glyphicon-warning-sign\" style=\"font-size:6em;\"></i>");
					$("#details").html(transErrMsg);
				} else {
					$("#statusIcon").html("<i class=\"text-danger glyphicon glyphicon-warning-sign\" style=\"font-size:6em;\"></i>");
					$("#details").html(unknErrMsg + "<h3>Server Message</h3><p>Result code: <code>" + data.result + "</code></p><p>Fail count (if available): <code>" + data.fail + "</code> (automatically blocks if this count is larger than 10)</p><p>Message: <pre>" + data.message + "</pre></p>");
				}
			},
			error: function(){
				//$("#loadingGif").attr("style", "display: none");
				$("#statusIcon").html("<i class=\"text-danger glyphicon glyphicon-warning-sign\" style=\"font-size:6em;\"></i>");
				$("#details").html(connErrMsg);
			}
		});
	});
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

function getShopByName(shopName){
	if (shops != null){
		var i;
		for (i = 0; i < shops.length; i++){
			if (shops[i].name == shopName){
				return shops[i];	
			}
		}
	}
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