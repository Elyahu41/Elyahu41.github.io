var locationName = document.getElementById("LocationName");
getLocation(); //call the function right away

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setLatLong, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function setLatLong(position) {
  lat = position.coords.latitude;
  long = position.coords.longitude;
  elevation = 0;

  locationName.innerHTML = "Latitude: " + lat + " Longitude: " + long; //temp

  getAverageElevation(lat, long) | 0;
  
}

function getAverageElevation(lat, long) {
  var sum = 0;
  var count = 0;
  var elevations = [];

  //we make 3 JSON requests to get the elevation data from the 3 different sources on geonames.org and we average the results
  //whichever is the last one to return will be the one to sum up and divide by the number of elevations to get the average
  getJSON(
    "http://api.geonames.org/srtm3JSON?lat=" +
      lat +
      "&lng=" +
      long +
      "&username=Elyahu41"
  ).then((data) => {
    if (data.srtm3 > 0) {
      elevations.push(data.srtm3);
    }
    count++;
    if (count == 3) {
      for (var i = 0; i < elevations.length; i++) {
        sum += elevations[i];
      }
    
      var size = elevations.length;
    
      if (size == 0) {
        size = 1;
      }
    
      elevation = sum / size;
      instantiateZmanimCalendar();
    }
  });

  getJSON(
    "http://api.geonames.org/astergdemJSON?lat=" +
      lat +
      "&lng=" +
      long +
      "&username=Elyahu41"
  ).then((data) => {
    if (data.astergdem > 0) {
      elevations.push(data.astergdem);
    }
    count++;
    if (count == 3) {
      for (var i = 0; i < elevations.length; i++) {
        sum += elevations[i];
      }
    
      var size = elevations.length;
    
      if (size == 0) {
        size = 1;
      }
    
      elevation = sum / size;
      instantiateZmanimCalendar();
    }
  });

  getJSON(
    "http://api.geonames.org/gtopo30JSON?lat=" +
      lat +
      "&lng=" +
      long +
      "&username=Elyahu41"
  ).then((data) => {
    if (data.gtopo30 > 0) {
      elevations.push(data.gtopo30);
    }
    count++;
    if (count == 3) {
      for (var i = 0; i < elevations.length; i++) {
        sum += elevations[i];
      }
    
      var size = elevations.length;
    
      if (size == 0) {
        size = 1;
      }
    
      elevation = sum / size;
      instantiateZmanimCalendar();
    }
  });
}

function instantiateZmanimCalendar() {
  geoLocation = new KosherZmanim.GeoLocation(
    "",
    lat,
    long,
    elevation,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  zmanimCalendar = new ROZmanim(geoLocation);
  zmanimCalendar.setUseElevation(true);
  updateZmanimList();
}

const getJSON = async (url) => {
  const response = await fetch(url);
  return (data = response.json()); // get JSON from the response
};

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}
