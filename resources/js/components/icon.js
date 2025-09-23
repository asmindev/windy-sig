import L from 'leaflet';

// Fix default Leaflet marker icons and set up custom icon
delete L.Icon.Default.prototype._getIconUrl;
export const customIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3082/3082383.png', // Custom shopping bag icon
    iconSize: [38, 38], // Size of the icon
    iconAnchor: [19, 38], // Anchor point (bottom center of icon)
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
});
