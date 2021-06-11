var horloge		= $("#horloge"),
	temps 		= $("#temps"),
	start 		= $("#start"),
	pause 		= $("#pause"),
	continu 	= $("#continue");
	
var t = 60000;

var lancer = () => {
	start.on("click", (e) => {
		e.preventDefault();
		setTimer(t);
		
		start.hide();
		pause.show();
	});
	
	pause.on("click", function (e) {
		e.preventDefault();
		clearTimeout(window.t);
		
		stop(1, true);
		
		temps.css("opacity", .5);
		$(this).hide();
		continu.show();
	});
	
	continu.on("click", function (e) {
		e.preventDefault();
		temps.css("opacity", 1);
		
		stop(1, false);
		
		setTimeout(() => {
			setTimer(window.intOffset);
		}, 350);
		
		$(this).hide();
		pause.show();
	});
	
	setTimer(t);
};

function fini()
{
	start.show();
	pause.hide();
	continu.hide();
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke === 'undefined') {
	  stroke = true;
	}
	if (typeof radius === 'undefined') {
	  radius = 5;
	}
	if (typeof radius === 'number') {
	  radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else {
	  var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
	  for (var side in defaultRadius) {
		radius[side] = radius[side] || defaultRadius[side];
	  }
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
	  ctx.fill();
	}
	if (stroke) {
	  ctx.stroke();
	}
}

function setTimer(timer) {
	var debut = new Date();
	debut = debut.getTime();
	
	debuter(debut, timer);
	
	horloge.show();
	temps.show();
}

function debuter(debut,timer) {
	var d = new Date();
	window.intOffset = timer - (d.getTime() - debut);

	temps.html(Math.ceil(window.intOffset / 1000));

	window.pourcent = ( (d.getTime() - debut)*100 ) / timer;

	drawHorloge(1);

	if(window.intOffset <= 0) {
		fini();	
	} else {
		window.t = setTimeout("debuter(" + debut + "," + timer + ")",50);
	}
}

function getColor(pourcent) {
	pourcent = 100-pourcent;
	var r, g, b = 0;
	if(pourcent < 50) {
		r = 255;
		g = Math.round(5.1 * pourcent);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * pourcent);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}

function drawHorloge() {
	var canvas = document.getElementById("horloge"),
		ctx = canvas.getContext("2d");
	
	ctx.clearRect(0,0,140,700);
	
	ctx.beginPath();
	ctx.globalAlpha = 1;
	ctx.fillStyle = getColor(window.pourcent);
	ctx.rect(0,0,140,700,true,false);
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.globalAlpha = 1;
	ctx.fillStyle = "#bbb";
	ctx.rect(0,0,140,700*(window.pourcent)*0.01,true,false);
	ctx.fill();
	ctx.closePath();
}