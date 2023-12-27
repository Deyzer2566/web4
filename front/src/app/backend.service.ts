import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

export enum AuthState {
	None,
	Bad_request,
	Unauthorized,
	Authorized
}

export enum SendPointState{
	None,
	Good,
	InvalidX,
	InvalidY,
	InvalidR,
	Unauthorized
}

export enum GetPointsState{
	None,
	Good,
	Unauthorized
}

export enum ClearPointsState{
	None,
	Good,
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
			.then(response=>{authorized = AuthState.Authorized;token=response.body.toString();})
			.catch(error=>{switch(error.status){
				case 400:
					authorized = AuthState.Bad_request;
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
		let authorized: AuthState = AuthState.None as AuthState;
		let token = "";
		let response = await (this.http.post(
		  this.uri+'/api/user/register', body,
		  { observe: 'response', responseType: "text"  }
			).toPromise())
			.then(response=>{authorized = AuthState.Authorized;token=response.body.toString();})
			.catch(response=>{switch(response.status){
				case 400:
					authorized = AuthState.Bad_request as AuthState;
					break;
				case 401:
					authorized = AuthState.Unauthorized as AuthState;
					break;
				default:
					authorized = AuthState.None as AuthState;
					break;
			}
			});
		this.token = token;
		return authorized;
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
			.then(response=>{status = SendPointState.Good;})
			.catch(response=>{switch(response.status){
				case 400:
					status = SendPointState.InvalidX;
					break;
				case 401:
					status = SendPointState.Unauthorized;
					break;
				default:
					status = SendPointState.None;
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
			.then(response=>{status = GetPointsState.Good;return response.body;},
			response=>{switch(response.status){
				case 401:
					status = GetPointsState.Unauthorized;
					break;
				default:
					status = GetPointsState.None;
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
			.then(response=>{status = ClearPointsState.Good;})
			.catch(response=>{switch(response.status){
				case 401:
					status = ClearPointsState.Unauthorized;
					break;
				default:
					status = ClearPointsState.None;
					break;
			}});
		return status;
	}
}