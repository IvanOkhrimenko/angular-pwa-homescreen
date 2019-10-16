import { Component, HostListener } from '@angular/core';
import { GoogleAnalyticsService } from './google-analytics.service';

declare let ga: Function;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']

})

export class AppComponent {
  deferredPrompt: any;
  showButton = false;
  isAddedToHomeScreen = false;
  isTookBonus = false;
  isStandalone = false;

  constructor(private googleAnalyticsService: GoogleAnalyticsService) {
    ga('send', 'pageview');
    this.trackStandalone();
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e) {
    console.log(e);
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    this.showButton = true;
  }

  @HostListener('window:appinstalled', ['$event'])
  appinstalled(e) {
    this.googleAnalyticsService.eventEmitter("systemEvents", "User installed app");
    console.log(e);
    e.preventDefault();
    this.isAddedToHomeScreen = true;
  }


  addToHomeScreen() {
    // hide our user interface that shows our A2HS button
    this.showButton ? this.googleAnalyticsService.eventEmitter("buttonclick", "AddToHomePage") : null;
    this.showButton = false;
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          this.googleAnalyticsService.eventEmitter("systemEvents", "User accepted the prompt");
          console.log('User accepted the A2HS prompt');
        } else {
          this.googleAnalyticsService.eventEmitter("systemEvents", "User dismissed the prompt");
          console.log('User dismissed the A2HS prompt');
        }
        this.deferredPrompt = null;
      });
  }

  trackStandalone() {
    // called once from app.component
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.googleAnalyticsService.eventEmitter("systemEvents", "User open from app");
      this.isStandalone = true;
    }
  }

  takeBonus() {
    this.isTookBonus ? null : this.googleAnalyticsService.eventEmitter("buttonclick", "StartDialog");
    this.isTookBonus = true;
  }
}


