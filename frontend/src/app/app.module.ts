import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, RouterModule.forRoot(routes)],
  bootstrap: [App],
})
export class AppModule {}

