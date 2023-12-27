import { Component} from "@angular/core";
import { RouterOutlet} from "@angular/router";
import { BackendService } from "./backend.service";
import { AfterViewInit, ElementRef} from "@angular/core";
 
@Component({
    selector: "app",
    standalone: true,
	imports: [RouterOutlet],
    template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements AfterViewInit{
	constructor(private elementRef: ElementRef){
	
	}
	ngAfterViewInit(){
		this.elementRef.nativeElement.ownerDocument
           .body.style.backgroundColor = '#FCEEDE';
	}
}