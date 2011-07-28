var Base64 = { 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}
		return output;
	},
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = Base64._utf8_decode(output); 
		return output;
	},
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
		return utftext;
	},
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}

var prompt_html;
chrome.extension.sendRequest(
	{method:'getStatusProtectPassword'},
	function(t){
		if(t.status == ''){ 
			prompt_html = '<div id="statusProtect" style="width:200px; height:200px; position:absolute; left:50%; top:50%; margin-left:-110px; margin-top:-110px; background:#3B5998; color:white; padding:10px; -webkit-box-shadow: 1px 1px 2px #AAA; border: 2px solid white; z-index: 100;"><strong>You haven\'t set your Status Protect password yet!</strong> Click on the Facebook shield icon in the top right, set your password, then reload the page. <img style="display:block; margin-top: 5px;" src="http://www.willcrichton.net/status/spPasswordSet.png" /></div>';
		} else {
			prompt_html = '<div id="statusProtect" style="width:160px; height:80px; position:absolute; left:50%; top:50%; margin-left:-90px; margin-top:-50px; background:#3B5998; color:white; padding:10px; -webkit-box-shadow: 1px 1px 2px #AAA; border: 2px solid white; z-index: 100;">	<form method="POST" onsubmit="if(this.realpass.value == this.password.value){var forms=document.getElementsByTagName(\'form\'); for(i in forms){ if(forms[i].action == (window.location.protocol + \'//\' + window.location.hostname + \'/ajax/updatestatus.php\')){forms[i].submit(); }} } else { var t = this.getElementsByTagName(\'span\'); t[0].innerHTML = \'Incorrect password.\';  } return false;">		Please enter your Status Protect password:<br />		<input type="password" name="password" /><br />		<input type="submit" value="Submit" /><input type="hidden" name="realpass" value="' + Base64.decode(t.status) + '" /><span style="color:red;" id="statusProtectError"></span>	</form></div>';
		}
	}
);



// Find the input on the page
function findInput(){
	var forms = document.getElementsByTagName('form');
	for(i in forms){
		var f = forms[i];
		if(f.action == (window.location.protocol + "//" + window.location.hostname + "/ajax/updatestatus.php")){
			return f;
		}
	}
}

// Check if we can submit
function doProtect(f){
	//if(f.action != (window.location.protocol + "//" + window.location.hostname + "/ajax/updatestatus.php")){ return true; }
	if(document.getElementById('statusProtect') == null){
		document.body.insertAdjacentHTML('beforeEnd',prompt_html);
	} 
	return false;
} 

// Check password validity
function checkPassword(f){
	alert(Base64.decode(localStorage.getItem('statusProtectPassword')));
	return false;
}

// Load the script
function loadProtect(){
	var f = findInput();
	if( typeof f != 'undefined' ){
		f.onsubmit = function(){return doProtect(this)};
	}
	setTimeout('loadProtect()',1000);
}

setTimeout('loadProtect()',200);
