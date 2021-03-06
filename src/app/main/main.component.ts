import { DatePipe } from '@angular/common';
import { Component, OnInit, NgZone } from '@angular/core';

//clases
import { City } from '../../utils/City';
import { Coordinate } from '../../utils/Coordinate';

//services
import { MapService } from '../services/map.service';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [DatePipe]
})
export class MainComponent implements OnInit {

  public map: google.maps.Map;
  public polygons: Array<google.maps.Polygon> = new Array<google.maps.Polygon>();
  public cities: City[] = [];
  public currentSelectedCity: City | null = null;
  public currentSelectedCityWatherInfo: any | null = null;

  public slideConfig = {
    "slidesToShow": 1,
    "slidesToScroll": 1
  };
  public title = 'openWeather';

  constructor(
    private ngZone: NgZone,
    private datePipe: DatePipe,
    private weatherService: WeatherService,
    private mapService: MapService) {
  }

  ngOnInit(): void {
    this.mapService.parseBulgarianCitiesFromJSON()
      .then(data => {
        //Get all Bulgarian cities with population greater than 3000 people
        for (var i = 0; i < data.length; i++) {
          if (data[i].population && +data[i].population > 3000)
            this.cities.push(data[i]);
        }
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
    const map = new google.maps.Map(
      document.getElementById("map") as HTMLElement, {
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
        optimized: true
      });

      marker.addListener("click", () => {
        infoWindow.close();
        infoWindow.setContent(marker.getTitle());
        infoWindow.open(marker.getMap(), marker);
        this.currentSelectedCity = city;

        self.weatherService.getWeatherDataByLatLonCurrentAndNext7Days(+city.lat, +city.lng).subscribe((data: any) => {
          if (data) {
            this.currentSelectedCityWatherInfo = data;
          }
        },
          (error) => {
          });
      });

      marker.addListener('mouseout', function () {
        for (var i = 0; i < self.polygons.length; i++) {
          self.polygons[i].setMap(null);
        }
        self.polygons = new Array<google.maps.Polygon>();
      });

      marker.addListener('mouseover', function () {
        self.mapService.getPolygonForCityName(city.city).subscribe((data: any) => {
          var cityPolygon: any = null;
          if (!data.length) {
            if (data.type && (data.type === "city" || data.type === "town" || data.type === "administrative")) {
              if (data.display_name && data.display_name.includes("Bulgaria")) {
                cityPolygon = data;
              }
            }
          }
          else {
            for (var i = 0; i < data.length; i++) {
              if (data[i].type && (data[i].type === "city" || data[i].type === "town" || data[i].type === "administrative")) {
                if (data[i].geojson && (data[i].geojson.type === "Polygon" || data[i].geojson.type === "MultiPolygon")) {
                  if (data[i].display_name && data[i].display_name.includes("Bulgaria")) {
                    cityPolygon = data[i];
                    i = data.length; //break
                  }
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
            else if (cityPolygon.geojson.type === "MultiPolygon") {

              for (var j = 0; j < cityPolygon.geojson.coordinates.length; j++) {
                var path = self.parseArrayOfCoordinatesForPolygon(cityPolygon.geojson.coordinates[j]);
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
            }
          }

        });
      });

    });

  }

  public parseArrayOfCoordinatesForPolygon(polygon: any): any {
    if (polygon[0].length && polygon[0].length === 2 &&
      polygon[polygon.length - 1].length && polygon[polygon.length - 1].length === 2) {
      //Polygon as one shape, Array<Coordinates>, no holes
      var returnCoordinates: Array<Coordinate> = new Array<Coordinate>();

      for (var i = 0; i < polygon.length; i++) {
        var coordinate = new Coordinate();
        coordinate.lng = polygon[i][0];
        coordinate.lat = polygon[i][1];
        returnCoordinates.push(coordinate);
      }
      return returnCoordinates;
    }
    else {
      //Polygon as many shapes, Array<Array<Coordinates>>, with hole
      var returnPolygon: Array<Array<Coordinate>> = new Array<Array<Coordinate>>();

      for (var i = 0; i < polygon.length; i++) {
        var partialPolygon: Array<Coordinate> = new Array<Coordinate>();
        for (var j = 0; j < polygon[i].length; j++) {
          var coordinate = new Coordinate();
          coordinate.lng = polygon[i][j][0];
          coordinate.lat = polygon[i][j][1];
          partialPolygon.push(coordinate);
        }
        returnPolygon.push(partialPolygon);
      }
      return returnPolygon;
    }
  };

  //slider
  public addSlide() {
  };
  public removeSlide() {
  };
  public slickInit(e) {
  };
  public breakpoint(e) {
  };
  public afterChange(e) {
  };
  public beforeChange(e) {
  };

  public calculateWeatherIconURL(dailyWeather: any): string {
    return "http://openweathermap.org/img/wn/" + dailyWeather.weather[0].icon + "@2x.png";
  };
  public parseDate(dateInSeconds: any): string {
    var date = new Date(dateInSeconds * 1000);
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
  };
  public calculateCelsiusTemperature(temperature: number): number {
    var roundWholeTemp = +(temperature * 10 * 10).toFixed(0);
    return (roundWholeTemp - 27315) / 100;
  };
}
