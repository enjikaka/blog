---
title: 'Vectorizing woodcuts with Waifu2x and Potrace'
date: 2020-10-12
author: Jeremy Karlsson
summary: Running a bad JPEG of a wood cut from 1555 through Waifu2x and Potrace for Infinity Resolution!
tags:
  - tech
---
Woodcut from *[A Description of the Northern Peoples](https://en.wikipedia.org/wiki/A_Description_of_the_Northern_Peoples)*

I thought this might help me in [digitalizing the book](https://nordiskafolken.se/), for getting the images to a better format!

![Meme](https://dret.jeremy.se/waifu2x-potrace/meme.jpg)

## Original JPG (512x236, 56 KB)

![Original JPEG image of wood cut](https://dret.jeremy.se/waifu2x-potrace/original.jpeg)

## After Waifu2x (1024x472, 426 KB)

Ran the original jpeg on [waifu2x-tfjs](https://highcwu.github.io/waifu2x-tfjs/) with 2x res.

![PNG image after running thourgh the Waifu2x software](https://dret.jeremy.se/waifu2x-potrace/waifu2x.png)

## After Potrace (409 KB)

Ran the waifu2x result in a [JS port of Potrace](http://kilobtye.github.io/potrace/).

![SVG version of the waifu2x generated image](/static/img/potrace.svg)

[Open in new tab](/static/img/potrace.svg)

## After SVGOMG optimization (218 KB)

[SVGOMG](https://jakearchibald.github.io/svgomg/).

![Optimized SVG version of the waifu2x generated image](/static/img/final.svg)

[Open in new tab](/static/img/final.svg)