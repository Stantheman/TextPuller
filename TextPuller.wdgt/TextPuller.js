/*
TextPuller.js
Stan Schwertly
www.schwertly.com
*/

function changeResultText(text) 
{
    document.getElementById("taskText").innerHTML = text;
}

function onshow()
{
    var pullString = widget.preferenceForKey(makeKey("pullString"));

    // grabbed a good key
    if (pullString && pullString.length > 0)  
    {							
        var getText = "/opt/local/bin/curl "+ widget.preferenceForKey(makeKey("pullString"));
        var result = widget.system(getText, null).outputString;
        
        changeResultText("<pre><b>TaskWarrior Tasks</b>"+result+"</pre>"+
            "<div class=\"flip\" id='fliprollie'></div><div class='flip' id='flip' onclick='showPrefs(event);' " +
            "onmouseover='enterflip(event);' onmouseout='exitflip(event);'></div>");
                    
        var appWidth = window.innerWidth, appHeight = window.innerHeight;
        var divWidth = document.getElementById("taskText").clientWidth, divHeight = document.getElementById("taskText").clientHeight;
        
        // resize the window to fit. 
        // This needs love for shrinking from a larger window
        if (document.width > appWidth) {
            window.resizeBy(document.width-appWidth,0);
        }
        if (document.height > appHeight) {
            window.resizeBy(0,document.height-appHeight);
        }
        document.getElementById("urlInput").value = pullString;	// set the popup to reflect that
    }
    else    // no good key = you need to put a URL in
    {
       showPrefs();
    }
}

function setup()
{
	if(window.widget)		
    {
		var pullString = widget.preferenceForKey(makeKey("pullString"));
        widget.onshow = onshow;

		if (pullString && pullString.length > 0) 
		{											
            onshow();
			document.getElementById("idInput").text = pullString;	// populate the input field
        }

	}
}

function showPrefs()
{
	var front = document.getElementById("front");
	var back = document.getElementById("back");
	
	if (window.widget)
		widget.prepareForTransition("ToBack");		// freezes the widget so that you can change it without the user noticing
	
	front.style.display="none";		// hide the front
	back.style.display="block";		// show the back
	
	if (window.widget)
		setTimeout ('widget.performTransition();', 0);		// and flip the widget over	

	document.getElementById('fliprollie').style.display = 'none';  // clean up the front side - hide the circle behind the info button

}

function hidePrefs()
{
	var front = document.getElementById("front");
	var back = document.getElementById("back");
	
	if (window.widget)
		widget.prepareForTransition("ToFront");		// freezes the widget and prepares it for the flip back to the front
	
	back.style.display="none";			// hide the back
	front.style.display="block";		// show the front
	
	if (window.widget)
		setTimeout ('widget.performTransition();', 0);		// and flip the widget back to the front
    
    var inputURL = document.getElementById('urlInput').value;
    widget.setPreferenceForKey(inputURL,makeKey("pullString"));		// and save the new preference to disk
    widget.onshow();
}

function makeKey(key)
{
	return (widget.identifier + "-" + key);
}

function removed()
{
	widget.setPreferenceForKey(null,makeKey("pullString"));
}

// PREFERENCE BUTTON ANIMATION (- the pref flipper fade in/out)
var flipShown = false;		// a flag used to signify if the flipper is currently shown or not.


// A structure that holds information that is needed for the animation to run.
var animation = {duration:0, starttime:0, to:1.0, now:0.0, from:0.0, firstElement:null, timer:null};


// mousemove() is the event handle assigned to the onmousemove property on the front div of the widget. 
// It is triggered whenever a mouse is moved within the bounds of your widget.  It prepares the
// preference flipper fade and then calls animate() to performs the animation.

function mousemove (event)
{
	if (!flipShown)			// if the preferences flipper is not already showing...
	{
		if (animation.timer != null)			// reset the animation timer value, in case a value was left behind
		{
			clearInterval (animation.timer);
			animation.timer  = null;
		}
		
		var starttime = (new Date).getTime() - 13; 		// set it back one frame
		
		animation.duration = 500;												// animation time, in ms
		animation.starttime = starttime;										// specify the start time
		animation.firstElement = document.getElementById ('flip');		// specify the element to fade
		animation.timer = setInterval ("animate();", 13);						// set the animation function
		animation.from = animation.now;											// beginning opacity (not ness. 0)
		animation.to = 1.0;														// final opacity
		animate();																// begin animation
		flipShown = true;														// mark the flipper as animated
	}
}

// mouseexit() is the opposite of mousemove() in that it preps the preferences flipper
// to disappear.  It adds the appropriate values to the animation data structure and sets the animation in motion.

function mouseexit (event)
{
	if (flipShown)
	{
		// fade in the flip widget
		if (animation.timer != null)
		{
			clearInterval (animation.timer);
			animation.timer  = null;
		}
		
		var starttime = (new Date).getTime() - 13;
		
		animation.duration = 500;
		animation.starttime = starttime;
		animation.firstElement = document.getElementById ('flip');
		animation.timer = setInterval ("animate();", 13);
		animation.from = animation.now;
		animation.to = 0.0;
		animate();
		flipShown = false;
	}
}


// animate() performs the fade animation for the preferences flipper. It uses the opacity CSS property to simulate a fade.

function animate()
{
	var T;
	var ease;
	var time = (new Date).getTime();
		
	
	T = limit_3(time-animation.starttime, 0, animation.duration);
	
	if (T >= animation.duration)
	{
		clearInterval (animation.timer);
		animation.timer = null;
		animation.now = animation.to;
	}
	else
	{
		ease = 0.5 - (0.5 * Math.cos(Math.PI * T / animation.duration));
		animation.now = computeNextFloat (animation.from, animation.to, ease);
	}
	
	animation.firstElement.style.opacity = animation.now;
}


// these functions are utilities used by animate()

function limit_3 (a, b, c)
{
    return a < b ? b : (a > c ? c : a);
}

function computeNextFloat (from, to, ease)
{
    return from + (to - from) * ease;
}

// these functions are called when the info button itself receives onmouseover and onmouseout events

function enterflip(event)
{
	document.getElementById('fliprollie').style.display = 'block';
}

function exitflip(event)
{
	document.getElementById('fliprollie').style.display = 'none';
}