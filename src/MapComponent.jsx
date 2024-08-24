// src/MapComponent.js
import React, { useRef, useEffect } from 'react';
import { Map, View } from 'ol';
import 'ol/ol.css';
import Tile from 'ol/layer/Tile';
import Vector from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { DragPan } from 'ol/interaction';
// import { extent } from 'ol/extent';
import pin from './pin-55.svg'

const MapComponent = () => {
    const mapRef = useRef(null);

    useEffect(() => {

        // Function to get latitude and longitude from URL
        const getLatLngFromUrl = () => {
            const url = new URL(window.location.href); // Get the current URL
            const lat = parseFloat(url.searchParams.get('lat')); // Extract latitude
            const lng = parseFloat(url.searchParams.get('lng')); // Extract longitude
            return { lat, lng };
        };

        // Extract coordinates from URL
        const { lat, lng } = getLatLngFromUrl();
        if (isNaN(lat) || isNaN(lng)) {
            console.error('Invalid latitude or longitude in URL');
            return;
        }

        // Create the map
        const map = new Map({
            target: mapRef.current,
            layers: [
                new Tile({
                    source: new OSM(),
                }),
                new Vector({
                    source: new VectorSource({
                        features: [
                            new Feature({
                                geometry: new Point(fromLonLat([lng, lat])),
                            }),
                        ],
                    }),
                    style: new Style({
                        image: new Icon({
                            src: pin, // URL to the pin image
                            scale: 0.15, // Adjust scale to fit your needs
                        }),
                    }),
                }),
            ],
            view: new View({
                center: fromLonLat([lng, lat]),
                zoom: 15,
            }),
        });

        // Disable dragging/panning beyond a certain latitude range
        const maxLatitude = 180; // Maximum latitude allowed
        const minLatitude = -180; // Minimum latitude allowed

        // Override the default DragPan interaction
        // const interactions = map.getInteractions().getArray().filter(interaction => !(interaction instanceof DragPan));
        map.removeInteraction(map.getInteractions().getArray().find(interaction => interaction instanceof DragPan));

        map.addInteraction(new DragPan({
            // Custom function to prevent panning beyond fixed latitude
            handleDragEvent: (event) => {
                const view = map.getView();
                const newCenter = view.getCenter();
                const newLat = fromLonLat(newCenter)[1];
                if (newLat > maxLatitude || newLat < minLatitude) {
                    return;
                }
                view.setCenter(newCenter);
            }
        }));

        // Cleanup on component unmount
        return () => map.setTarget(undefined);
    }, []);

    return (
        <div
            ref={mapRef}
            style={{ width: '100%', height: '100vh' }}
        />
    );
};

export default MapComponent;
