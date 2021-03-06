var canvas = document.createElement('canvas');
canvas.width  = 800;
canvas.height = 600;
canvas.style.border   = "1px solid";

document.body.appendChild(canvas);

var ctx = canvas.getContext("2d");

var Circle = {
	centerX: canvas.width / 2,
	centerY: canvas.height / 2,
	radius: 70,
	color: '#000',

	draw: function(r) {
		this.radius = r
		ctx.beginPath();
		ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
		ctx.fillStyle =  this.color;
		ctx.globalAlpha = 0.7
		ctx.fill();
	}
}

Circle.draw();