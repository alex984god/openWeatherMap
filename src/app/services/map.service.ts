import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  urlPolygon = 'https://nominatim.openstreetmap.org/search.php?'

  constructor(private http: HttpClient) { }

  parseBulgarianCitiesFromJSON(): Promise<any> {
    return this.http.get("./assets/content/bgCities.json").toPromise();
  };

  getPolygonForCityName(cityName: string) {
    let params = new HttpParams()
      .set("q", cityName)
      .set("polygon_geojson", "1")
      .set("format", "json")
    return this.http.get(this.urlPolygon, { params })
  };

}
