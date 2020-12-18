[![build](https://github.com/ideditor/id-sdk/workflows/build/badge.svg)](https://github.com/ideditor/id-sdk/actions?query=workflow%3A%22build%22)


# id-sdk

🆔 Map editing made easy


## What is it?

This project contains code for processing and editing map data.  Our goal is to provide a shared foundation upon which developers can build map editors, data processors, validators, and other innovative tools.

Much of the code was spun out of the [OpenStreetMap iD editor](https://github.com/openstreetmap/iD) project.


## Contributing

This project is just getting started! 🌱

We're not able to support external contributors at this time, but check back in a bit when things have matured.


## Modules

### math

Module                | Description
--------------------- | -------------
[@id-sdk/extent]      | 📦 Extent class for creating bounding boxes
[@id-sdk/geo]         | 🌐 Geographic (spherical) math functions
[@id-sdk/geom]        | 📈 Geometric (planar) math functions
[@id-sdk/projection]  | 📽 Projection class for converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates
[@id-sdk/tiler]       | 🀄️ Tiler class for splitting the world into rectangular tiles
[@id-sdk/vector]      | 📐 Vector (coordinate) math functions

[@id-sdk/extent]: /packages/math/extent
[@id-sdk/geo]: /packages/math/geo
[@id-sdk/geom]: /packages/math/geom
[@id-sdk/projection]: /packages/math/projection
[@id-sdk/tiler]: /packages/math/tiler
[@id-sdk/vector]: /packages/math/vector
