# id-sdk

🆔 Map editing made easy


## What is it?

This project contains code for processing and editing map data.  Our goal is to provide a shared foundation upon which developers can build map editors, data processors, validators, and other innovative tools.

Much of the code was spun out of the [OpenStreetMap iD editor](https://github.com/openstreetmap/iD) project.


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

[@id-sdk/extent]: /packages/math/extent/README.md
[@id-sdk/geo]: /packages/math/geo/README.md
[@id-sdk/geom]: /packages/math/geom/README.md
[@id-sdk/projection]: /packages/math/projection/README.md
[@id-sdk/tiler]: /packages/math/tiler/README.md
[@id-sdk/vector]: /packages/math/vector/README.md


## Contributing

We're not able to support external contributors at this time.


## Documentation

Documentation can be found here:
https://ideditor.github.io/id-sdk/docs/
