import * as L from "leaflet";
import "leaflet-fullscreen";

window.mapPicker = ($wire, config) => {
    return {
        map: null,
        tile: null,
        marker: null,
        polygon: [],
        createMap: function (el) {
            const that = this;

            this.map = L.map(el, config.controls);
            this.map.on("load", () => {
                setTimeout(() => this.map.invalidateSize(true), 0);
                if (config.showMarker === true) {
                    this.marker.setLatLng(this.map.getCenter());
                }
            });

            if (!config.draggable) {
                this.map.dragging.disable();
            }

            this.tile = L.tileLayer(config.tilesUrl, {
                attribution: config.attribution,
                minZoom: config.minZoom,
                maxZoom: config.maxZoom,
                tileSize: config.tileSize,
                zoomOffset: config.zoomOffset,
                detectRetina: config.detectRetina,
            }).addTo(this.map);

            if (config.showMarker === true) {
                const markerColor = config.markerColor || "#3b82f6";
                const svgIcon = L.divIcon({
                    html: `<svg xmlns="http://www.w3.org/2000/svg" class="map-icon" fill="${markerColor}" width="36" height="36" viewBox="0 0 24 24"><path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>`,
                    className: "",
                    iconSize: [36, 36],
                    iconAnchor: [18, 36],
                });
                this.marker = L.marker([0, 0], {
                    icon: svgIcon,
                    draggable: false,
                    autoPan: true,
                }).addTo(this.map);
                this.map.on("move", () =>
                    this.marker.setLatLng(this.map.getCenter()),
                );
            }

            this.map.on("moveend", () => {
                let coordinates = this.getCoordinates();
                if (
                    config.draggable &&
                    (coordinates.lng !== this.map.getCenter()["lng"] ||
                        coordinates.lat !== this.map.getCenter()["lat"])
                ) {
                    // $wire.set(config.statePath, this.map.getCenter(), false)

                    console.log(config.statePath);
                    console.log("moveend");
                    $wire.set(
                        config.statePath,
                        {
                            lat: this.map.getCenter().lat,
                            lng: this.map.getCenter().lng,
                            polygon:
                                $wire.get(config.statePath).polygon ??
                                this.polygon,
                        },
                        false,
                    );
                    console.log($wire.get(config.statePath));
                    // di sini berhasil

                    if (config.liveLocation) {
                        $wire.$refresh();
                    }
                }
            });

            this.map.on("locationfound", function () {
                that.map.setZoom(config.controls.zoom);
            });
            let location = this.getCoordinates();
            if (!location.lat && !location.lng) {
                this.map.locate({
                    setView: true,
                    maxZoom: config.controls.maxZoom,
                    enableHighAccuracy: true,
                    watch: false,
                });
            } else {
                this.map.setView(new L.LatLng(location.lat, location.lng));
            }

            // menggambar polygon
            //

            const createAreaTooltip = (layer) => {
                if (layer.areaTooltip) {
                    return;
                }

                layer.areaTooltip = L.tooltip({
                    permanent: true,
                    direction: "center",
                    className: "area-tooltip",
                });

                layer.on("remove", function (event) {
                    layer.areaTooltip.remove();
                });

                layer.on("add", (event) => {
                    updateAreaTooltip(layer);
                    layer.areaTooltip.addTo(this.map);
                });

                if (this.map.hasLayer(layer)) {
                    updateAreaTooltip(layer);
                    layer.areaTooltip.addTo(this.map);
                }
            };

            const updateAreaTooltip = (layer) => {
                var area = window.L.GeometryUtil.geodesicArea(
                    layer.getLatLngs()[0],
                );
                var readableArea = window.L.GeometryUtil.readableArea(
                    area,
                    true,
                );
                var latlng = layer.getCenter();

                layer.areaTooltip.setContent(readableArea).setLatLng(latlng);
            };

            console.log("Cek state");
            console.log($wire.get(config.statePath));

            console.log("Cek polygon");
            console.log($wire.get(config.statePath).polygon);

            let polygonMauCetak = [];
            for (let koordinat of $wire.get(config.statePath).polygon) {
                polygonMauCetak.push([koordinat.lat, koordinat.lng]);
            }

            let polygon = L.polygon(polygonMauCetak).addTo(this.map);

            createAreaTooltip(polygon);

            /**
             * EXAMPLE WITH LEAFLET DRAW CONTROL
             */
            var drawnItems = L.featureGroup().addTo(this.map);

            this.map.addControl(
                new L.Control.Draw({
                    edit: {
                        featureGroup: drawnItems,
                        poly: {
                            allowIntersection: false,
                        },
                    },
                    draw: {
                        marker: false,
                        circle: false,
                        circlemarker: false,
                        rectangle: false,
                        polyline: false,
                        polygon: {
                            allowIntersection: false,
                            showArea: true,
                        },
                    },
                }),
            );

            // console.log(L.Draw)
            this.map.on(window.L.Draw.Event.CREATED, (event) => {
                var layer = event.layer;

                if (layer instanceof L.Polygon) {
                    createAreaTooltip(layer);
                }

                drawnItems.addLayer(layer);

                this.polygon = event.layer["_latlngs"][0];

                // $wire.set(config.statePath.polygon, event.layer['_latlngs'])
                $wire.set(
                    config.statePath,
                    {
                        lat: config.statePath.lat,
                        lng: config.statePath.lng,
                        polygon: this.polygon,
                    },
                    false,
                );
                console.log($wire.get(config.statePath));
                $wire.$refresh();
            });

            this.map.on(window.L.Draw.Event.EDITED, function (event) {
                event.layers.getLayers().forEach(function (layer) {
                    if (layer instanceof L.Polygon) {
                        updateAreaTooltip(layer);
                    }
                });
            });
        },
        removeMap: function (el) {
            if (this.marker) {
                this.marker.remove();
                this.marker = null;
            }
            this.tile.remove();
            this.tile = null;
            this.map.off();
            this.map.remove();
            this.map = null;
        },
        getCoordinates: function () {
            let location = $wire.get(config.statePath);
            if (location === null || !location.hasOwnProperty("lat")) {
                location = { lat: 0, lng: 0, polygon: [] };
            }

            return location;
        },
        attach: function (el) {
            this.createMap(el);
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.intersectionRatio > 0) {
                            if (!this.map) this.createMap(el);
                        } else {
                            this.removeMap(el);
                        }
                    });
                },
                {
                    root: null, // set document viewport as root
                    rootMargin: "0px", // margin around root
                    threshold: 1.0, // 1.0 means that when 100% of the target is visible
                },
            );
            observer.observe(el);
        },
    };
};
window.dispatchEvent(new CustomEvent("map-script-loaded"));
