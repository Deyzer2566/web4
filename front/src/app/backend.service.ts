import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

export enum AuthState {
	None,
	Bad_login,
	Bad_password,
	Bad_login_or_password,
	Ok
}

export enum RegisterState{
	None,
	Bad_login,
	Bad_password,
	Theres_account_with_this_login,
	Ok
}

export enum SendPointState{
	None,
	Ok,
	InvalidX,
	InvalidY,
	InvalidR,
	Unauthorized
}

export enum GetPointsState{
	None,
	Ok,
	Unauthorized
}

export enum ClearPointsState{
	None,
	Ok,
	Unauthorized
}
    
@Injectable({ providedIn: 'root' })
export class BackendService{
    
	token = ""
	private uri = "http://localhost:8080/web4-1.0-SNAPSHOT";
	
    constructor(private http: HttpClient){ }
  
    async auth(login: string, password: string){
		const body = {login: login, password: password};
		let authorized: AuthState = AuthState.None as AuthState;
		let token = "";
		let response = await this.http.post(
		  this.uri+'/api/user/login', body,
		  { observe: 'response', responseType: "text" }
			).toPromise()
			.then(response=>{authorized = AuthState.Ok;token=response.body.toString();})
			.catch(error=>{
				let resp = JSON.parse(error.error);
				switch(error.status){
				case 400:
					if(resp['code']=='BAD_LOGIN')
						authorized = AuthState.Bad_login as AuthState;
					else if(resp['code']=='BAD_PASSWORD')
						authorized = AuthState.Bad_password as AuthState;
					else if(resp['code']=='BAD_LOGIN_OR_PASSWORD')
						authorized = AuthState.Bad_login_or_password;
					else
						authorized = AuthState.None;
					break;
				default:
					authorized = AuthState.None;
					break;
			}
			});
		this.token = token;
		return authorized;
	}
	
	async register(login: string, password: string){
		const body = {login: login, password: password};
		let registered: RegisterState = RegisterState.None as RegisterState;
		let token = "";
		let response = await (this.http.post(
		  this.uri+'/api/user/register', body,
		  { observe: 'response', responseType: "text"  }
			).toPromise())
			.then(response=>{registered = RegisterState.Ok;token=response.body.toString();})
			.catch(response=>{
				let resp = JSON.parse(response.error);
				switch(response.status){
					case 400:
						if(resp['code']=='BAD_LOGIN')
							registered = RegisterState.Bad_login as RegisterState;
						else if(resp['code']=='BAD_PASSWORD')
							registered = RegisterState.Bad_password as RegisterState;
						else if(resp['code']=='THERES_ACCOUNT_WITH_THIS_LOGIN')
							registered = RegisterState.Theres_account_with_this_login as RegisterState;
						else
							registered = RegisterState.None as RegisterState;
						break;
					default:
						registered = RegisterState.None as RegisterState;
						break;
				}
			});
		this.token = token;
		return registered;
	}
	
	reset(){
		this.token="";
	}
	
	async sendPoint(x:number, y:number, r:number){
		const body = {token: this.token, x: x, y: y, r: r};
		let status: SendPointState = SendPointState.None as SendPointState;
		let response = await (this.http.post(
		  this.uri+'/api/point/put', body,
		  { observe: 'response' }
			).toPromise())
			.then(response=>{status = SendPointState.Ok as SendPointState;})
			.catch(response=>{
				let resp = JSON.parse(response.error);
				switch(response.status){
				case 400:
					if(resp['code'] == 'INVALID_X')
						status = SendPointState.InvalidX as SendPointState;
					else if(resp['code']=='INVALID_Y')
						status = SendPointState.InvalidY as SendPointState;
					else if(resp['code']=='INVALID_R')
						status = SendPointState.InvalidR as SendPointState;
					else
						status = SendPointState.None as SendPointState;
					break;
				case 401:
					status = SendPointState.Unauthorized as SendPointState;
					break;
				default:
					status = SendPointState.None as SendPointState;
					break;
			}});
		return status;
	}
	
	async getPoints(){
		const body = {token: this.token};
		let status: GetPointsState = GetPointsState.None as GetPointsState;
		let response = await (this.http.post(
		  this.uri+'/api/point/get', body,
		  { observe: 'response' }
			).toPromise())
			.then(response=>{status = GetPointsState.Ok as GetPointsState;return response.body;},
			response=>{switch(response.status){
				case 401:
					status = GetPointsState.Unauthorized as GetPointsState;
					break;
				default:
					status = GetPointsState.None as GetPointsState;
					break;
			}});
		return [status, response];
	}
	async clearPoints(){
		const body = {token: this.token};
		let status = ClearPointsState.None as ClearPointsState;
		let response = await (this.http.post(
		  this.uri+'/api/point/clear', body,
		  { observe: 'response' }
			).toPromise())
			.then(response=>{status = ClearPointsState.Ok as ClearPointsState;})
			.catch(response=>{switch(response.status){
				case 401:
					status = ClearPointsState.Unauthorized as ClearPointsState;
					break;
				default:
					status = ClearPointsState.None as ClearPointsState;
					break;
			}});
		return status;
	}
}