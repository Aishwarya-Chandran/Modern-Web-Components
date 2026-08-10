# Infinite Photo Carousel

A lightweight, responsive React component that creates a continuously rotating photo carousel with depth, scaling, blur, and hover selection effects.

## Preview

<img src="./preview.gif" width="400px" >

## Using

```jsx
import InfinitePhotoCarousel from "./InfinitePhotoCarousel";

const images = [
  "/images/photo1.jpg",
  "/images/photo2.jpg",
  "/images/photo3.jpg",
  "/images/photo4.jpg",
  "/images/photo5.jpg",
  "/images/photo6.jpg",
  "/images/photo7.jpg",
  "/images/photo8.jpg", ];

<InfinitePhotoCarousel images={images} />
```

## Customization

```jsx
<InfinitePhotoCarousel
  images={images}
  speed={14}
  imageWidth={170}
  imageHeight={205}
  spacing={245}
  depth={150}
  borderRadius={20} />
```

## Applications

- Portfolio project showcases
- Photography galleries
- Product showcases
- Art and design galleries
- Project presentations
- Team or profile showcases
- Brand and campaign displays
- Interactive landing pages
- Personal websites
- Event and exhibition websites
- Travel and destination galleries
- Entertainment and media websites

