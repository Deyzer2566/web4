import { Component, AfterViewInit, ViewChild, ElementRef, Input, Inject } from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { RouterOutlet, RouterLink, ActivatedRoute, Router, Params} from "@angular/router";
import {BackendService, SendPointState, GetPointsState, ClearPointsState} from "./backend.service";
import { Observable } from "rxjs";
     
@Component({
    selector: "main",
    standalone: true,
    imports: [FormsModule, HttpClientModule],
	providers: [BackendService],
	styles:`
	button{
		color: #35B2FF;
		background-color: #E7FFEE;
		border-radius: 10px;
	}
	button:hover{
		background-color: #C0D4C5; 
	}
	button:disabled{
		background-color: #5C665F;
	}
	#points{
		margin-left: auto;
		margin-right: auto;
		border: 2mm groove rgb(255, 243, 190);
	}
	#points td{
		padding: 10px;
	}
	#points tbody tr:nth-child(odd){
		background-color: #C6ED67;
	}
	#points tbody tr:nth-child(even){
		background-color: #65ED94;
	}
	#points thead th{
		background-color: #19ED99;
	}
	#pointCoords {
		margin-left: auto;
		margin-right: auto;
		text-align: center;
	}
	#pointCoords tbody td{
		width: min-content;
	}
	#app{
		border: 4mm ridge rgb(120, 240, 80);
		text-align: center;
		margin-left: auto;
		margin-right: auto;
		width: min-content;
	}
	@media(max-width: 656px){
	}
	@media(min-width: 657px) and (max-width: 1188px) {
		#container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		}
	}
	@media(min-width: 1189px){
		#container {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		}
	}
	`,
    template: `	
				<div id="app">
					<div id="container">
						<canvas width="300" height="300" #myCanv (click)="onCanvasClick($event)">
							Скачай нормальный браузер!
						</canvas>
						<div>
							<table id="pointCoords">
								<tbody>
									<tr>
										<td>x</td>
										<td>
											<select [(ngModel)]="x" (ngModelChange)="redraw()">
												@for(comp of possibleX; track $index){
													<option [value]="comp">
														{{comp}}
													</option>
												}
											</select>
										</td>
									</tr>
									<tr>
										<td>y</td>
										<td><input type="number" [(ngModel)]="y" [min]="-3" [max]="5" (ngModelChange)="redraw()" /></td>
										<td>{{messageForY}}</td>
									</tr>
									<tr>
										<td>r</td>
										<td>
											<select [(ngModel)]="r" (ngModelChange)="redraw()">
												@for(comp of possibleR; track $index){
													<option [value]="comp">
														{{comp}}
													</option>
												}
											</select>
										</td>
										<td>{{messageForR}}</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div>
							<button (click)="sendPoint(x,y,r)" [disabled]='messageForY != "" || messageForR != ""'>Отправить точку</button>
							<button (click)="leave()">Ливнуть с акка</button>
							<button (click)="clearPoints()" [disabled]='points.length == 0'>Удалить точки</button>
						</div>
						<p>{{errorMessage}}</p>
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

export class MainComponent {
	@ViewChild('myCanv', { static: false })
	canvas: ElementRef<HTMLCanvasElement>;	
	
	constructor(private backend: BackendService, private router: Router, private aroute: ActivatedRoute){
        aroute.queryParams.subscribe(
            (queryParam: Observable<Params>) => {
                this.backend.token = queryParam["token"];
            }
        );
		this.getPoints().then(e=>{this.redraw();});
	}
	possibleX = [-5,-4,-3,-2,-1,0,1,2,3];
	possibleR = [-5,-4,-3,-2,-1,0,1,2,3];
    x: number = 0;
	_y: number = 0;
	_r: number = 1;
	points: any = [];
	messageForY = "";
	messageForR = "";
	errorMessage = "";
	R_ed = 30;
	async sendPoint(x:number, y:number, r:number){
		switch (await this.backend.sendPoint(x,y,r)){
			case SendPointState.Good:
				this.errorMessage = "";
				break;
			case SendPointState.Unauthorized:
				this.leaveCauseOfSession();
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
			case GetPointsState.Good:
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
	drawPoints(){
		let R_ed = this.R_ed;
		let R = this.r;
		let points = this.points;
		const context = this.canvas.nativeElement.getContext('2d');
		for(let i = 0;i<points.length;i++){
			let x = points[i].x*R_ed*R/points[i].r+150;//     Задание: масштабировать не только область, но и точки
			let y = 150 - points[i].y*R_ed*R/points[i].r;//   (=> не пересчитывать попадание/не попадание)
			context.beginPath();
			context.moveTo(x,y);
			context.arc(x,y,5,0,Math.PI*2);
			if(points[i].inArea)
				context.fillStyle="green";
			else
				context.fillStyle="red";
			context.fill();
		}
    }
	
	drawCurPoint(){
		let R_ed = this.R_ed;
		let R = this.r;
		const context = this.canvas.nativeElement.getContext('2d');
		let x = this.x*R_ed+150;
		let y = 150 - this.y*R_ed;
		context.beginPath();
		context.moveTo(x,y);
		context.arc(x,y,5,0,Math.PI*2);
		context.fillStyle="orange";
		context.fill();
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
	
	set y(newy: number){
		this.messageForY = "";
		if(newy==null)
			this.messageForY = "Введите y";
		else if(newy < -3){
			this.messageForY = "Неверное значение Y! Введите значение y >= -3";
		}
		else if(newy > 5){
			this.messageForY = "Неверное значение Y! Введите значение y <= 5";
		} else this._y = newy;
	}
	
	set r(newr: number){
		this.messageForR = "";
		if(newr==null)
			this.messageForR = "Введите r";
		else if(newr <= 0){
			this.messageForR = "Неверное значение R! Введите значение r > 0";
		} else this._r = newr;
	}
	
	get y(){
		return this._y;
	}
	
	get r(){
		return this._r;
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
		let x = (ev.clientX-rect.left-150)/R_ed;
		let y = (150-ev.clientY+rect.top)/R_ed;
		this.sendPoint(Number(x.toFixed(0)),y,R);
	}
	leave(){
		this.backend.reset();
		this.router.navigate(["/"]);
	}
	leaveCauseOfSession(){
		this.backend.reset();
		this.router.navigate(["/"], {queryParams:{message: "OutOfSession"}});
	}
	clearPoints(){
		this.backend.clearPoints().then(e=>{
			switch(e){
				case ClearPointsState.Good:
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