import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  slides = [
    {img: "https://via.placeholder.com/600.png/09f/fff"},
    {img: "https://via.placeholder.com/600.png/021/fff"},
    {img: "https://via.placeholder.com/600.png/321/fff"},
    {img: "https://via.placeholder.com/600.png/422/fff"},
    {img: "https://via.placeholder.com/600.png/654/fff"},
    {img: "https://via.placeholder.com/600.png/654/fff"}
  ];
  slideConfig = {"slidesToShow": 1, "slidesToScroll": 7};
  
  addSlide() {
    this.slides.push({img: "http://placehold.it/350x150/777777"})
  }
  
  removeSlide() {
    this.slides.length = this.slides.length - 1;
  }
  
  slickInit(e) {
    console.log('slick initialized');
  }
  
  breakpoint(e) {
    console.log('breakpoint');
  }
  
  afterChange(e) {
    console.log('afterChange');
  }
  
  beforeChange(e) {
    console.log('beforeChange');
  }  
  title = 'openWeather';
}
