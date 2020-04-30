/* cookie manament */
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/*
 *  Input:
 *      - cname -- the name of the cookie
 *      - valuename -- user frendly name of the cookie
 */
function checkCookie(cname, valuename) {
  var value = getCookie(cname);
  if (value == "") {
    value = prompt("Please set the value for "+valuename+":", "");
    if (value != "" && value != null) {
      setCookie(cname, value, 365);
    }
  }
    
  return value;
} 

function clear_cookies(cname) {
    if ( cname === "wpc" ) {
        setCookie('wpc_username', 'value', 0);
        setCookie('wpc_password', 'value', 0);
        setCookie('wpc_home', 'value', 0);
    }
}

