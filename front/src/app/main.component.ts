import { Component, AfterViewInit, ViewChild, ElementRef, Input, Inject } from "@angular/core";
import {NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { RouterOutlet, RouterLink, ActivatedRoute, Router, Params} from "@angular/router";
import {BackendService, SendPointState, GetPointsState, ClearPointsState} from "./backend.service";
import { Observable } from "rxjs";
import {CookieService} from "./cookie.service";
     
@Component({
    selector: "main",
    standalone: true,
    imports: [FormsModule, HttpClientModule, NgIf],
	providers: [BackendService, CookieService],
	styles:`
	#app {
	  width: min-content;
	  margin: 0 auto;
	}

	#container {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  padding: 20px;
	  border: 1px solid #ccc;
	  border-radius: 10px;
	  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}

	canvas {
	  border: 1px solid #ccc;
	  border-radius: 10px;
	  padding: 10px;
	}

	table {
	  margin-top: 20px;
	}

	td {
	  padding: 10px;
	}

	button {
	  padding: 10px 20px;
	  background-color: #007bff;
	  color: #fff;
	  border: none;
	  border-radius: 10px;
	  cursor: pointer;
	  width: 50%;
	}

	button:hover {
	  background-color: #0056b3;
	}
	
	button:disabled{
		background-color: #B4D3FF;
	}

	#points {
	  margin-top: 20px;
	}

	th, td {
	  padding: 10px;
	}

	thead {
	  background-color: #f2f2f2;
	}
	
	input:invalid{
		background-color: #E3002E30;
	}
	
	#pointCoords{
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.errorMessage{
		color: red;
	}
	
	#app{
		display: flex;
	}
	
	@media(max-width: 657px){
		#app{
			align-items: center;
			flex-direction: column;
		}
		#app > *{
			margin-bottom: 10px;
		}
	}
	
	@media(min-width: 657px){
		#app{
			flex-direction: row;
			align-items: flex-start;
		}
		#app > *{
			margin-right: 10px;
		}
	}
	`,
    template: `	
				<div id="app">
					<div id="container">
						<canvas width="300" height="300" #myCanv (click)="onCanvasClick($event)">
							Скачай нормальный браузер!
						</canvas>
						<div id="pointCoords">
							<div>
								<label>x </label>
								<select [(ngModel)]="x" (ngModelChange)="redraw()">
									@for(comp of possibleX; track $index){
										<option [value]="comp">
											{{comp}}
										</option>
									}
								</select>
							</div>
							<div>
								<label>y </label>
								<input type="number" [class.invalid]="messageForY!=''" [(ngModel)]="y" [min]="-3" [max]="5" (ngModelChange)="redraw()" />
							</div>
							<div class="errorMessage"><p>{{messageForY}}</p></div>
							<div>
								<label>r </label>
								<select [(ngModel)]="r" (ngModelChange)="redraw()" [class.invalid]="messageForR!=''">
									@for(comp of possibleR; track $index){
										<option [value]="comp">
											{{comp}}
										</option>
									}
								</select>
							</div>
							<div class="errorMessage"><p>{{messageForR}}</p></div>
						</div>
						<div>
							<button (click)="sendPoint(x,y,r)" [disabled]='messageForY != "" || messageForR != ""'>Отправить точку</button>
							<button (click)="leave()">Ливнуть с акка</button>
							<button (click)="clearPoints()" [disabled]='points.length == 0'>Удалить точки</button>
						</div>
						<p class="errorMessage">{{errorMessage}}</p>
					</div>
					<table id="points">
					<thead>
						<tr><th>x</th><th>y</th><th>r</th><th>попадание</th></tr>
					</thead>
					<tbody>
					@for(u of points; track $index){
						<tr><td>{{u.x}}</td><td>{{u.y.toFixed(3)}}</td><td>{{u.r}}</td><td>{{u.inArea}}</td></tr>
					}
					</tbody>
					</table>
				</div>`
})

export class MainComponent implements AfterViewInit{
	@ViewChild('myCanv', { static: false })
	canvas: ElementRef<HTMLCanvasElement>;	
	
	constructor(private backend: BackendService, private router: Router, private cookies: CookieService){
		this.backend.token = cookies.getCookie('token');
		this.getPoints().then(e=>{this.redraw();});
		if(cookies.getCookie('x') !== undefined)
			this._x = Number(cookies.getCookie('x'));
		if(cookies.getCookie('y') !== undefined)
			this._y = Number(cookies.getCookie('y'));
		if(cookies.getCookie('r') !== undefined)
			this._r = Number(cookies.getCookie('r'));
	}
	
	ngAfterViewInit(){
		this.canvas.nativeElement.addEventListener("mousemove",ev=>{
			this.redraw();
			let rect = this.canvas.nativeElement.getBoundingClientRect();
			let x = (ev.clientX-rect.left-150-this.canvasPadding)/this.R_ed;
			let y = (150-ev.clientY+rect.top+this.canvasPadding)/this.R_ed;
			if(x>=-5 && x <= 3 && y >= -3 && y <= 5)
				this.drawPoint(Number(x.toFixed(0)),y,this.r, "pink");
		});
	}
	
	possibleX = [-5,-4,-3,-2,-1,0,1,2,3];
	possibleR = [-5,-4,-3,-2,-1,0,1,2,3];
	canvasPadding=10;
    _x: number = 0;
	_y: number = 0;
	_r: number = 1;
	points: any = [];
	messageForY = "";
	messageForR = "";
	errorMessage = "";
	R_ed = 30;
	async sendPoint(x:number, y:number, r:number){
		switch (await this.backend.sendPoint(x,y,r)){
			case SendPointState.Ok:
				this.errorMessage = "";
				break;
			case SendPointState.Unauthorized:
				this.leaveCauseOfSession();
				break;
			case SendPointState.InvalidX:
				this.errorMessage = "Невалидный X";
				break;
			case SendPointState.InvalidY:
				this.errorMessage = "Невалидный Y";
				break;
			case SendPointState.InvalidR:
				this.errorMessage = "Невалидный R";
				break;
			default:
				this.errorMessage = "Координаты введены неверно";
				break;
		}
		this.getPoints().then(e=>{
			this.redraw();
		}
		);
	}
	async getPoints(){ 
		let resp = await this.backend.getPoints();
		switch(resp[0]){
			case GetPointsState.Ok:
				this.points = resp[1];
				break;
			default:
				this.leaveCauseOfSession();
				break;
		}
		return this.points;
	}
	clearCanvas(){
		const context = this.canvas.nativeElement.getContext('2d');
		//context.clearRect(0, 0, 300, 300);
		context.fillStyle = 'rgb(255,255,255)';
		context.strokeStyle = 'rgba(255,255,255,1)';
		context.fillRect(0, 0, 300, 300); // прямоугольник в 4 четверти
	}
	drawAxes(){
		const context = this.canvas.nativeElement.getContext('2d');
		let R_ed = this.R_ed;
		
		context.strokeStyle = 'rgba(0,0,0,1)';
		context.fillStyle = 'rgb(0,0,0)';
		
		context.beginPath();

		context.moveTo(150, 0);
		context.lineTo(145, 10);
		context.moveTo(150, 0);
		context.lineTo(155, 10);

		context.font = "15px sans-serif";
		context.fillText('y', 160, 10);

		context.moveTo(150, 0);
		context.lineTo(150, 300);//ось y

		context.moveTo(300, 150);
		context.lineTo(290, 145);
		context.moveTo(300, 150);
		context.lineTo(290, 155);

		context.fillText('x', 290, 140);

		context.moveTo(0, 150);
		context.lineTo(300, 150);//ось x
		context.closePath();
		context.stroke();
		
		let lw = context.lineWidth;
		context.lineWidth = 1;

		for(let x = -5;x <= 3; x++){
			context.beginPath();
			context.moveTo(150+R_ed*x,150-5*R_ed);
			context.lineTo(150+R_ed*x,150+3*R_ed);
			context.stroke();
		}
		for(let y = -3;y <= 5; y++){
			context.beginPath();
			context.moveTo(150-5*R_ed, 150-y*R_ed);
			context.lineTo(150+3*R_ed, 150-y*R_ed);
			context.stroke();
		}

		for(let x = -5;x <= 3; x++){
			context.beginPath();
			context.fillText(String(x), 150+x*R_ed, 165);
			context.stroke();
		}

		for(let y = -3;y <= 5; y++){
			if(y == 0) continue;
			context.beginPath();
			context.fillText(String(y), 150, 150-y*R_ed-3);
			context.stroke();
		}
		context.lineWidth = lw;
	}
	drawArea(){
		let R = this.r;
		let R_ed = this.R_ed;
		const context = this.canvas.nativeElement.getContext('2d');
		context.fillStyle = 'rgb(51,153,255)';
		context.strokeStyle = 'rgba(0,0,0,1)';
		context.fillRect(150, 150, R_ed*R/2, R_ed*R); // прямоугольник в 4 четверти
		
		context.beginPath();
		context.moveTo(150, 150);
		context.arc(150, 150, R_ed*R/2, Math.PI / 2, Math.PI)//кружочек в 3 четверти
		context.lineTo(150, 150);
		context.fill();

		context.beginPath(); // треугольник в 1 четверти
		context.moveTo(150, 150);
		context.lineTo(150, 150-R_ed*R);
		context.lineTo(150+R_ed*R/2, 150);
		context.lineTo(150, 150);
		context.fill();
	}
	drawPoint(x:number, y:number, r:number, color: string = "black"){
		let R_ed = this.R_ed;
		let R = this.r;
		const context = this.canvas.nativeElement.getContext('2d');
		x = x*R_ed*R/r+150;
		y = 150 - y*R_ed*R/r;
		context.beginPath();
		context.fillStyle=color;
		context.moveTo(x,y);
		context.arc(x,y,5,0,Math.PI*2);
		context.fill();
	}
	
	drawPoints(){
		let points = this.points;
		for(let i = 0;i<points.length;i++){
			if(points[i].inArea)
				this.drawPoint(points[i].x, points[i].y, points[i].r, "green");
			else
				this.drawPoint(points[i].x, points[i].y, points[i].r, "red");
			
		}
    }
	
	drawCurPoint(){
		this.drawPoint(this.x, this.y, this.r, "orange");
	}
	
	validateY($event){
		this.messageForY = "";
		if(this.y < -3){
			this.messageForY = "Неверное значение Y! Введите значение y >= -3";
			this.y = -3;
		}
		if(this.y > 5){
			this.messageForY = "Неверное значение Y! Введите значение y <= 5";
			this.y = 5;
		}
	}
	
	set x(newx: number){
		if(newx==null)
			return;
		else if(newx >= -5 && newx <= 3){
			this._x = newx;
			this.cookies.setCookie('x',String(newx));
		}
	}
	
	set y(newy: number){
		this.messageForY = "";
		if(newy==null)
			this.messageForY = "Введите y";
		else if(newy < -3){
			this.messageForY = "Неверное значение Y! Введите значение y ≥ -3";
		}
		else if(newy > 5){
			this.messageForY = "Неверное значение Y! Введите значение y ≤ 5";
		} else {
			this._y = newy;
			this.cookies.setCookie('y',String(newy));
		}
	}
	
	set r(newr: number){
		this.messageForR = "";
		if(newr==null)
			this.messageForR = "Введите r";
		else if(newr <= 0){
			this.messageForR = "Неверное значение R! Введите значение r > 0";
		} else {
			this._r = newr;
			this.cookies.setCookie('r',String(newr));
		}
	}
	
	get y(){
		return this._y;
	}
	
	get r(){
		return this._r;
	}
	
	get x(){
		return this._x;
	}
	
	validateR($event){
		this.messageForR = "";
		if(this.r < 0){
			this.messageForR = "Неверное значение R! Введите значение r > 0";
			this.r = 0;
		}
	}
	
	redraw(){
		let R = this.r;
		this.clearCanvas();
		if(R > 0){
			this.drawArea();
			this.drawAxes();
			this.drawPoints();
			this.drawCurPoint();
		}
		else this.drawAxes();
	}
	onCanvasClick(ev){
		let R = this.r;
		let R_ed = this.R_ed;
		if (R < 1 || R > 3)
			return;
		let rect = this.canvas.nativeElement.getBoundingClientRect();
		let x = (ev.clientX-rect.left-150-this.canvasPadding)/R_ed;
		let y = (150-ev.clientY+rect.top+this.canvasPadding)/R_ed;
		this.sendPoint(Number(x.toFixed(0)),y,R);
	}
	leave(){
		this.backend.reset();
		this.cookies.setCookie('token', '','max-age=0');
		this.router.navigate(["/"]);
	}
	leaveCauseOfSession(){
		this.cookies.setCookie('message', 'OutOfSession');
		this.leave();
	}
	clearPoints(){
		this.backend.clearPoints().then(e=>{
			switch(e){
				case ClearPointsState.Ok:
					this.getPoints().then(e=>{
						this.redraw();
					});
				break;
				default:
					this.leaveCauseOfSession();
				break;
			}
		});
	}
}