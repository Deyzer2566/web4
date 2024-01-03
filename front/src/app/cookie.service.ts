import {Injectable} from "@angular/core";
    
@Injectable({ providedIn: 'root' })
export class CookieService{
	
    
	setCookie(key:string, value:string, flags:string=""){
		document.cookie = key+"="+encodeURIComponent(value)+";"+flags;
	}
	getCookie(name: string): string|undefined {
		let m = document.cookie
			.split("; ")
			.find((row) => row.startsWith(name+'='))
			?.split("=")[1];
		if(m !== undefined)
			return decodeURIComponent(m);
		return m;
	}
	
}