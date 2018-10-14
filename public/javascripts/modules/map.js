import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
  center: { lat: 43.2, lng: -79.8},
  zoom: 9
}

function loadPlaces(map, lat = 43.2, lng = -79.8) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then(res => {
      const places = res.data;
      if (!places.length) {
        alert('no places found');
        return;
      }
      // create a bounds
      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();


      const markers = places.map(place => {
        const [placeLng, placeLat] = place.location.coordinates;
        const position = { lat: placeLat, lng: placeLng };
        bounds.extend(position);
        const marker = new google.maps.Marker({
          map: map,
          position: position
        });
        marker.place = place; //attaching the place info on the marker so we have access to it later
        return marker;
      })

      // when someone clicks on a marker, show the details of that place
      markers.forEach(marker => marker.addListener('click', function() {
        const html = `
          <div class='popup'>
            <a href='/store/${this.place.slug}'>
              <img src='/uploads/${this.place.photo || 'store.png'}' alt='${this.place.name}' />
              <p>${this.place.name} -${this.place.location.address} </p>
            </a>
          </div>
        `;
        infoWindow.setContent(html);
        infoWindow.open(map, this); //this is the marker
        console.log(this);
        // console.log(this) => actual marker, which includes the place property that we added
      }))
      // then zoom the map to fit all the markers perfectly
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
    })
}

function makeMap(mapDiv) {
  if (!mapDiv) return;

  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    // console.log(place)
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng())
  })
}

export default makeMap;
