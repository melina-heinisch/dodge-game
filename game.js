/* ---------------------------- Canvas ------------------------------- */

function selectID(elem) {
    return document.getElementById(elem);
}

const canvas = selectID("myCanvas");
const ctx = canvas.getContext("2d");
const button1 = selectID("button1");
const button2 = selectID("button2");
const button3 = selectID("button3");
const buttonBack = selectID("buttonBack");
const hauptmenu = selectID("hauptmenu");
const gameovermenu = selectID("gameovermenu");
const specialmenu = selectID("specialmenu");
const ingame = selectID("ingame");
const pointsSpan = selectID("pointsSpan");
const highScoreSpan = selectID("highScoreSpan");
const endPointsSpan = selectID("endPointsSpan");
const winnsSpan = [selectID("winnsSpan1"), selectID("winnsSpan2"), selectID("winnsSpan3")]
const textHighScore = selectID("textHighScore");
const textNewWinner = selectID("textNewWinner");
const textNewWinnerSpan = selectID("textNewWinnerSpan");
const multiplayerDiv = selectID("multiplayerDiv");
const playerAnzeige = [selectID("player1"), selectID("player2"), selectID("player3")];
const svgBall2 = selectID("svgBall2");

var proMode = false;

/* ---------------------------- Vollbild etc. ------------------------------- */

document.oncontextmenu = function() {
	return false;
}

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	game.startMöglichkeitenFestlegen();
}

/* ---------------------------- mathematische Formeln ------------------------------- */

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; 
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function winkelBerechnen(p1, p2) {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function abstandBerechnen(p1, p2) {
	return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/* ---------------------------- Klassen ------------------------------- */

class Position {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}
class Size {
	constructor(w, h) {
		this.w = w;
		this.h = h;
	}
}

/* ---------------------------- Maus ------------------------------- */

var mousePosition = new Position(0, 0);
var mousePressedDown = false;

function setMousePosition(e) {
	mousePosition.x = e.clientX;
	mousePosition.y = e.clientY;
}

function mouseDown(e) {
	mousePressedDown = true;
	mousePosition.x = e.clientX;
	mousePosition.y = e.clientY;
}

function mouseUp() {
	mousePressedDown = false;
}

/* ---------------------------- Tasten ------------------------------- */

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var wPressed = false;
var aPressed = false;
var sPressed = false;
var dPressed = false;

function keyDownHandler(e) {
	if(e.keyCode == 39) {
		rightPressed = true;
	}
	if(e.keyCode == 37) {
		leftPressed = true;
	}
	if(e.keyCode == 38) {
		upPressed = true;
	}
	if(e.keyCode == 40) {
		downPressed = true;
	}
	if(e.keyCode == 87) {
		wPressed = true;
	}
	if(e.keyCode == 65) {
		aPressed = true;
	}
	if(e.keyCode == 83) {
		sPressed = true;
	}
	if(e.keyCode == 68) {
		dPressed = true;
	}
}
function keyUpHandler(e) {
	if(e.keyCode == 39) {
		rightPressed = false;
	}
	if(e.keyCode == 37) {
		leftPressed = false;
	}
	if(e.keyCode == 38) {
		upPressed = false;
	}
	if(e.keyCode == 40) {
		downPressed = false;
	}
	if(e.keyCode == 87) {
		wPressed = false;
	}
	if(e.keyCode == 65) {
		aPressed = false;
	}
	if(e.keyCode == 83) {
		sPressed = false;
	}
	if(e.keyCode == 68) {
		dPressed = false;
	}
}

/* ---------------------------- Game ------------------------------- */

class Game {

	constructor() {
		this.ball = []; //Startposition, Geschwindigkeit, ... - wird immer zurückgesetzt
		this.ballMitSpeicher = []; //Eigenschaften, die nicht gelöscht werden - extra Objekt
		this.hindernisse = [];
		this.farbpalette = ["#24BCFF", "#4FDE36", "#FFE200"];
		this.startpunkte = [0.3, 0.7, 0.5];
		this.startMöglichkeiten = [];
		this.hindernissZeit = new HindernissZeit();
		this.frame;
		this.spieler = 0;
		this.darfHindernisseErstellen = false;
		this.running = false; //um requestAnimationFrame zu stoppen (+ cancel...)
		this.buttonFrei = false; //mehrmaliges Drücken eines Buttons wird verhindert
		this.punktZahl = new PunktZahl;
		this.zuruecksetzen = false;
	}
	laden() {
		resizeCanvas();
	}
	start(player, ort) {
		if (this.running === false) {
			this.buttonFrei = true; //neuStart Visibility-"Bug" beim Laden
			console.log(player + " Player");
			this.punktZahl.points = 0;
			this.running = true;
			for (var i = 0; i < player; i++) {
				this.ball.push(new Ball(this.startpunkte[i], 0.25, this.farbpalette[i], i));
			}
			if (ort === "mainM" || this.zuruecksetzen) {
				this.zuruecksetzen = false;
				this.ballMitSpeicher.splice(0, this.ballMitSpeicher.length); //zurücksetzen der BallSpeicher-Werte (da Hauptmenü)
				for (var i = 0; i < player; i++) {
					this.ballMitSpeicher.push(new BallMitSpeicher());
				}
			}
			this.darfHindernisseErstellen = true;
			this.punktZahl.highScoreRendern();

			for (var i = 0; i < player; i++) {
				this.ballMitSpeicher[i].siegeRendern(i);
			}

			this.inGameRendern(player);

			this.spieler = player;
			this.loop();
			hauptmenu.classList.add("hauptmenu-fadeOut");
			ingame.classList.add("ingame-fadeIn");
		}
	}
	inGameRendern(player) {
		for (var i = 0; i < playerAnzeige.length; i++) { 
			playerAnzeige[i].style.display = "none" //zurücksetzen
		}
		if (player < 2) {
			multiplayerDiv.style.display = "none"; //komplett weg
		}
		else {
			multiplayerDiv.style.display = "flex";
			for (var i = 0; i < player; i++) {
				playerAnzeige[i].style.display = "flex"
			}
			if (player === 2) {
				svgBall2.classList.add("rotateLeft"); //keine endgültige Lösung, man muss die Container dynamisch erzeugen, damit :last-child funktioniert
			}
			else {
				svgBall2.classList.remove("rotateLeft");
			}
		}
	}
	sterben(n) { //wird über Hinderniss Kollision aufgerufem
		let a = this.ball[n].steuerung; //Zuordnung
		this.ball.splice(n,1);
		if (this.ball.length <= 0) {
			if (this.spieler > 1) {
				this.ballMitSpeicher[a].zaehlen();
			}
			this.gameOver();
			if (this.ballMitSpeicher[a].siege === 3) {
				textHighScore.classList.add("textHighScore-bottom");
				a += 1;
				textNewWinnerSpan.innerText = "Player " + a;
				textNewWinner.classList.add("textHighScore-fadeIn");
				this.zuruecksetzen = true;
			}
		}
	}
	gameOver() {
		this.running = false;
		cancelAnimationFrame(this.frame);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.ball.splice(0, this.ball.length);
		this.hindernisse.splice(0, this.hindernisse.length);
		this.darfHindernisseErstellen = false;
		this.hindernissZeit = new HindernissZeit();
		this.buttonFrei = true;
		if (this.punktZahl.points > this.punktZahl.highScore) {
			this.punktZahl.highScore = this.punktZahl.points;
			textHighScore.classList.add("textHighScore-fadeIn");
		}
		endPointsSpan.innerText = Math.round(this.punktZahl.points);
		ingame.classList.remove("ingame-fadeIn");
		gameovermenu.classList.add("gameovermenu-fadeIn");
		specialmenu.classList.add("specialmenu-fadeIn");
	}
	neuStart() {
		if (this.buttonFrei) {
			this.buttonFrei = false;
			this.start(this.spieler, "overM");
			this.classAddRemove();
		}
	}
	back() {
		if (this.buttonFrei) {
			this.buttonFrei = false;
			this.classAddRemove();
			hauptmenu.classList.remove("hauptmenu-fadeOut");
		}
	}
	classAddRemove() {
		gameovermenu.classList.remove("gameovermenu-fadeIn");
		textHighScore.classList.remove("textHighScore-fadeIn");
		textNewWinner.classList.remove("textHighScore-fadeIn");
		specialmenu.classList.remove("specialmenu-fadeIn");
		textHighScore.classList.remove("textHighScore-bottom");
	}
	startMöglichkeitenFestlegen() {
		this.startMöglichkeiten.splice(0, this.startMöglichkeiten.length);
		var a = 150;
		for (var i = 0; i < canvas.width; i++) {
			this.startMöglichkeiten.push(new Position(i,0-a));
			this.startMöglichkeiten.push(new Position(i,canvas.height+0.5*a));
		}
		for (var i = 0; i < canvas.height; i++) {
			this.startMöglichkeiten.push(new Position(0-a,i));
			this.startMöglichkeiten.push(new Position(canvas.width+0.5*a,i));
		}
	}
	hindernisseErstellen() { //wird über hindernissZeit getiment
		this.hindernisse.push(new Hindernisse());
	}
	loop() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (var i = 0; i < this.ball.length; i++) {
			this.ball[i].collisionBall(i);
		}
		for (var i = 0; i < this.ball.length; i++) {
			this.ball[i].bewegen();
			this.ball[i].collisionRand();
			this.ball[i].malen();
		}
		for (var i = 0; i < this.hindernisse.length; i++) {
			this.hindernisse[i].bewegen();
			this.hindernisse[i].malen();
			this.hindernisse[i].zaehlenFuerLoeschen();
			this.hindernisse[i].collisionDetection();

			if (this.hindernisse[i] && this.hindernisse[i].kannLoeschen) {
				this.hindernisse.splice(i,1);
				i -= 1; //da es in der Schleife noch drin ist
			}
		}

		if (this.darfHindernisseErstellen) {
			this.hindernissZeit.zaehlen();
		}

		this.punktZahl.zaehlen();

		if (this.running) {
			this.frame = requestAnimationFrame(() => {this.loop()});
		}
	}
}

class BallMitSpeicher {
	constructor() {
		this.siege = 0;
	}
	zaehlen() {
		this.siege += 1;
	}
	siegeRendern(i) {
		winnsSpan[i].innerText = this.siege;
	}
}

/* ---------------------------- Punkte ------------------------------- */

class PunktZahl {
		constructor() {
			this.points = 0;
			this.highScore = 0;
		}
		zaehlen() {
			this.points += 16.7;
			this.rendern();
		}
		rendern() {
			let p = Math.round(this.points);
			pointsSpan.innerText = p; //innerText oder textContent (für reinen Text) - innerHTML .. brauche ich hier nicht
		}
		highScoreRendern() {
			let h = Math.round(this.highScore);
			highScoreSpan.innerText = h;
		}
	}

/* ---------------------------- HindernissZeit ------------------------------- */

class HindernissZeit {
	constructor() {
		this.timer = 0;
		this.zahl = 60;

		this.wert = 0;
		if (proMode === true) {
			this.zahl = 7;
		}
	}
	zaehlen() { //wird 60x die Sekunde aufgerufen
		this.timer += 1;
		if (this.timer >= 60) {
			this.timer = 0;
			//hier kommt rein was einmal pro sekunde aufgerufen werden soll
			this.verringereZeitabstand();
		}

		this.wert += 1; //this.wert geht immer wieder hoch zu zahl
		if (this.wert >= this.zahl) { //this.zahl = 59 58 57 ...
			this.wert = 0;
			game.hindernisseErstellen();
		}
	}
	verringereZeitabstand() { //jede 1s
		if (this.zahl > 7) {
			this.zahl -= 0.6;
		}
	}
}

/* ---------------------------- Sound ------------------------------- */

// var context = new (window.AudioContext || window.webkitAudioContext)();

/* ---------------------------- Hindernisse ------------------------------- */

class Hindernisse {
	constructor() {
		let a = this.zufallPosition();
		this.position = new Position(game.startMöglichkeiten[a].x, game.startMöglichkeiten[a].y);
		this.size = this.sizeFestlegen();
		this.geschwindigkeit = getRandomArbitrary(1,4);
		this.richtung = this.richtungFestlegen();
		this.zaehler = 0;
		this.loeschwert = 6000/this.geschwindigkeit;
		this.kannLoeschen = false;
		this.color = "rgb(51,51,51)";
	}
	zaehlenFuerLoeschen() {
		this.zaehler += 1;
		if (this.zaehler > this.loeschwert) {
			this.kannLoeschen = true;
		}
	}
	collisionDetection() { //Kreis - Rechteck
		for (var i = 0; i < game.ball.length; i++) {

			let cc = new Position (game.ball[i].position.x, game.ball[i].position.y);

			if (game.ball[i].position.x < this.position.x) {
				cc.x = this.position.x;
			}
			else if (game.ball[i].position.x > this.position.x + this.size.w) {
				cc.x = this.position.x + this.size.w;
			}
			if (game.ball[i].position.y < this.position.y) {
				cc.y = this.position.y;
			}
			else if (game.ball[i].position.y > this.position.y + this.size.h) {
				cc.y = this.position.y + this.size.h;
			}

			let distance = abstandBerechnen(game.ball[i].position, cc);

			if (distance <= game.ball[i].radius) {
				this.kannLoeschen = true;
				game.sterben(i);
			}
		}
	}
	zufallPosition() {
		return getRandomInt(0, game.startMöglichkeiten.length - 1);
	}
	sizeFestlegen() {
		let a = getRandomInt(1,2);
		switch (a) {
			case 1 :
				return new Size(getRandomInt(40, 120),getRandomInt(12, 40));
			break;
			case 2 :
				return new Size(getRandomInt(12, 40),getRandomInt(40, 120));
		}
	}
	richtungFestlegen() {
		var a = 50;
		var x = getRandomInt(0 + a, canvas.width - a);
		var y = getRandomInt(0 + a, canvas.height - a);
		var position2 = new Position(x,y)
		var angle = winkelBerechnen(this.position, position2);
		return angle;
	}
	bewegen() {
		this.position.x += this.geschwindigkeit * Math.cos(this.richtung);
		this.position.y += this.geschwindigkeit * Math.sin(this.richtung);
	}
	malen() {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.rect(this.position.x, this.position.y, this.size.w, this.size.h);
		ctx.fill();
		ctx.closePath();
	}
}

/* ---------------------------- Spielball ------------------------------- */

class Ball {
	constructor(x,y,f,s) {
		this.position = new Position(x*canvas.width,y*canvas.height);
		this.farbe = f;
		this.radius = 30;
		this.geschwindigkeit = 6;
		this.angle = -0.2*Math.PI;
		this.aktuelleGeschwindigkeit = this.geschwindigkeit;
		this.steuerung = s;

		this.collision = false; //ab hier Abstoß untereinander
		this.angleH = 0;
		this.sHilfs = 25;
		this.sHilfs2 = this.sHilfs;
		this.abstossHilfs = 6;
		this.abstoss = this.abstossHilfs;
	}

	bewegen() {
		if (this.steuerung === 0) { //Maus
			this.aktuelleGeschwindigkeit = this.geschwindigkeit;
			let abstand = abstandBerechnen(this.position, mousePosition);
			this.angle = winkelBerechnen(this.position, mousePosition);

			let abbremsen = 100;
			let b = abbremsen/this.geschwindigkeit;
			if (abstand <= abbremsen) {
				this.aktuelleGeschwindigkeit = abstand/b;
			}
		}

		if (this.steuerung > 0) { //Pfeiltasten
			if (this.steuerung === 1) {
				var up = upPressed;
				var down = downPressed;
				var right = rightPressed;
				var left = leftPressed;
			}
			if (this.steuerung === 2) {
				var up = wPressed;
				var down = sPressed;
				var right = dPressed;
				var left = aPressed;
			}
			if (up && this.aktuelleGeschwindigkeit <= this.geschwindigkeit) {
				this.aktuelleGeschwindigkeit += 0.2;
			}
			if (down  && this.aktuelleGeschwindigkeit >= 0) {
				this.aktuelleGeschwindigkeit -= 0.2;
			}
			if (right) {
				this.angle += 0.08;
			}
			if (left) {
				this.angle -= 0.08;
			}
		}
		
		if (this.collision) {
			this.position.x -= this.abstoss * Math.cos(this.angleH);
			this.position.y -= this.abstoss * Math.sin(this.angleH);
		}
		if (this.collision && this.abstoss <= this.aktuelleGeschwindigkeit) {
			let g = this.aktuelleGeschwindigkeit - this.abstoss;
			this.position.x += g * Math.cos(this.angle);
			this.position.y += g * Math.sin(this.angle);
		}
		if (this.collision === false) { //normal
			this.position.x += this.aktuelleGeschwindigkeit * Math.cos(this.angle);
			this.position.y += this.aktuelleGeschwindigkeit * Math.sin(this.angle);
		}
	}

	collisionRand() {
		if (this.position.x + this.radius >= canvas.width) {
			this.position.x = canvas.width - this.radius;
		}
		if (this.position.x - this.radius <= 0) {
			this.position.x = 0 + this.radius;
		}
		if (this.position.y + this.radius >= canvas.height) {
			this.position.y = canvas.height - this.radius;
		}
		if (this.position.y - this.radius <= 0) {
			this.position.y = 0 + this.radius;
		}
	}

	collisionBall(n) {
		for (var i = 0; i < game.ball.length; i++) {
			if (i != n) { //dadurch nicht mit sich selbst
				if (abstandBerechnen(this.position, game.ball[i].position) <= this.radius*2) {
					this.collision = true;
					this.angleH = winkelBerechnen(this.position, game.ball[i].position);
					this.sHilfs2 = this.sHilfs;
					this.abstoss = this.abstossHilfs;
				}
			}
		}

		if (this.collision === true && this.sHilfs2 >= 0) {
			this.sHilfs2 -= 1;
			this.abstoss -= 0.2;
		}
		if (this.sHilfs2 <= 0) {
			this.collision = false;
			this.sHilfs2 = this.sHilfs;
			this.abstoss = this.abstossHilfs;
		}
	}

	malen() {
		var p1 = this.position.x;
		var p2 = this.position.y;

		ctx.beginPath();
		ctx.arc(p1, p2, this.radius, 0, Math.PI*2);
		ctx.fillStyle = this.farbe;
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(p1 + 14.5 * Math.cos(this.angle), p2 + 14.5 * Math.sin(this.angle), 14, 0, Math.PI*2);
		ctx.strokeStyle = "#666";
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.closePath();
	}
}

/* ---------------------------- Erstellen ------------------------------- */

var game = new Game();
game.laden();

/* ---------------------------- Event Listener ------------------------------- */

window.addEventListener("resize", resizeCanvas, false);

document.addEventListener("mousemove", setMousePosition, false);
document.addEventListener("mousedown", mouseDown, false);
document.addEventListener("mouseup", mouseUp, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

button1.addEventListener("mousedown", () => {game.start(1, "mainM")}, false);
button2.addEventListener("mousedown", () => {game.start(2, "mainM")}, false);
button3.addEventListener("mousedown", () => {game.start(3, "mainM")}, false);

buttonBack.addEventListener("click", () => {game.back()}, false);
gameovermenu.addEventListener("click", () => {game.neuStart()}, false);