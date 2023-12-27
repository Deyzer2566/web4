import { provideRouter, Routes, withComponentInputBinding } from "@angular/router";
import { ApplicationConfig } from "@angular/core";
 
// компоненты, которые сопоставляются с маршрутами
import {MainComponent} from "./main.component";
import {StartComponent} from "./start.component";
 
// определение маршрутов
const appRoutes: Routes =[
    { path: "", component: StartComponent},
    { path: "main", component: MainComponent},
];
 
export const routeConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes)]
};