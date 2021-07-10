import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  apiKey = 'de8904fbaac650a197b2565d60b42574'

  constructor(private http: HttpClient) { }

  getWeatherDataByLatLonCurrentDay(lat: number, lon: number) {
    let params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('appid', this.apiKey)
    return this.http.get("https://api.openweathermap.org/data/2.5/weather?", { params })
  }

  getWeatherDataByLatLonCurrentAndNext7Days(lat: number, lon: number) {
    let params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('exclude', "minutely,hourly,alerts") //current, minutely, hourly, daily, alerts
      .set('appid', this.apiKey)
    return this.http.get("https://api.openweathermap.org/data/2.5/onecall?", { params })
  }

}
