/* cookie manament */
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Lax";
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
        setCookie('mur2_wpc_accesstoken', 'value', 0);
        setCookie('mur2_wpc_sideid', 'value', 0);
        // reload the page to fresh the buttom 
        window.location.reload(false); 
    } else if (cname === "medium") {
        setCookie('mur2_medium_accesstoken', 'value', 0);
        window.location.reload(false); 
    }
}

// collapsible divs
function collapsible_listener() {
    console.log(document);
    var coll = document.getElementsByClassName("collapsible");
    var i;
    console.log(coll.length);
    for (i = coll.length; i--;) {
        
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.parentElement.nextSibling;            
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
                var iframe = content.firstChild;
                iframe.style.height =
                    iframe.contentWindow.document.body.offsetHeight + 'px';                                
            }
        });
    } 
}
collapsible_listener();