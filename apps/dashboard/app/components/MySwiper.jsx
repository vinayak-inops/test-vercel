"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

export default function MySwiper() {
  return (
    <Swiper
      modules={[Autoplay]}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      loop={true}
      spaceBetween={30}
      slidesPerView={1}
    >
      <SwiperSlide>
        <img src="/images/download (1).jpg" alt="Slide 1" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/images/download (2).jpg" alt="Slide 2" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/images/download (3).jpg" alt="Slide 3" />
      </SwiperSlide>
    </Swiper>
  );
}