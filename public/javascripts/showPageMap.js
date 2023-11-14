
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
style: 'mapbox://styles/mapbox/light-v11', // style URL
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 9 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

const marker = new mapboxgl.Marker({
    }).setLngLat(campground.geometry.coordinates)
    .setPopup(new mapboxgl.Popup().setHTML(`<h4>${campground.title}</h4> <p>${campground.location}</p>`)) 
    .addTo(map);


