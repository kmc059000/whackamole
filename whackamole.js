/*

	Whack-A-Mole v0
	copyright 2010 Christopher Scott Hernandez

	JavaScript/HTML game written as a challenge by my friend Rob Allen at work.
	
	This document is licensed as free software under the terms of the
	MIT License: http://www.opensource.org/licenses/mit-license.php 
	
*/



// our one global
// ...thought about doing it like jquery
// what with the whole window.whackamole = whackamole bit, but... 
// i dunno... i like this better.. and i have to be different... :)
var whackamole = whackamole || (function(window, undefined) {
	

	// booleans, ints, and timers oh my!
	var game, score, popping, startTime, currentTime, clicked, moles, gameTimeout, hits = 0;
	
	// configuration options
	// TODO: make game configurable, by passing in options object like jquery plugin	
	var	hidingInterval = 750,
		poppingInterval = 1500,
		moleLimit = 20,
		quotes = [
			"That's weird...",
			"It's never done that before.",
			"It worked yesterday.",
			"How is that possible?",
			"What did you type in wrong to get it to crash?",
			"There is something funky in your data.",
			"I haven't touched that module in weeks!",
			"You must have the wrong version.",
			"It's just some unlucky coincidence.",
			"I can't test everything!",
			"THIS can't be the source of THAT.",
			"It works, but it hasn't been tested.",
			"Somebody must have changed my code.",
			"Did you check for a virus on your system?",
			"You can't use that version on your system.",
			"Why do you want to do it that way?",
			"It works on my machine.",
			"It worked before and I *swear* I didn't change a thing!",
			"I couldn't reproduce your problem.",
			"That must be a bug in somebody else's code",
			"You'll have to wait, my code is compiling",
			"You're doing it wrong",
			"Actually, that's a feature",
			"That isn't my code.",
			"I forgot to commit the code that fixes that",
			"I have too many other high priority things to do right now",
			"I'm not familiar with it so I didn't fix it in case I made it worse",
			"I thought I finished that",
			"It must be because of a leap year",
			"It's a browser compatibility issue",
			"It's always been like that",
			"Management insisted we wouldn't need to waste our time writing unit tests",
			"Nobody asked me how long it would actually take",
			"Nobody has ever complained about it",
			"Oh, that was just a temporary fix",
			"That code seemed so simple I didn't think it needed testing",
			"That error means it was successful",
			"That feature was slated for phase two",
			"That's already fixed it just hasn't taken effect yet",
			"That was literally a one in a million error",
			"That wasn't in the original specification",
			"The client wanted it changed at the last minute",
			"The existing design makes it difficult to do the right thing",
			"The marketing department made us put that there",
			"That was added for demos",
			"The original specification contained conflicting requirements",
			"The person responsible doesn't work here anymore",
			"Well, at least it displays a very pretty error",
			"Well at least we know not to try that again",
			"Well, that's a first",
			"We should have updated our software years ago",
			"What did I tell you about using parts of the system you don't understand?",
			"Why do you want to do it that way?",
			"Your browser must be caching the old content",
			"You're doing it wrong"
		];

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function getPersonClass() {
            switch(getRandomInt(0, 5)) {
                case 0: return 'devon';
                case 1: return 'jeff';
                case 2: return 'ken';
                case 3: return 'matt';
                case 4: return 'ryan';
            }
        }

        function getLiveClass() {
            return 'wam-pesky-mole alive_' + getPersonClass();
        }
		
	// utility function to get computed style
	// copied from a google search ;)
	function getStyle(el, cssprop){
		if (el.currentStyle) {
			return el.currentStyle[cssprop];
		} else if (document.defaultView && document.defaultView.getComputedStyle) {
			return document.defaultView.getComputedStyle(el, "")[cssprop];
		}
	}
	
	// main game methods
	// at first I was using a constructor like Mole()
	// but it seemed stupid to be calling new Mole() only once
	game = {
		mode: "start",
		// is it live? or live?
		live: function() {
			this.mole.className = getLiveClass();
			this.mole.clicked = false;
			$(this.quote).text(_.sample(quotes, 1));
			this.mode = "main";
		},
		// the violence
		kill: function() {
			var currentTime = (new Date).getTime();
			score += (Math.floor( ( ( poppingInterval - (currentTime - startTime) ) / poppingInterval) * 100 )) * 10;
			hits++;
			this.mole.className = this.mole.className.replace('alive', 'dead').replace('wam-pesky-mole', 'wam-pesky-mole-dead');
			this.mode = "dead";
		},
		move: function() {
			moles++;
			clicked = false;
			var top = Math.floor(Math.random() * (parseInt(getStyle(this.stage, "height")) - parseInt(getStyle(this.mole, "height")) - 130 )) + 140;
			var left = Math.floor(Math.random() * (parseInt(getStyle(this.stage, "width")) - parseInt(getStyle(this.mole, "width")) - 150)) + 100;

            this.mole.style.top = top + "px";
            this.mole.style.left = left + "px";

			this.quote.css('top', top - 100 + "px");
			this.quote.css('left', (left - 120) + "px");

			startTime = (new Date).getTime();
		},
		// this seems odd; this is what you get when writing code while speepy
		// let's leave it in... i don't think the game works without it. 
		togglePop: function() {
			$(this.mole).css('display', (popping) ? "block" : "none");
			this.quote.css('display', (popping) ? "block" : "none");
		},
		reset: function() {
			game.mode = "main";
			popping = false;
			hits = score = moles = 0;
		},
		// yeah, so.. these two don't really do a whole lot
		showStart: function() {
			this.startScreen.style.display = "block";
		},
		showScoreboard: function() {
			this.sb.style.display = "block";
		}
	}
	
	// main setup run once, instantiates three entities:
	// the "pesky" mole, the scoreboard, and the game stage
	// a lot of DOM scripting; probably rife with areas for optimization
	function setup(elementId) {
		
		var mole, sb, stage, quote;

		var container = $('#wam-game');
		container.css('width', document.documentElement.clientWidth - 50);

		container.css('height', document.documentElement.clientHeight - 50);

		
		// the mole
		mole = game.mole = document.createElement('div');
		mole.className = getLiveClass();
		mole.style.display = "none";
		// who needs cross-browser event handling?
		mole.onclick = function() {
			if (!game.mole.clicked) {
				game.kill();
				game.mole.clicked = true;
				game.scoreboard.update();
				window.clearTimeout(gameTimeout);
				step();
			}
		};

		quote = game.quote = $('<span/>');
		quote.addClass('quote');
		quote.text(_.sample(quotes, 1));
		quote.css('display', 'none');

		// the scoreboard
		sb = game.scoreboard = document.createElement("div");
		sb.className = "wam-scoreboard";
		sb.update = function() {
			this.innerHTML = "points: " + score + "<br />Moles: " + hits + " / " + moles;
		}
		
		// the start screen
		ss = game.startScreen = document.createElement("div");
		ss.className = "wam-startScreen";
		ss.innerHTML = "start";
		ss.style.display = "none";
		ss.onclick = function() {
			game.mode = "main";
			this.style.display = "none";
			step();
		}
		
		// the end screen 
		// this could really be called the "play again?" button
		// but i opted for brevity
		es = game.endScreen = document.createElement("div");
		es.className = "wam-endScreen";
		es.style.display = "none";
		es.innerHTML = "Play again?";
		es.onclick = function() {
			game.reset();
			game.mode = "main"
			this.style.display = "none";
			game.startScreen.display = "none";
			step();
			
		}
		
		// the game stage
		stage = game.stage = document.getElementById(elementId);
		stage.style.position = "relative";
	
		// build the thing..
		// i dunno, this just seems like it's screaming for a FOR loop
		// but i'm just lazy... i admit it.
		stage.appendChild(ss);
		stage.appendChild(sb);
		stage.appendChild(mole);
		stage.appendChild(quote.get(0));
		stage.appendChild(es);
		
	}
	
	// at first I was calling this "loop", but it wasn't really a loop
	// but more like a controller for the game, that various
	// objects would call to "step" the game forward
	// this could probably be refactored into something much more elegant
	// ...maybe for a rainy day...
	function step() {
		switch(game.mode) {
			case "start":
				game.showStart();
				break;
			case "dead":
				gameTimeout = setTimeout(function(){
					
					step();
				}, 500);
				game.mode = "main";
				break;
			case "main":
				game.scoreboard.update();
				if (moles >= moleLimit) {
					game.mode = "end";
					gameTimeout = setTimeout(step, 10);
					break;
				}
				game.live();
				game.togglePop();
				if (popping) game.move();
				popping = (popping) ? false : true;
				gameTimeout = setTimeout(step, (popping) ? hidingInterval : poppingInterval);
				break;
			case "end":
			default:
				window.location.href = window.location.href.replace('index', 'credits');
				game.scoreboard.innerHTML = "Final Score: " + score + "<br />Moles: " + hits + " / " + moles;
				game.endScreen.style.display = "block";
				break;
		}
	}
	
	// public interface
	// not really sure I need anything but "setup"
	// but it just seems any self respecting game should at least
	// have a few helpful public methods... i dunno... 
	// if the game got bigger...maybe it would make more sense...
	// anyhow...
	return {
		setup: function(element) {
			setup(element);
			this.start();
		},
		start: function() {
			game.reset();
			game.mode = "start";
			step();
		},
		stop: function() {
			game.mode = "dead";
			moles = moleLimit + 1;
			window.clearTimeout(gameTimeout);
			step();
		}
	};
	
})(window);