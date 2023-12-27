import { Component, Input, Inject } from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {BackendService, AuthState} from "./backend.service";
import { RouterOutlet, RouterLink, Router, ActivatedRoute, Params} from "@angular/router";
import { Observable } from "rxjs";
@Component({
    selector: "start",
    standalone: true,
    imports: [FormsModule, HttpClientModule],
	providers: [BackendService],
	styles: `
	table{
		margin: auto;
		border-collapse: collapse;
	}
	#container{
		margin: auto;
		width: 50%;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	#container2 {
		margin: auto;
	}
	`,
    template: `	
				<div id="container">
					<div id="header">
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
					</div>
					<div id="container2">
						<div>
							<input placeholder="Логин" type="text" [(ngModel)]="login">
							<input placeholder="Пароль" type="password" [(ngModel)]="password">
							<p>{{errorMessage}}</p>
							@if(!authlogin){
								<button (click)="register(login, password)">Регистрация</button>
							} @else {
								<button (click)="auth(login, password)">Авторизация</button>
							}
						</div>
						<div>
							<label>Уже зарегистрированы?</label>
							<input type="checkbox" [(ngModel)]="authlogin" />
						</div>
					</div>
				</div>
				`
})
export class StartComponent { 
	constructor(private backend: BackendService, private router: Router, private aroute: ActivatedRoute){
        aroute.queryParams.subscribe(
            (queryParam: Observable<Params>) => {
                if(queryParam['message'] == "OutOfSession")
					this.errorMessage = "Время сессии истекло, повторите авторизацию";
            }
        );
	}
	login="guest1"
	password="password"
	authlogin = false;
	errorMessage = "";
	async auth(login: string, password: string){
		let x = await this.backend.auth(login, password);
		switch(x){
			case AuthState.Bad_request:
				this.errorMessage = "Данные введены неверно!";
				break;
			case AuthState.Authorized:
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
			case AuthState.Bad_request:
				this.errorMessage = "Данные введены неверно!";
				break;
			case AuthState.Authorized:
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
        this.router.navigate(["/main"], {queryParams:{token: this.backend.token}});
    }
}