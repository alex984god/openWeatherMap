import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  url = 'https://api.openweathermap.org/data/2.5/find?'
  apiKey = 'de8904fbaac650a197b2565d60b42574'


  constructor(private http: HttpClient) { }

  //getWeatherDataByChords(lat, lon){
  //  let params = new HttpParams()
  //  .set('lat', '42.725077')
  //  .set('lon', '25.124347')
  //  .set('cnt', '50')
  //  .set('appid',this.apiKey)
  //  return this.http.get(this.url, {params} )
  //}


}
