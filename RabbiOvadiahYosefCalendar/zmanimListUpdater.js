var locationName = "";
var lat = 0;
var long = 0;
var elevation = 0;
var timezone = "";
var geoLocation = null;
var zmanimCalendar = null;
var jewishCalendar = new KosherZmanim.JewishCalendar();
var hebrewFormatter = new KosherZmanim.HebrewDateFormatter();
hebrewFormatter.setHebrewFormat(true);
var isShabbatMode = false;
var showSeconds = false;
//end of global variables

//get the location details from the query string and create the zmanim calendar
var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
locationName = urlParams.get("locationName");
lat = parseFloat(urlParams.get("lat"));
long = parseFloat(urlParams.get("long"));
elevation = parseFloat(urlParams.get("elevation"));
if (isNaN(elevation)) {
  elevation = 0;
}
timezone = urlParams.get("timeZone");
if (isNaN(lat) && isNaN(long)) {
  getLocation();
}
var geoLocation = new KosherZmanim.GeoLocation(
  locationName,
  lat,
  long,
  elevation,
  timezone
);

if (timezone == "Asia/Jerusalem") {
  //if the timezone is Asia/Jerusalem, then the location is probably very close to the Israel or in Israel, so we set the jewish calendar to inIsrael mode
  jewishCalendar.setInIsrael(true);
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setLatLong, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function setLatLong(position) {
  locationName = getJSON(
    "https://secure.geonames.org/findNearbyPlaceNameJSON?lat=" +
      position.coords.latitude +
      "&lng=" +
      position.coords.longitude +
      "&username=Elyahu41"
  ).then((data) => {
    locationName =
      data["geonames"][0]["name"] +
      ", " +
      data["geonames"][0]["adminName1"] +
      ", " +
      data["geonames"][0]["countryName"];
  });
  lat = position.coords.latitude;
  long = position.coords.longitude;
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  getAverageElevation(lat, long) | 0;
}

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

function getAverageElevation(lat, long) {
  var sum = 0;
  var count = 0;
  var elevations = [];

  //we make 3 JSON requests to get the elevation data from the 3 different sources on geonames.org and we average the results
  getJSON(
    "https://secure.geonames.org/srtm3JSON?lat=" +
      lat +
      "&lng=" +
      long +
      "&username=Elyahu41"
  )
    .then((data) => {
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
      }
    })
    .then(() => {
      //this is the second request
      getJSON(
        "https://secure.geonames.org/astergdemJSON?lat=" +
          lat +
          "&lng=" +
          long +
          "&username=Elyahu41"
      )
        .then((data) => {
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
          }
        })
        .then(() => {
          //this is the third request
          getJSON(
            "https://secure.geonames.org/gtopo30JSON?lat=" +
              lat +
              "&lng=" +
              long +
              "&username=Elyahu41"
          )
            .then((data) => {
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
              }
            })
            .then(() => {
              geoLocation = new KosherZmanim.GeoLocation(
                locationName,
                lat,
                long,
                elevation,
                timezone
              );
              init();
              updateZmanimList();
            });
        });
    });
}

const getJSON = async (url) => {
  const response = await fetch(url);
  return (data = response.json()); // get JSON from the response
};

class ROZmanim extends KosherZmanim.ComplexZmanimCalendar {
  //custom zmanim class, RO stands for Rabbi Ovadia
  constructor(geoLocation) {
    super(geoLocation);
    this.setCandleLightingOffset(20);
    this.setUseElevation(true);
  }

  getEarliestTalitAndTefilin() {
    var shaahZmanit = this.getTemporalHour(this.getSunrise(), this.getSunset());
    var dakahZmanit = shaahZmanit / 60;
    return new Date(this.getAlos72Zmanis().toMillis() + 6 * dakahZmanit);
  }

  //TODO Netz

  getSofZmanBiurChametzMGA() {
    var shaahZmanit = this.getTemporalHour(
      this.getAlos72Zmanis(),
      this.getTzais72Zmanis()
    );
    return new Date(this.getAlos72Zmanis().toMillis() + shaahZmanit * 5);
  }

  getPlagHamincha() {
    var shaahZmanit = this.getTemporalHour(this.getSunrise(), this.getSunset());
    var dakahZmanit = shaahZmanit / 60;
    return new Date(
      this.getTzait().getTime() - (shaahZmanit + 15 * dakahZmanit)
    );
  }

  getCandleLighting() {
    return new Date(
      this.getSunset().toMillis() - this.getCandleLightingOffset() * 60_000
    );
  }

  getTzait() {
    var shaahZmanit = this.getTemporalHour(this.getSunrise(), this.getSunset());
    var dakahZmanit = shaahZmanit / 60;
    return new Date(
      this.getSunset().toMillis() + (13 * dakahZmanit + dakahZmanit / 2)
    );
  }

  getTzaitTaanit() {
    return new Date(this.getSunset().toMillis() + 20 * 60_000);
  }

  getTzaitTaanitLChumra() {
    return new Date(this.getSunset().toMillis() + 30 * 60_000);
  }
}

function init() {
  //initializes the zmanim calendar and anythign else that needs to be initialized when the page loads and updates the zmanim list. This function is called at the end of the script
  zmanimCalendar = new ROZmanim(geoLocation);
  document.getElementById("LocationName").innerHTML = locationName;
  if (document.getElementById("LocationName").innerHTML == "") {
    document.getElementById("LocationName").innerHTML =
      "No Location Name Provided";
  }
  var isShowSeconds = localStorage.getItem("isShowSeconds");
  if (isShowSeconds == "true") {
    showSeconds = true;
  } else {
    showSeconds = false;
  }
  var zmanimLanguage = localStorage.getItem("zmanimLanguage");
  if (zmanimLanguage == "TranslatedEnglish") {
    isZmanimInHebrew = false;
    isZmanimInTranslatedEnglish = true;
  } else if (zmanimLanguage == "Hebrew") {
    isZmanimInHebrew = true;
    isZmanimInTranslatedEnglish = false;
  } else {
    isZmanimInHebrew = false;
    isZmanimInTranslatedEnglish = false;
  }
  setButtonsState(isZmanimInHebrew, isZmanimInTranslatedEnglish);
  initLanguageButtons();
  updateZmanimList();
  var shabbatModeButton = document.getElementById("shabbatMode");
  shabbatModeButton.addEventListener("click", function () {
    if (isShabbatMode) {
      shabbatModeButton.innerHTML = "Shabbat Mode";
    } else {
      shabbatModeButton.innerHTML = "Undo Shabbat Mode";
    }
    shabbatMode();
  });
  var showSecondsButton = document.getElementById("showSeconds");
  showSecondsButton.addEventListener("click", function () {
    showSeconds = !showSeconds;
    if (showSeconds) {
      showSecondsButton.innerHTML = "Hide Seconds";
    } else {
      showSecondsButton.innerHTML = "Show Seconds";
    }
    updateZmanimList();
    localStorage.setItem("isShowSeconds", showSeconds);
  });
}

function initLanguageButtons() {
  var hebrewButton = document.getElementById("hebrewZmanim");
  hebrewButton.addEventListener("click", function () {
    isZmanimInHebrew = true;
    isZmanimInTranslatedEnglish = false;
    setButtonsState(isZmanimInHebrew, isZmanimInTranslatedEnglish);
    localStorage.setItem("zmanimLanguage", "Hebrew");
    updateZmanimList();
  });
  var translatedEnglishButton = document.getElementById("englishZmanim");
  translatedEnglishButton.addEventListener("click", function () {
    isZmanimInHebrew = false;
    isZmanimInTranslatedEnglish = true;
    setButtonsState(isZmanimInHebrew, isZmanimInTranslatedEnglish);
    localStorage.setItem("zmanimLanguage", "TranslatedEnglish");
    updateZmanimList();
  });
  var defaultZmanimButton = document.getElementById("defaultZmanim");
  defaultZmanimButton.addEventListener("click", function () {
    isZmanimInHebrew = false;
    isZmanimInTranslatedEnglish = false;
    setButtonsState(isZmanimInHebrew, isZmanimInTranslatedEnglish);
    localStorage.setItem("zmanimLanguage", "Default");
    updateZmanimList();
  });
}

//TODO: finish tekufas, morid hatal, shaah zmanit MGA/GRA, birchot hachama, birkat helevana, debug elevation on the bottom of the page,

function updateZmanimList() {
  //common information first
  var date = document.getElementById("Date");
  date.innerHTML =
    jewishCalendar.getDate().toJSDate().toDateString() +
    " • " +
    jewishCalendar.toString() +
    "  •  " +
    hebrewFormatter.format(jewishCalendar);

  var parasha = document.getElementById("Parasha");

  var currentDay = jewishCalendar.getDate(); //save the current day
  var s = nextSaturday(currentDay.toJSDate(), 6); // 6 = saturday
  function nextSaturday(d, dow) {
    d.setDate(d.getDate() + ((dow + (7 - d.getDay())) % 7));
    return d;
  }
  jewishCalendar.setDate(luxon.DateTime.fromJSDate(s));
  if (hebrewFormatter.formatParsha(jewishCalendar) !== "") {
    parasha.innerHTML = hebrewFormatter.formatParsha(jewishCalendar);
  } else {
    parasha.innerHTML = "No Parasha this week";
  }
  if (hebrewFormatter.formatSpecialParsha(jewishCalendar) !== "") {
    parasha.innerHTML +=
      " / " + hebrewFormatter.formatSpecialParsha(jewishCalendar);
  }
  jewishCalendar.setDate(currentDay); //reset to current day

  var day = document.getElementById("Day");
  //day of week should show the day of the week in English and Hebrew for example: Sunday / ראשון
  day.innerHTML =
    currentDay.toJSDate().toLocaleDateString("en-US", {
      weekday: "long",
    }) +
    " / " +
    "יום " +
    hebrewFormatter.formatDayOfWeek(jewishCalendar);

  var specialDay = document.getElementById("SpecialDay");
  var specialDayText = getSpecialDay();
  if (specialDayText === "") {
    specialDay.style.display = "none";
  } else {
    specialDay.style.display = "block";
    specialDay.innerHTML = specialDayText;
  }

  var isOkayToListenToMusic = getIsOkayToListenToMusic();
  var music = document.getElementById("Music");
  if (isOkayToListenToMusic) {
    music.style.display = "none";
  } else {
    music.style.display = "block";
    music.innerHTML = "No music";
  }

  var ulchaparatPesha = getUlchaparatPesha();
  var ulchaparat = document.getElementById("Ulchaparat");
  if (ulchaparatPesha === "") {
    ulchaparat.style.display = "none";
  } else {
    ulchaparat.style.display = "block";
    ulchaparat.innerHTML = ulchaparatPesha;
  }

  var chamah = document.getElementById("Chamah");
  if (jewishCalendar.isBirkasHachamah()) {
    chamah.style.display = "block";
    chamah.innerHTML = "Birchat HaChamah is said today";
  } else {
    chamah.style.display = "none";
  }

  var tachanun = document.getElementById("Tachanun");
  tachanun.innerHTML = getTachanun();

  //zmanim list updated here
  var alot = document.getElementById("Alot");
  var talit = document.getElementById("Talit");
  var sunrise = document.getElementById("Sunrise");
  var latestShmaMGA = document.getElementById("LatestShmaMGA");
  var latestShmaGRA = document.getElementById("LatestShmaGRA");
  var sofZmanAchilatChametz = document.getElementById("SofZmanAchilatChametz");
  var sofZmanBiurChametz = document.getElementById("SofZmanBiurChametz");
  var latestBerachotShmaGRA = document.getElementById("LatestBerachotShmaGRA");
  var chatzot = document.getElementById("Chatzot");
  var minchaGedola = document.getElementById("MinchaGedola");
  var minchaKetana = document.getElementById("MinchaKetana");
  var plag = document.getElementById("Plag");
  var candle = document.getElementById("Candle");
  var sunset = document.getElementById("Sunset");
  var tzeit = document.getElementById("Tzeit");
  var tzeitCandles = document.getElementById("TzeitCandles");
  var tzeitT = document.getElementById("TzeitT");
  var tzeitTL = document.getElementById("TzeitTL");
  var tzaitSC = document.getElementById("TzeitShabbatChag");
  var rt = document.getElementById("RT");
  var chatzotLayla = document.getElementById("ChatzotLayla");
  var daf = document.getElementById("Daf");
  var dafYerushalmi = document.getElementById("DafYerushalmi");
  var seasonal = document.getElementById("seasonalPrayers");

  if (!showSeconds) {
    alot.innerHTML =
      getAlotString() +
      "<span>" +
      zmanimCalendar
        .getAlos72Zmanis()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>";
    talit.innerHTML =
      getTalitTefilinString() +
      "<span>" +
      zmanimCalendar
        .getEarliestTalitAndTefilin()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + //no need to convert to JSDate
      "</span>";
    sunrise.innerHTML =
      getMishorSunriseString() +
      "<span>" +
      zmanimCalendar
        .getSeaLevelSunrise()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>";
    latestShmaMGA.innerHTML =
      getLatestShmaMGAString() +
      "<span>" +
      zmanimCalendar
        .getSofZmanShmaMGA72MinutesZmanis()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>";
    latestShmaGRA.innerHTML =
      getLatestShmaGRAString() +
      "<span>" +
      zmanimCalendar
        .getSofZmanShmaGRA()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>";
    if (
      jewishCalendar.getYomTovIndex() ===
      KosherZmanim.JewishCalendar.EREV_PESACH
    ) {
      sofZmanAchilatChametz.style.display = "block";
      sofZmanBiurChametz.style.display = "block";
      sofZmanAchilatChametz.innerHTML =
        getSofZmanAchilatChametzString() +
        "<span>" +
        zmanimCalendar
          .getSofZmanTfilaMGA72MinutesZmanis()
          .toJSDate()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
        "</span>";
      latestBerachotShmaGRA.innerHTML =
        getLatestBerachotShmaGRAString() +
        "<span>" +
        zmanimCalendar
          .getSofZmanTfilaGRA()
          .toJSDate()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
        "</span>";
      sofZmanBiurChametz.innerHTML =
        getSofZmanBiurChametzString() +
        "<span>" +
        zmanimCalendar
          .getSofZmanBiurChametzMGA()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + //no need to convert to JSDate
        "</span>";
    } else {
      sofZmanAchilatChametz.style.display = "none";
      sofZmanBiurChametz.style.display = "none";
      latestBerachotShmaGRA.innerHTML =
        getLatestBerachotShmaGRAString() +
        "<span>" +
        zmanimCalendar
          .getSofZmanTfilaGRA()
          .toJSDate()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
        "</span>";
    }

    chatzot.innerHTML =
      getChatzotString() +
      "<span>" +
      zmanimCalendar
        .getChatzos()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>";
    minchaGedola.innerHTML =
      getMinchaGedolaString() +
      "<span>" +
      zmanimCalendar
        .getMinchaGedolaGreaterThan30()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>";
    minchaKetana.innerHTML =
      getMinchaKetanaString() +
      "<span>" +
      zmanimCalendar
        .getMinchaKetana()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>";
    plag.innerHTML =
      getPlagString() +
      "<span>" +
      zmanimCalendar
        .getPlagHamincha()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>"; //no need to convert to JSDate

      if (jewishCalendar.hasCandleLighting() && jewishCalendar.isAssurBemelacha()) {
        if (jewishCalendar.getDayOfWeek() !== 6) {
          tzeitCandles.style.display = "block";
          tzeitCandles.innerHTML = getCandleLightingString() + "<span>" + zmanimCalendar.getTzait().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + "</span>";
        } else {
          tzeitCandles.style.display = "none";
        }
      } else {
        tzeitCandles.style.display = "none";
      }
    if ((jewishCalendar.hasCandleLighting() && !jewishCalendar.isAssurBemelacha()) || jewishCalendar.getDayOfWeek() === 6) {
      var cookieForCLT = getCookie("candleLightingTime");
      if (cookieForCLT) {
        zmanimCalendar.setCandleLightingOffset(parseInt(cookieForCLT));
      } else {
        zmanimCalendar.setCandleLightingOffset(20); //default to 20 minutes
      }
      candle.style.display = "block";
      candle.innerHTML =
        getCandleLightingString() +
        " (" +
        zmanimCalendar.getCandleLightingOffset() +
        ") " +
        "<span>" +
        zmanimCalendar
          .getCandleLighting()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
        "</span>"; //no need to convert to JSDate
      candle.onclick = function () {
        // add on click event to the candle lighting time to save the time to a cookie
        if (document.getElementById("candleMinutes") == null) {
          candle.innerHTML =
            getCandleLightingString() +
            ' (<input type="number" id="candleMinutes" onchange="saveCandleLightingSetting()"/>) ' +
            "<span>" +
            zmanimCalendar
              .getCandleLighting()
              .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
            "</span>"; //no need to convert to JSDate
        }
      };
    } else {
      candle.style.display = "none";
    }

    sunset.innerHTML =
      getSunsetString() +
      "<span>" +
      zmanimCalendar
        .getSunset()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>";
    tzeit.innerHTML =
      getTzeitString() +
      "<span>" +
      zmanimCalendar
        .getTzait()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>"; //no need to convert to JSDate

    if (
      jewishCalendar.isTaanis() &&
      !(
        jewishCalendar.getYomTovIndex() ===
        KosherZmanim.JewishCalendar.YOM_KIPPUR
      )
    ) {
      tzeitT.style.display = "block";
      tzeitTL.style.display = "block";
      tzeitT.innerHTML =
        getTzaitTaanitString() +
        "<span>" +
        zmanimCalendar
          .getTzaitTaanit()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
        "</span>";
      tzeitTL.innerHTML =
        getTzaitTaanitLChumraString() +
        "<span>" +
        zmanimCalendar
          .getTzaitTaanitLChumra()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
        "</span>";
    } else {
      tzeitT.style.display = "none";
      tzeitTL.style.display = "none";
    }

    if (
      jewishCalendar.isAssurBemelacha() &&
      !jewishCalendar.hasCandleLighting()
    ) {
      var cookieForTSC = getCookie("tzeitShabbatTime");
      if (cookieForTSC) {
        zmanimCalendar.setAteretTorahSunsetOffset(parseInt(cookieForTSC));
      } else {
        zmanimCalendar.setAteretTorahSunsetOffset(40); //default to 40 minutes
      }
      tzaitSC.style.display = "block";
      tzaitSC.innerHTML =
        getTzaitShabbatChagString(jewishCalendar) +
        " (" +
        zmanimCalendar.getAteretTorahSunsetOffset() +
        ") " +
        "<span>" +
        zmanimCalendar
          .getTzaisAteretTorah()
          .toJSDate()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
        "</span>";

      tzaitSC.onclick = function () {
        // add on click event to the tzeit shabbat time to save the time to a cookie
        if (document.getElementById("tzeitShabbatMinutes") == null) {
          tzaitSC.innerHTML =
            getTzaitShabbatChagString(jewishCalendar) +
            ' (<input type="number" id="tzeitShabbatMinutes" onchange="saveTzeitShabbatSetting()"/>): ' +
            "<span>" +
            zmanimCalendar
              .getTzaisAteretTorah()
              .toJSDate()
              .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
            "</span>";
        }
      };
    } else {
      tzaitSC.style.display = "none";
    }

    rt.innerHTML =
      getRabbeinuTamString() +
      "<span>" +
      roundUpToMinute(
        zmanimCalendar.getTzais72Zmanis().toJSDate()
      ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>";
    chatzotLayla.innerHTML =
      getChatzotLaylaString() +
      "<span>" +
      zmanimCalendar
        .getSolarMidnight()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
      "</span>";
  } else {
    // if the user wants to see the seconds
    alot.innerHTML =
      getAlotString() +
      "<span>" +
      zmanimCalendar.getAlos72Zmanis().toJSDate().toLocaleTimeString() +
      "</span>";
    talit.innerHTML =
      getTalitTefilinString() +
      "<span>" +
      zmanimCalendar.getEarliestTalitAndTefilin().toLocaleTimeString() +
      "</span>"; //no need to convert to JSDate
    sunrise.innerHTML =
      getMishorSunriseString() +
      "<span>" +
      zmanimCalendar.getSeaLevelSunrise().toJSDate().toLocaleTimeString() +
      "</span>";
    latestShmaMGA.innerHTML =
      getLatestShmaMGAString() +
      "<span>" +
      zmanimCalendar
        .getSofZmanShmaMGA72MinutesZmanis()
        .toJSDate()
        .toLocaleTimeString() +
      "</span>";
    latestShmaGRA.innerHTML =
      getLatestShmaGRAString() +
      "<span>" +
      zmanimCalendar.getSofZmanShmaGRA().toJSDate().toLocaleTimeString() +
      "</span>";

    if (
      jewishCalendar.getYomTovIndex() ===
      KosherZmanim.JewishCalendar.EREV_PESACH
    ) {
      sofZmanAchilatChametz.style.display = "block";
      sofZmanBiurChametz.style.display = "block";
      sofZmanAchilatChametz.innerHTML =
        getSofZmanAchilatChametzString() +
        "<span>" +
        zmanimCalendar
          .getSofZmanTfilaMGA72MinutesZmanis()
          .toJSDate()
          .toLocaleTimeString() +
        "</span>";
      latestBerachotShmaGRA.innerHTML =
        getLatestBerachotShmaGRAString() +
        "<span>" +
        zmanimCalendar.getSofZmanTfilaGRA().toJSDate().toLocaleTimeString() +
        "</span>";
      sofZmanBiurChametz.innerHTML =
        getSofZmanBiurChametzString() +
        "<span>" +
        zmanimCalendar.getSofZmanBiurChametzMGA().toLocaleTimeString() +
        "</span>"; //no need to convert to JSDate
    } else {
      sofZmanAchilatChametz.style.display = "none";
      sofZmanBiurChametz.style.display = "none";
      latestBerachotShmaGRA.innerHTML =
        getLatestBerachotShmaGRAString() +
        "<span>" +
        zmanimCalendar.getSofZmanTfilaGRA().toJSDate().toLocaleTimeString() +
        "</span>";
    }

    chatzot.innerHTML =
      getChatzotString() +
      "<span>" +
      zmanimCalendar.getChatzos().toJSDate().toLocaleTimeString() +
      "</span>";
    minchaGedola.innerHTML =
      getMinchaGedolaString() +
      "<span>" +
      zmanimCalendar
        .getMinchaGedolaGreaterThan30()
        .toJSDate()
        .toLocaleTimeString() +
      "</span>";
    minchaKetana.innerHTML =
      getMinchaKetanaString() +
      "<span>" +
      zmanimCalendar.getMinchaKetana().toJSDate().toLocaleTimeString() +
      "</span>";
    plag.innerHTML =
      getPlagString() +
      "<span>" +
      zmanimCalendar.getPlagHamincha().toLocaleTimeString() +
      "</span>"; //no need to convert to JSDate
      if (jewishCalendar.hasCandleLighting() && jewishCalendar.isAssurBemelacha()) {
        if (jewishCalendar.getDayOfWeek() !== 6) {
          tzeitCandles.style.display = "block";
          tzeitCandles.innerHTML = getCandleLightingString() + "<span>" + zmanimCalendar.getTzait().toLocaleTimeString() + "</span>";
        } else {
          tzeitCandles.style.display = "none";
        }
      } else {
        tzeitCandles.style.display = "none";
      }
    if ((jewishCalendar.hasCandleLighting() && !jewishCalendar.isAssurBemelacha()) || jewishCalendar.getDayOfWeek() === 6) {
      var cookieForCLT = getCookie("candleLightingTime");
      if (cookieForCLT) {
        zmanimCalendar.setCandleLightingOffset(parseInt(cookieForCLT));
      } else {
        zmanimCalendar.setCandleLightingOffset(20); //default to 20 minutes
      }
      candle.style.display = "block";
      candle.innerHTML =
        getCandleLightingString() +
        " (" +
        zmanimCalendar.getCandleLightingOffset() +
        ") " +
        "<span>" +
        zmanimCalendar.getCandleLighting().toLocaleTimeString() +
        "</span>"; //no need to convert to JSDate
      // add on click event to the candle lighting time to save the time to a cookie
      candle.onclick = function () {
        if (document.getElementById("candleMinutes") == null) {
          //if the input element doesn't exist yet then add it to the webpage
          candle.innerHTML =
            getCandleLightingString() +
            ' (<input type="number" id="candleMinutes" onchange="saveCandleLightingSetting()"/>) ' +
            "<span>" +
            zmanimCalendar.getCandleLighting().toLocaleTimeString() +
            "</span>"; //no need to convert to JSDate
        }
      };
    } else {
      candle.style.display = "none";
    }

    sunset.innerHTML =
      getSunsetString() +
      "<span>" +
      zmanimCalendar.getSunset().toJSDate().toLocaleTimeString() +
      "</span>"; //no need to convert to JSDate
    tzeit.innerHTML =
      getTzeitString() +
      "<span>" +
      zmanimCalendar.getTzait().toLocaleTimeString() +
      "</span>"; //no need to convert to JSDate

    if (
      jewishCalendar.isTaanis() &&
      !(
        jewishCalendar.getYomTovIndex() ===
        KosherZmanim.JewishCalendar.YOM_KIPPUR
      )
    ) {
      tzeitT.style.display = "block";
      tzeitTL.style.display = "block";
      tzeitT.innerHTML =
        getTzaitTaanitString() +
        "<span>" +
        zmanimCalendar.getTzaitTaanit().toLocaleTimeString() +
        "</span>"; //no need to convert to JSDate
      tzeitTL.innerHTML =
        getTzaitTaanitLChumraString() +
        "<span>" +
        zmanimCalendar.getTzaitTaanitLChumra().toLocaleTimeString() +
        "</span>"; //no need to convert to JSDate
    } else {
      tzeitT.style.display = "none";
      tzeitTL.style.display = "none";
    }

    if (
      jewishCalendar.isAssurBemelacha() &&
      !jewishCalendar.hasCandleLighting()
    ) {
      var cookieForTSC = getCookie("tzeitShabbatTime");
      if (cookieForTSC) {
        zmanimCalendar.setAteretTorahSunsetOffset(parseInt(cookieForTSC));
      } else {
        zmanimCalendar.setAteretTorahSunsetOffset(40); //default to 40 minutes
      }
      tzaitSC.style.display = "block";
      tzaitSC.innerHTML =
        getTzaitShabbatChagString(jewishCalendar) +
        " (" +
        zmanimCalendar.getAteretTorahSunsetOffset() +
        ") " +
        "<span>" +
        zmanimCalendar.getTzaisAteretTorah().toJSDate().toLocaleTimeString() +
        "</span>";

      tzaitSC.onclick = function () {
        // add on click event to the tzeit shabbat time to save the time to a cookie
        if (document.getElementById("tzeitShabbatMinutes") == null) {
          tzaitSC.innerHTML =
            getTzaitShabbatChagString(jewishCalendar) +
            ' (<input type="number" id="tzeitShabbatMinutes" onchange="saveTzeitShabbatSetting()"/>) ' +
            "<span>" +
            zmanimCalendar
              .getTzaisAteretTorah()
              .toJSDate()
              .toLocaleTimeString() +
            "</span>";
        }
      };
    } else {
      tzaitSC.style.display = "none";
    }

    rt.innerHTML =
      getRabbeinuTamString() +
      "<span>" +
      zmanimCalendar.getTzais72Zmanis().toJSDate().toLocaleTimeString() +
      "</span>"; //no need to convert to JSDate
    chatzotLayla.innerHTML =
      getChatzotLaylaString() +
      "<span>" +
      zmanimCalendar.getSolarMidnight().toJSDate().toLocaleTimeString() +
      "</span>"; //no need to convert to JSDate
  }
  var dafObject = KosherZmanim.YomiCalculator.getDafYomiBavli(jewishCalendar);
  daf.innerHTML =
    "Daf Yomi: " +
    dafObject.getMasechta() +
    " " +
    numberToHebrew(dafObject.getDaf());

  var dafYerushalmiObject =
    KosherZmanim.YerushalmiYomiCalculator.getDafYomiYerushalmi(jewishCalendar);
  if (dafYerushalmiObject.getDaf() == 0) {
    dafYerushalmi.innerHTML = "No Daf Yomi Yerushalmi today";
  } else {
    dafYerushalmi.innerHTML =
      "Daf Yomi Yerushalmi: " +
      dafYerushalmiObject.getMasechta() +
      " " +
      numberToHebrew(dafYerushalmiObject.getDaf());
  }

  seasonal.innerHTML = getSeasonalPrayers();

  // end of zmanim list update
}

function roundUpToMinute(date) {
  var roundedDate = new Date(date);
  roundedDate.setSeconds(0);
  roundedDate.setMilliseconds(0);
  roundedDate.setMinutes(roundedDate.getMinutes() + 1);
  return roundedDate;
}

function forwardOneDay() {
  var nextDay = jewishCalendar.getDate().toJSDate();
  nextDay.setDate(nextDay.getDate() + 1);
  jewishCalendar.setDate(luxon.DateTime.fromJSDate(nextDay));
  zmanimCalendar.setDate(nextDay);
  updateZmanimList();
}

function backwardOneDay() {
  var previousDay = jewishCalendar.getDate().toJSDate();
  previousDay.setDate(previousDay.getDate() - 1);
  jewishCalendar.setDate(luxon.DateTime.fromJSDate(previousDay));
  zmanimCalendar.setDate(previousDay);
  updateZmanimList();
}

function updateDate() {
  var date = document.getElementById("date");
  var JSDate = date.value;
  var dateObject = luxon.DateTime.fromFormat(JSDate, "yyyy-MM-dd");
  jewishCalendar.setDate(dateObject);
  zmanimCalendar.setDate(dateObject);
  updateZmanimList();
}

function getSpecialDay() {
  var result = [];
  var yomTovOfToday = getYomTov(jewishCalendar);
  var yomTovOfNextDay = getYomTovForNextDay();

  if (yomTovOfToday === "" && yomTovOfNextDay === "") {
    //if no yom tov today or tomorrow, do nothing to the result array
  } else if (yomTovOfToday === "" && !yomTovOfNextDay.startsWith("Erev")) {
    //if next day has yom tov
    result.push("Erev " + yomTovOfNextDay);
  } else if (
    !(yomTovOfNextDay === "") &&
    !yomTovOfNextDay.startsWith("Erev") &&
    !yomTovOfToday.endsWith(yomTovOfNextDay)
  ) {
    //if today and the next day have yom tov
    result.push(yomTovOfToday + " / Erev " + yomTovOfNextDay);
  } else {
    result.push(yomTovOfToday);
  }
  result = addTaanitBechorot(result);
  result = addRoshChodesh(result);
  result = addDayOfOmer(result);
  result = addDayOfChanukah(result);
  return result.join(" / ");
}

function addTaanitBechorot(result) {
  if (tomorrowIsTaanitBechorot()) {
    //edge case
    result.push("Erev Ta'anit Bechorot");
  }
  if (isTaanisBechoros(jewishCalendar)) {
    result.push("Ta'anit Bechorot");
  }
  return result;
}

function tomorrowIsTaanitBechorot() {
  var nextDay = jewishCalendar.getDate().toJSDate();
  nextDay.setDate(nextDay.getDate() + 1);
  var nextJewishCalendar = new KosherZmanim.JewishCalendar(nextDay);
  return isTaanisBechoros(nextJewishCalendar);
}

function isTaanisBechoros(jewishCalendar) {
  if (
    jewishCalendar.getJewishMonth() === jewishCalendar.NISSAN &&
    ((jewishCalendar.getJewishDayOfMonth() === 14 &&
      jewishCalendar.getDayOfWeek() !== 7) ||
      (jewishCalendar.getJewishDayOfMonth() === 12 &&
        jewishCalendar.getDayOfWeek() === 5))
  ) {
    return true;
  }
}

function addRoshChodesh(result) {
  var roshChodeshOrErevRoshChodesh = getRoshChodeshOrErevRoshChodesh();
  if (roshChodeshOrErevRoshChodesh !== "") {
    result.push(roshChodeshOrErevRoshChodesh);
  }
  return result;
}

function getRoshChodeshOrErevRoshChodesh() {
  var result = "";
  var hebrewFormatter = new KosherZmanim.HebrewDateFormatter();
  if (jewishCalendar.isRoshChodesh()) {
    var roshChodesh = hebrewFormatter.formatRoshChodesh(jewishCalendar);
    if (roshChodesh.includes("Teves")) {
      roshChodesh = "Rosh Chodesh Tevet";
    }
    if (roshChodesh.includes("Tishrei")) {
      roshChodesh = "Rosh Chodesh Tishri";
    }
    result = roshChodesh;
  } else if (jewishCalendar.isErevRoshChodesh()) {
    var nextDay = jewishCalendar.getDate().toJSDate();
    nextDay.setDate(nextDay.getDate() + 1);
    var nextJewishCalendar = new KosherZmanim.JewishCalendar(
      luxon.DateTime.fromJSDate(nextDay)
    );
    var hebrewMonth = hebrewFormatter.formatRoshChodesh(nextJewishCalendar);
    if (hebrewMonth.includes("Teves")) {
      hebrewMonth = "Rosh Chodesh Tevet";
    }
    if (hebrewMonth.includes("Tishrei")) {
      hebrewMonth = "Rosh Chodesh Tishri";
    }
    result = "Erev " + hebrewMonth;
  } else {
    result = "";
  }
  return result;
}

function addDayOfOmer(result) {
  var dayOfOmer = jewishCalendar.getDayOfOmer();
  if (dayOfOmer != -1) {
    result.push(getOrdinal(dayOfOmer) + " day of Omer");
  }
  return result;
}

function addDayOfChanukah(result) {
  var dayOfChanukah = jewishCalendar.getDayOfChanukah();
  if (dayOfChanukah != -1) {
    result.splice(result.indexOf("Chanukah"), 1); //remove Chanukah from the list to avoid duplication
    result.push(getOrdinal(dayOfChanukah) + " day of Chanukah");
  }
  return result;
}

function getSeasonalPrayers() {
  var result = [];
  var startDateForMashivHaruach = new KosherZmanim.JewishDate(
    jewishCalendar.getJewishYear(),
    KosherZmanim.JewishCalendar.TISHREI,
    22
  );
  var endDateForMashivHaruach = new KosherZmanim.JewishDate(
    jewishCalendar.getJewishYear(),
    KosherZmanim.JewishCalendar.NISSAN,
    15
  );
  if (
    jewishCalendar.compareTo(startDateForMashivHaruach) > 0 &&
    jewishCalendar.compareTo(endDateForMashivHaruach) < 0
  ) {
    result.push("משיב הרוח");
  } else {
    result.push("מוריד הטל");
  }

  if (isBarechAleinu()) {
    result.push("ברך עלינו");
  } else {
    result.push("ברכנו");
  }
  return result.join(" / ");
}

function isBarechAleinu() {
  var tekufatTishriElapsedDays =
    KosherZmanim.JewishCalendar.getJewishCalendarElapsedDays(
      jewishCalendar.getJewishYear()
    ) +
    (KosherZmanim.JewishCalendar.getDaysSinceStartOfJewishYear(
      jewishCalendar.getJewishYear,
      jewishCalendar.getJewishMonth(),
      jewishCalendar.getJewishDayOfMonth()
    ) -
      1) +
    0.5;
  var solar = (jewishCalendar.getJewishYear() - 1) * 365.25;
  tekufatTishriElapsedDays = Math.floor(tekufatTishriElapsedDays - solar);
  if (
    jewishCalendar.getJewishMonth() === KosherZmanim.JewishCalendar.NISSAN &&
    jewishCalendar.getJewishDayOfMonth() < 15
  ) {
    return true;
  }
  if (jewishCalendar.getJewishMonth() < KosherZmanim.JewishCalendar.CHESHVAN) {
    return false;
  }
  if (jewishCalendar.getInIsrael()) {
    return (
      jewishCalendar.getJewishMonth() !==
        KosherZmanim.JewishCalendar.CHESHVAN ||
      jewishCalendar.getJewishDayOfMonth() >= 7
    );
  } else {
    return tekufatTishriElapsedDays >= 47;
  }
}

function getOrdinal(number) {
  //https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
  var suffixes = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];
  switch (number % 100) {
    case 11:
    case 12:
    case 13:
      return number + "th";
    default:
      return number + suffixes[number % 10];
  }
}

function getYomTov(jewishCalendar) {
  switch (jewishCalendar.getYomTovIndex()) {
    case KosherZmanim.JewishCalendar.EREV_PESACH:
      return "Erev Pesach";
    case KosherZmanim.JewishCalendar.PESACH:
      return "Pesach";
    case KosherZmanim.JewishCalendar.CHOL_HAMOED_PESACH:
      return "Chol HaMoed Pesach";
    case KosherZmanim.JewishCalendar.PESACH_SHENI:
      return "Pesach Sheni";
    case KosherZmanim.JewishCalendar.EREV_SHAVUOS:
      return "Erev Shavuot";
    case KosherZmanim.JewishCalendar.SHAVUOS:
      return "Shavuot";
    case KosherZmanim.JewishCalendar.SEVENTEEN_OF_TAMMUZ:
      return "Fast of the Seventeenth of Tammuz";
    case KosherZmanim.JewishCalendar.TISHA_BEAV:
      return "Tisha Be'Av";
    case KosherZmanim.JewishCalendar.TU_BEAV:
      return "Tu Be'Av";
    case KosherZmanim.JewishCalendar.EREV_ROSH_HASHANA:
      return "Erev Rosh Hashana";
    case KosherZmanim.JewishCalendar.ROSH_HASHANA:
      return "Rosh Hashana";
    case KosherZmanim.JewishCalendar.FAST_OF_GEDALYAH:
      return "Tzom Gedalya";
    case KosherZmanim.JewishCalendar.EREV_YOM_KIPPUR:
      return "Erev Yom Kippur";
    case KosherZmanim.JewishCalendar.YOM_KIPPUR:
      return "Yom Kippur";
    case KosherZmanim.JewishCalendar.EREV_SUCCOS:
      return "Erev Succot";
    case KosherZmanim.JewishCalendar.SUCCOS:
      return "Succot";
    case KosherZmanim.JewishCalendar.CHOL_HAMOED_SUCCOS:
      return "Chol HaMoed Succot";
    case KosherZmanim.JewishCalendar.HOSHANA_RABBA:
      return "7th day of Sukkot (Hoshana Rabba)";
    case KosherZmanim.JewishCalendar.SHEMINI_ATZERES:
      if (jewishCalendar.getInIsrael()) {
        return "Shemini Atzeret & Simchat Torah";
      } else {
        return "Shemini Atzeret";
      }
    case KosherZmanim.JewishCalendar.SIMCHAS_TORAH:
      if (!jewishCalendar.getInIsrael()) {
        return "Shemini Atzeret & Simchat Torah";
      } else {
        return "Shemini Atzeret";
      }
    //20 was erev chanuka which was deleted
    case KosherZmanim.JewishCalendar.CHANUKAH:
      return "Chanukah";
    case KosherZmanim.JewishCalendar.TENTH_OF_TEVES:
      return "Asarah Be'Tevet";
    case KosherZmanim.JewishCalendar.TU_BESHVAT:
      return "Tu Be'Shevat";
    case KosherZmanim.JewishCalendar.FAST_OF_ESTHER:
      return "Ta'anit Ester";
    case KosherZmanim.JewishCalendar.PURIM:
      return "Purim";
    case KosherZmanim.JewishCalendar.SHUSHAN_PURIM:
      return "Shushan Purim";
    case KosherZmanim.JewishCalendar.PURIM_KATAN:
      return "Purim Katan";
    case KosherZmanim.JewishCalendar.ROSH_CHODESH:
      return "Rosh Chodesh";
    case KosherZmanim.JewishCalendar.YOM_HASHOAH:
      return "Yom Hashoah";
    case KosherZmanim.JewishCalendar.YOM_HAZIKARON:
      return "Yom Hazikaron";
    case KosherZmanim.JewishCalendar.YOM_HAATZMAUT: //tachanun is said
      return "Yom Haatzmaut";
    case KosherZmanim.JewishCalendar.YOM_YERUSHALAYIM: //tachanun erev before, however, Rav ovadia would not say on the day itself
      return "Yom Yerushalayim";
    case KosherZmanim.JewishCalendar.LAG_BAOMER:
      return "Lag B'Omer";
    case KosherZmanim.JewishCalendar.SHUSHAN_PURIM_KATAN:
      return "Shushan Purim Katan";
    default:
      return "";
  }
}

function getYomTovForNextDay() {
  var nextDay = jewishCalendar.getDate().toJSDate();
  nextDay.setDate(nextDay.getDate() + 1);
  var nextJewishCalendar = new KosherZmanim.JewishCalendar(nextDay);
  return getYomTov(nextJewishCalendar);
}

function getTachanun() {
  var yomTovIndex = jewishCalendar.getYomTovIndex();
  if (
    jewishCalendar.isRoshChodesh() ||
    yomTovIndex == KosherZmanim.JewishCalendar ||
    yomTovIndex == KosherZmanim.JewishCalendar.LAG_BAOMER ||
    yomTovIndex == KosherZmanim.JewishCalendar.TISHA_BEAV ||
    yomTovIndex == KosherZmanim.JewishCalendar.TU_BEAV ||
    yomTovIndex == KosherZmanim.JewishCalendar.EREV_ROSH_HASHANA ||
    yomTovIndex == KosherZmanim.JewishCalendar.ROSH_HASHANA ||
    yomTovIndex == KosherZmanim.JewishCalendar.EREV_YOM_KIPPUR ||
    yomTovIndex == KosherZmanim.JewishCalendar.YOM_KIPPUR ||
    yomTovIndex == KosherZmanim.JewishCalendar.TU_BESHVAT ||
    yomTovIndex == KosherZmanim.JewishCalendar.PURIM_KATAN ||
    yomTovIndex == KosherZmanim.JewishCalendar.SHUSHAN_PURIM_KATAN ||
    yomTovIndex == KosherZmanim.JewishCalendar.PURIM ||
    yomTovIndex == KosherZmanim.JewishCalendar.SHUSHAN_PURIM ||
    yomTovIndex == KosherZmanim.JewishCalendar.YOM_YERUSHALAYIM ||
    jewishCalendar.isChanukah() ||
    jewishCalendar.getJewishMonth() == KosherZmanim.JewishCalendar.NISSAN ||
    (jewishCalendar.getJewishMonth() == KosherZmanim.JewishCalendar.SIVAN &&
      jewishCalendar.getJewishDayOfMonth() <= 12) ||
    (jewishCalendar.getJewishMonth() == KosherZmanim.JewishCalendar.TISHREI &&
      jewishCalendar.getJewishDayOfMonth() >= 11)
  ) {
    return "There is no Tachanun today";
  }
  var yomTovIndexForNextDay = getYomTovIndexForNextDay();
  if (
    jewishCalendar.getDate().toJSDate().getDay == 5 ||
    yomTovIndex == KosherZmanim.JewishCalendar.FAST_OF_ESTHER ||
    yomTovIndexForNextDay == KosherZmanim.JewishCalendar.TISHA_BEAV ||
    yomTovIndexForNextDay == KosherZmanim.JewishCalendar.TU_BEAV ||
    yomTovIndexForNextDay == KosherZmanim.JewishCalendar.TU_BESHVAT ||
    yomTovIndexForNextDay == KosherZmanim.JewishCalendar.LAG_BAOMER ||
    yomTovIndexForNextDay == KosherZmanim.JewishCalendar.PESACH_SHENI ||
    yomTovIndexForNextDay == KosherZmanim.JewishCalendar.PURIM_KATAN ||
    jewishCalendar.isErevRoshChodesh()
  ) {
    return "There is only Tachanun in the morning";
  }
  if (jewishCalendar.getDate().toJSDate().getDay() == 6) {
    return "צדקתך";
  }
  return "There is Tachanun today";
}

function getYomTovIndexForNextDay() {
  var nextDay = jewishCalendar.getDate().toJSDate();
  nextDay.setDate(nextDay.getDate() + 1);

  jewishCalendar.setDate(luxon.DateTime.fromJSDate(nextDay));
  var yomTovIndex = jewishCalendar.getYomTovIndex();

  nextDay.setDate(nextDay.getDate() - 1); //reset the date to the original date
  jewishCalendar.setDate(luxon.DateTime.fromJSDate(nextDay));

  return yomTovIndex;
}

function numberToHebrew(num) {
  var buffer = [];
  if (num <= 0 || num >= 6000) return null; // only support 1-5999 for now, since that's all we need, but could be extended
  var let1000 = [" א'", " ב'", " ג'", " ד'", " ה'"];
  var let100 = ["ק", "ר", "ש", "ת"];
  var let10 = ["י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
  var let1 = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];

  if (num >= 100) {
    if (num >= 1000) {
      buffer.push(let1000[Math.floor(num) / 1000 - 1]);
      num %= 1000;
    }

    if (num < 500) {
      buffer.push(let100[Math.floor(num) / 100 - 1]);
    } else if (num < 900) {
      buffer.push("ת");
      buffer.push(let100[(Math.floor(num) - 400) / 100 - 1]);
    } else {
      buffer.push("תת");
      buffer.push(let100[(Math.floor(num) - 800) / 100 - 1]);
    }

    num %= 100;
  }
  switch (num) {
    // Avoid letter combinations from the Tetragrammaton
    case 16:
      buffer.push("טז");
      break;
    case 15:
      buffer.push("טו");
      break;
    default:
      if (num >= 10) {
        buffer.push(let10[Math.floor(num / 10) - 1]);
        num %= 10;
      }
      if (num > 0) {
        buffer.push(let1[Math.floor(num) - 1]);
      }
      break;
  }
  return buffer.join("");
}

function saveCandleLightingSetting() {
  var date = new Date();
  date.setTime(date.getTime() + 36500 * 24 * 60 * 60 * 1000);
  var expires = "expires=" + date.toUTCString();
  var candleLightingTime = document.getElementById("candleMinutes").value;
  var candle = document.getElementById("Candle");
  zmanimCalendar.setCandleLightingOffset(candleLightingTime);
  candle.innerHTML =
    getCandleLightingString() +
    " (" +
    candleLightingTime +
    ") " +
    "<span>" +
    zmanimCalendar.getCandleLighting().toLocaleTimeString() +
    "</span>";
  setCookie("candleLightingTime", candleLightingTime, expires);
}

function saveTzeitShabbatSetting() {
  var date = new Date();
  date.setTime(date.getTime() + 36500 * 24 * 60 * 60 * 1000);
  var expires = "expires=" + date.toUTCString();
  var tzeitShabbatTime = document.getElementById("tzeitShabbatMinutes").value;
  var tzeitShabbat = document.getElementById("TzeitShabbatChag");
  zmanimCalendar.setAteretTorahSunsetOffset(tzeitShabbatTime);
  tzeitShabbat.innerHTML =
    getTzeitShabbatString() +
    " (" +
    tzeitShabbatTime +
    ") " +
    "<span>" +
    zmanimCalendar.getTzaisAteretTorah().toLocaleTimeString() +
    "</span>";
  setCookie("tzeitShabbatTime", tzeitShabbatTime, expires);
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function getIsOkayToListenToMusic() {
  if (
    jewishCalendar.getDayOfOmer() >= 8 &&
    jewishCalendar.getDayOfOmer() <= 33
  ) {
    return false;
  } else if (
    jewishCalendar.getJewishMonth() == KosherZmanim.JewishCalendar.TAMMUZ
  ) {
    if (jewishCalendar.getJewishDayOfMonth() >= 17) {
      return false;
    }
  } else if (
    jewishCalendar.getJewishMonth() == KosherZmanim.JewishCalendar.AV
  ) {
    if (jewishCalendar.getJewishDayOfMonth() <= 9) {
      return false;
    }
  }
  return true;
}

function getUlchaparatPesha() {
  if (jewishCalendar.isRoshChodesh()) {
    if (jewishCalendar.isJewishLeapYear()) {
      var month = jewishCalendar.getJewishMonth();
      if (
        month == KosherZmanim.JewishCalendar.CHESHVAN ||
        month == KosherZmanim.JewishCalendar.KISLEV ||
        month == KosherZmanim.JewishCalendar.TEVES ||
        month == KosherZmanim.JewishCalendar.SHEVAT ||
        month == KosherZmanim.JewishCalendar.ADAR ||
        month == KosherZmanim.JewishCalendar.ADAR_II
      ) {
        return "Say וּלְכַפָּרַת פֶּשַׁע";
      } else {
        return "Do not say וּלְכַפָּרַת פֶּשַׁע";
      }
    } else {
      return "Do not say וּלְכַפָּרַת פֶּשַׁע";
    }
  }
  return "";
}

function shabbatMode() {
  //shabbat mode is a mode that disables all the buttons to change the date, and slowly scrolls the zmanim up and down the screen while displaying the shabbat mode banner
  isShabbatMode = !isShabbatMode;
  if (!isShabbatMode) {
    //undo shabbat mode
    document.getElementById("date").disabled = false;
    document.getElementById("date").style.backgroundColor = "white";
    document.getElementById("date").style.color = "black";
    document.getElementById("date").style.cursor = "pointer";
    document.getElementById("backButton").disabled = false;
    document.getElementById("forwardButton").disabled = false;
  } else {
    var date = new luxon.DateTime.now();
    jewishCalendar.setDate(date);
    zmanimCalendar.setDate(date);
    updateZmanimList(); //update the zmanim list to the current date
    //disable the date buttons
    document.getElementById("date").disabled = true;
    document.getElementById("date").style.backgroundColor = "grey";
    document.getElementById("date").style.color = "black";
    document.getElementById("date").style.cursor = "default";
    document.getElementById("backButton").disabled = true;
    document.getElementById("forwardButton").disabled = true;
    //TODO add a shabbat mode banner
    scrollPage(); //scroll the zmanim up and down the screen
    initUpdaterForZmanim();
  }
}

var scrollDirection = 1;
function scrollPage() {
  if (isShabbatMode) {
    window.scrollBy(0, scrollDirection); // horizontal and vertical scroll increments
    scrolldelay = setTimeout("scrollPage()", 50); // scrolls every 50 milliseconds
    if (window.pageYOffset == 0) {
      scrollDirection = 1;
    } else if (
      window.pageYOffset + 1 >
      document.body.scrollHeight - window.innerHeight
    ) {
      //window.pageYOffset return a float scroll y value, for exemple in my case 78.4000015258789;
      //We add +1 to obtain 79.4
      //(document.body.scrollHeight - window.innerHeight) return a interger of 79
      scrollDirection = -1;
    }
  }
}

function initUpdaterForZmanim() {
  //at 12:00 AM the next day, update the zmanim to the next day's zmanim
  var tomorrow = new luxon.DateTime.now().plus({ days: 1 });
  tomorrow = tomorrow.set({ hour: 0, minute: 0, second: 2, millisecond: 0 });
  var timeUntilTomorrow = tomorrow.diffNow().as("milliseconds");
  setTimeout(function () {
    //TODO test this
    updateZmanimList();
    initUpdaterForZmanim();
  }, timeUntilTomorrow);
}

function setButtonsState(isZmanimInHebrew, isZmanimInTranslatedEnglish) {
  if (isZmanimInHebrew) {
    document.getElementById("hebrewZmanim").disabled = true;
    document.getElementById("englishZmanim").disabled = false;
    document.getElementById("defaultZmanim").disabled = false;
  } else if (isZmanimInTranslatedEnglish) {
    document.getElementById("englishZmanim").disabled = true;
    document.getElementById("hebrewZmanim").disabled = false;
    document.getElementById("defaultZmanim").disabled = false;
  } else {
    document.getElementById("defaultZmanim").disabled = true;
    document.getElementById("hebrewZmanim").disabled = false;
    document.getElementById("englishZmanim").disabled = false;
  }
}

init(); // initialize the page with the current date and location as well as any other buttons that need to be initialized
