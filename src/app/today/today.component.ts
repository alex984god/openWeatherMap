import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';

@Component({
  selector: 'app-today',
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss']
})
export class TodayComponent implements OnInit {

  public map: google.maps.Map;

  constructor(private weatherService: WeatherService) { }

  ngOnInit(): void { }

  //initMap(): void {
  //  debugger;
  //  this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
  //    center: { lat: -34.397, lng: 150.644 },
  //    zoom: 8,
  //  });
  //}

}
