import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { UserdashboardComponent } from "./Userdashboard/Userdashboard.component";

export const DashboardsRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "dashboard",
        component: DashboardComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "Userdashboard",
        component: UserdashboardComponent
      }
    ]
  }
];
