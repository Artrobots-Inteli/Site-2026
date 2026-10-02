# React Bits

Visual effects adapted from [React Bits](https://github.com/DavidHDev/react-bits), commit 5d0c00e7594c898e989b250d022806961f4c8478. Original author: David Haz.

Sources under src/content: TextAnimations/TechText, TextAnimations/ScrollReveal, Micro/FlipCard, Animations/GlowCursor, Backgrounds/GradientWaves, Backgrounds/DotField, Components/ProfileCard and Components/SpecularButton. The original components are available at https://www.reactbits.dev/.

TechText canvas renderer and GradientWaves/GlowCursor/SpecularButton shaders are ported to the existing vanilla JavaScript website. DotField, FlipCard and ProfileCard retain the reference interaction patterns with bounded motion. ScrollReveal preserves the existing semantic text elements. SpecularButton uses its original shader on the two main hero CTAs; other CTAs use a CSS rim and pointer highlight, also available as a fallback. GlowCursor uses 24 trail segments and GradientWaves uses 32 march steps with capped resolution. No React, GSAP, Motion or OGL runtime is added.

MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**

## No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
