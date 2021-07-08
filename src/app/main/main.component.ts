import { Component, NgZone, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public map: google.maps.Map;

  constructor(
    private ngZone: NgZone,
    private weatherService: WeatherService) {
  }

  ngOnInit(): void {
    window['mainComponentReference'] = { component: this, zone: this.ngZone, initMapAnguar: () => this.initMapAnguar(), };
  };
  ngAfterViewInit(): void {
    this.loadScripts();
  };

  public loadScripts() {
    const node = document.createElement('script');
    node.text = `function initMap() {
     window.mainComponentReference.zone.run(() => { window.mainComponentReference.initMapAnguar(); });
     }`
    node.type = 'text/javascript';
    node.async = false;
    node.defer = false;
    document.getElementById('map').after(node);

    const dynamicScripts = [
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyCbtEj3Hy65V-vJH7iOPk5XmqPDMTPDx6U&callback=initMap'
    ];

    for (let i = 0; i < dynamicScripts.length; i++) {
      const node = document.createElement('script');
      node.src = dynamicScripts[i];
      node.type = 'text/javascript';
      node.async = true;
      node.defer = true;
      node.charset = 'utf-8';
      document.getElementById('map').after(node);
    }
  };

  public initMapAnguar() {
    const map = new google.maps.Map(
      document.getElementById("map") as HTMLElement, {
      center: { lat: 42.7339, lng: 25.4858 },
      zoom: 7.7,
    });

    const tourStops = [
      {
        Position: { lat: 42.136097, lng: 24.742168 },
        Title: "Plovdiv"
      },
      {
        Position: { lat: 42.69751, lng: 23.32415 },
        Title: "Sofia"
      },
      {
        Position: { lat: 42.50606, lng: 27.46781 },
        Title: "Burgas"
      },
      {
        Position: { lat: 42.658707, lng: 27.736273 },
        Title: "Nesebar"
      },
      {
        Position: { lat: 42.02754, lng: 23.99155 },
        Title: "Velingrad"
      },
    ];

    const infoWindow = new google.maps.InfoWindow();

    tourStops.forEach((item, i) => {
      const marker = new google.maps.Marker({
        position: item.Position,
        map: map,
        title: `${i + 1}. ${item.Title}`,
        label: `${i + 1}`,
        optimized: false,
      });

      marker.addListener("click", () => {
        infoWindow.close();
        infoWindow.setContent(marker.getTitle());
        infoWindow.open(marker.getMap(), marker);
      });
    });

  }

}
