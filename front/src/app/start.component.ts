import { Component, Input, Inject } from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {BackendService, AuthState, RegisterState} from "./backend.service";
import { RouterOutlet, RouterLink, Router, ActivatedRoute, Params} from "@angular/router";
import { Observable } from "rxjs";
import {CookieService} from "./cookie.service";
@Component({
    selector: "start",
    standalone: true,
    imports: [FormsModule, HttpClientModule],
	providers: [BackendService, CookieService],
	styles: `
	body {
	  font-family: Arial, sans-serif;
	  margin: 0;
	  padding: 0;
	}

	#container {
	  max-width: 800px;
	  margin: 0 auto;
	  padding: 20px;
	}
	
	header {
	  background-color: #f2f2f2;
	  padding: 20px;
	  text-align: center;
	}
	
	header td{
		font-size: 15px;
	}
	
	header p{
		font-size: 15px;
	}
	
	h1 {
	  margin: 0;
	}

	table {
	  margin: 20px auto;
	}
	
	table td {
	  padding: 5px 10px;
	}

	main {
	  padding: 20px;
	}

	#inputForm {
	  max-width: 300px;
	  margin: 0 auto;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	}
	
	#inputForm button {
	  width: calc(100% - 20px);
	  margin-bottom: 10px;
	  padding: 10px;
	  background-color: #4CAF50;
	  color: white;
	  border: none;
	  cursor: pointer;
	  border-radius: 10px;
	}
	
	#inputForm button:disabled{
		background-color: #AFEDAF;
	}

	#inputForm p {
	  margin-bottom: 10px;
	}
	
	.errorMessage {
		color: red;
	}
	
	@media (max-width: 657px) {
	  #container {
		max-width: 70%;
		padding: 10px;
	  }
	  
	  #inputForm {
		max-width: calc(100% - 20px);
		padding: 10px;
	  }
	  
	  #inputForm input[type='text'], #inputForm input[type='password'], #inputForm button, #inputForm label, #inputForm p {
		width: calc(100% - 20px);
		margin-bottom: 5px;
		padding: 5px;
		font-size: smaller;
	  }
	}

	@media (min-width: 657px) and (max-width: 1189px) {
	  #container {
		max-width: calc(70% - 20px);
		padding: 15px;
	  }
	  
	  #inputForm {
		max-width: calc(50% - 20px);
		padding: 15px;
		box-sizing: border-box; 
		margin: auto;
	   }
	  
	   #inputForm input[type='text'], #inputForm input[type='password'], #inputForm button, #inputForm label, #inputForm p {
		width: calc(100% - 20px);
		margin-bottom: 10px;
		padding: 10px;
		font-size: medium;
	   }
	}

	@media (min-width:1189px) {
	   #container {
		 max-width: calc(60% - 20px);
		 padding:20px;
	   }

	   #inputForm {
		 max-width: calc(40% - 20px);
		 padding:20px;
	   }

	   #inputForm input[type='text'], #inputForm input[type='password'], #inputForm button, #inputForm label, #inputForm p {
		 width: calc(100% - 20px);
		 margin-bottom:10px;
		 padding:10px;
		 font-size:x-large;
	   }
	}
	`,
    template: `	
				<div id="container">
					<header>
						<h1>Стартовая страница</h1>
						<table>
							<tbody>
								<tr>
									<td>Лабораторная работа</td>
									<td>№4</td>
								</tr>
								<tr>
									<td>Выполнил</td>
									<td>Козодой А.С.</td>
								</tr>
								
								<tr>
									<td>Вариант</td>
									<td>1233</td>
								</tr>
							</tbody>
						</table>
						<p>Для использования пробросьте порт 32169 сервера на 8080 локальный</p>
					</header>
					<main>
						<div id="inputForm">
							<input placeholder="Логин" type="text" [(ngModel)]="login">
							<input placeholder="Пароль" type="password" [(ngModel)]="password">
							<input placeholder="Повторите пароль" type="password" [(ngModel)]="passRepeat" [hidden]="authlogin" />
							@if(!authlogin){
								<button (click)="register(login, password)" [disabled]="login.length < 6 || password.length < 6">Регистрация</button>
							} @else {
								<button (click)="auth(login, password)" [disabled]="login.length < 6 || password.length < 6">Авторизация</button>
							}
							<p class="errorMessage">{{errorMessage}}</p>
							<div>
								<label>Уже зарегистрированы?</label>
								<input type="checkbox" [(ngModel)]="authlogin" />
							</div>
							<div>
								<label>Сохранить вход</label>
								<input type="checkbox" [(ngModel)]="saveSession" />
							</div>
						</div>
					</main>
				</div>
				`
})
export class StartComponent { 
	constructor(private backend: BackendService, private router: Router, private cookies: CookieService){
		if (this.cookies.getCookie('token') !== undefined && this.cookies.getCookie('message') === undefined){
			this.goMain();
		}
		if (this.cookies.getCookie('message') == 'OutOfSession'){
			this.errorMessage = "Время сессии истекло, повторите авторизацию";
			this.cookies.setCookie('message', '','max-age=0');
		}
		this._saveSession = cookies.getCookie('saveSession')=='true';
		this._authlogin = cookies.getCookie('authlogin') == 'true';
	}
	login="guest1"
	password="password"
	passRepeat = "";
	_saveSession=false;
	_authlogin = false;
	errorMessage = "";
	async auth(login: string, password: string){
		let x = await this.backend.auth(login, password);
		switch(x){
			case AuthState.Bad_login:
				this.errorMessage = "Невалидный логин";
				break;
			case AuthState.Bad_password:
				this.errorMessage = "Невалидный пароль";
				break;
			case AuthState.Bad_login_or_password:
				this.errorMessage = "Неверный логин или пароль!";
				break;
			case AuthState.Ok:
				if(this.saveSession)
					this.cookies.setCookie('token', this.backend.token, 'max-age=600');
				else
					this.cookies.setCookie('token', this.backend.token);
				this.goMain();
				break;
			default:
				this.errorMessage = "Ошибка";
				break;
		}
	}
	async register(login: string, password: string){
		let x = await this.backend.register(login, password);
		switch(x){
			case RegisterState.Bad_login:
				this.errorMessage = "Невалидный логин";
				break;
			case RegisterState.Bad_password:
				this.errorMessage = "Невалидный пароль";
				break;
			case RegisterState.Theres_account_with_this_login:
				this.errorMessage = "Логин уже занят";
				break;
			case RegisterState.Ok:
				if(this.saveSession)
					this.cookies.setCookie('token', this.backend.token, 'max-age=600');
				else
					this.cookies.setCookie('token', this.backend.token);
				this.goMain();
				break;
			default:
				this.errorMessage = "Ошибка";
				break;
		}
	}
	reset(){
		this.backend.reset();
	}
    goMain(){
        this.router.navigate(["/main"]);
    }
	get saveSession(){
		return this._saveSession;
	}
	set saveSession(newSaveSession: boolean){
		this._saveSession = newSaveSession;
		this.cookies.setCookie('saveSession', String(this._saveSession));
	}
	get authlogin(){
		return this._authlogin;
	}
	set authlogin(newAuthLogin: boolean){
		this._authlogin = newAuthLogin;
		this.cookies.setCookie('authlogin', String(this._authlogin));
	}
}