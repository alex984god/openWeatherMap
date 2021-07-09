import { Component, NgZone, OnInit } from '@angular/core';
import { City } from '../../utils/City';
import { Coordinate } from '../../utils/Coordinate';
import { WeatherService } from '../weather.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public map: google.maps.Map;
  public polygons: Array<google.maps.Polygon> = new Array<google.maps.Polygon>();
  public cities: City[] = [];

  constructor(
    private ngZone: NgZone,
    private weatherService: WeatherService) {
  }

  ngOnInit(): void {
    this.weatherService.parseBulgarianCitiesFromJSON()
      .then(data => {
        this.cities = data;
      });

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
    var self = this;
    var map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 42.7339, lng: 25.4858 },
      zoom: 7.7,
    });

    var infoWindow = new google.maps.InfoWindow();

    this.cities.forEach((city, i) => {
      var marker = new google.maps.Marker({
        position: { lat: +city.lat, lng: +city.lng },
        map: map,
        title: `${i + 1}. ${city.city}`,
        label: `${i + 1}`,
        optimized: true,
      });

      marker.addListener("click", () => {
        infoWindow.close();
        infoWindow.setContent(marker.getTitle());
        infoWindow.open(marker.getMap(), marker);
      });

      marker.addListener('mouseout', function () {
        for (var i = 0; i < self.polygons.length; i++) {
          self.polygons[i].setMap(null);
        }
        self.polygons = new Array<google.maps.Polygon>();
      });

      marker.addListener('mouseover', function () {
        self.weatherService.getPolygonForCityName(city.city).subscribe((data: any) => {
          var cityPolygon: any = null;
          if (!data.length) {
            if (data.type && (data.type === "city" || data.type === "town" || data.type === "administrative")) {
              cityPolygon = data;
            }
          }
          else {
            for (var i = 0; i < data.length; i++) {
              if (data[i].type && (data[i].type === "city" || data[i].type === "town" || data[i].type === "administrative")) {
                if (data[i].geojson && (data[i].geojson.type === "Polygon" || data[i].geojson.type === "MultiPolygon")) {
                  cityPolygon = data[i];
                  i = data.length; //break
                }
              }
            }
          }

          if (cityPolygon !== null) {
            if (cityPolygon.geojson.type === "Polygon") {
              var path = self.parseArrayOfCoordinatesForPolygon(cityPolygon.geojson.coordinates[0]);

              const polygon = new google.maps.Polygon({
                paths: path,
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
              });
              polygon.setMap(map);
              self.polygons.push(polygon);
            }
            //else if (cityPolygon.geojson.type === "MultiPolygon") {
            //  for (var j = 0; j < cityPolygon.geojson.coordinates.length; j++) {
            //    var path = self.parseArrayOfCoordinates(cityPolygon.geojson.coordinates[j]);
            //    const polygon = new google.maps.Polygon({
            //      paths: path,
            //      strokeColor: "#FF0000",
            //      strokeOpacity: 0.8,
            //      strokeWeight: 2,
            //      fillColor: "#FF0000",
            //      fillOpacity: 0.35,
            //    });
            //    polygon.setMap(map);
            //  }
            //}
          }

        });
      });

    });

  }

  public parseArrayOfCoordinatesForPolygon(coordinates: any): Array<Coordinate> {
    var returnCoordinates: Array<Coordinate> = new Array<Coordinate>();
    for (var i = 0; i < coordinates.length; i++) {
      var coordinate = new Coordinate();
      coordinate.lng = coordinates[i][0];
      coordinate.lat = coordinates[i][1];
      returnCoordinates.push(coordinate);
    }
    return returnCoordinates;
  };
  public parseArrayOfCoordinatesForMultyPolygon(coordinates: any): Array<Coordinate> {
    var returnCoordinates: Array<Coordinate> = new Array<Coordinate>();
    for (var i = 0; i < coordinates.length; i++) {
      var coordinate = new Coordinate();
      coordinate.lng = coordinates[i][0];
      coordinate.lat = coordinates[i][1];
      returnCoordinates.push(coordinate);
    }
    return returnCoordinates;
  };
}
