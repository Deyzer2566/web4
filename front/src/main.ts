import { bootstrapApplication } from "@angular/platform-browser";
import { routeConfig } from "./app/route.config";
import { AppComponent } from "./app/app.component";
bootstrapApplication(AppComponent, routeConfig).catch(e => console.error(e));