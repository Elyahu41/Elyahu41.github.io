class ROZmanim extends KosherZmanim.ComplexZmanimCalendar {
  constructor(geoLocation) {
    super(geoLocation);
  }

  getEarliestTalitAndTefilin() {
    var shaahZmanit = this.getTemporalHour(this.getSunrise(), this.getSunset());
    var dakahZmanit = shaahZmanit / 60;
    return new Date(this.getAlos72Zmanis().toMillis() + (6 * dakahZmanit));
  }

  getPlagHamincha() {
    var shaahZmanit = this.getTemporalHour(this.getSunrise(), this.getSunset());
    var dakahZmanit = shaahZmanit / 60;
    return new Date(this.getTzait().getTime() - (shaahZmanit + (15 * dakahZmanit)));
  }

  getTzait() {
    var shaahZmanit = this.getTemporalHour(this.getSunrise(), this.getSunset());
    var dakahZmanit = shaahZmanit / 60;
    return new Date(this.getSunset().toMillis() + ((13 * dakahZmanit) + (dakahZmanit / 2)))
  }

}


function updateZmanimList() {
  var date = document.getElementById("Date");
  date.innerHTML =
    jewishCalendar.getDate().toJSDate().toDateString() + " • " +
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

  parasha.innerHTML =
    hebrewFormatter.formatParsha(jewishCalendar) +
    " " +
    hebrewFormatter.formatSpecialParsha(jewishCalendar);

  jewishCalendar.setDate(currentDay); //reset to current day

  //zmanim list updated here

  var alot = document.getElementById("Alot");
  var talit = document.getElementById("Talit");
  var sunrise = document.getElementById("Sunrise");
  var latestShmaMGA = document.getElementById("LatestShmaMGA");
  var latestShmaGRA = document.getElementById("LatestShmaGRA");
  var latestBerachotShmaGRA = document.getElementById("LatestBerachotShmaGRA");
  var chatzot = document.getElementById("Chatzot");
  var minchaGedola = document.getElementById("MinchaGedola");
  var minchaKetana = document.getElementById("MinchaKetana");
  var plag = document.getElementById("Plag");
  var sunset = document.getElementById("Sunset");
  var tzeit = document.getElementById("Tzeit");
  var rt = document.getElementById("RT");
  var chatzotLayla = document.getElementById("ChatzotLayla");

    alot.innerHTML = "Alot Hashachar: " + zmanimCalendar.getAlos72Zmanis().toJSDate().toLocaleTimeString();
    talit.innerHTML = "Earliest Talit and Tefilin: " + zmanimCalendar.getEarliestTalitAndTefilin().toLocaleTimeString();//no need to convert to JSDate
    sunrise.innerHTML = "Sunrise (Mishor): " + zmanimCalendar.getSeaLevelSunrise().toJSDate().toLocaleTimeString();
    latestShmaMGA.innerHTML = "Latest Shma MG'A: " + zmanimCalendar.getSofZmanShmaMGA72MinutesZmanis().toJSDate().toLocaleTimeString();
    latestShmaGRA.innerHTML = "Latest Shma GR'A: " + zmanimCalendar.getSofZmanShmaGRA().toJSDate().toLocaleTimeString();
    latestBerachotShmaGRA.innerHTML = "Latest Berachot Shma GR'A: " + zmanimCalendar.getSofZmanTfilaGRA().toJSDate().toLocaleTimeString();
    chatzot.innerHTML = "Chatzot: " + zmanimCalendar.getChatzos().toJSDate().toLocaleTimeString();
    minchaGedola.innerHTML = "Mincha Gedola: " + zmanimCalendar.getMinchaGedolaGreaterThan30().toJSDate().toLocaleTimeString();
    minchaKetana.innerHTML = "Mincha Ketana: " + zmanimCalendar.getMinchaKetana().toJSDate().toLocaleTimeString();
    plag.innerHTML = "Plag HaMincha: " + zmanimCalendar.getPlagHamincha().toLocaleTimeString();//no need to convert to JSDate
    sunset.innerHTML = "Sunset: " + zmanimCalendar.getSunset().toJSDate().toLocaleTimeString();
    tzeit.innerHTML = "Tzeit Hacochavim: " + zmanimCalendar.getTzait().toLocaleTimeString();//no need to convert to JSDate
    rt.innerHTML = "Rabbeinu Tam: " + zmanimCalendar.getTzais72Zmanis().toJSDate().toLocaleTimeString();
    chatzotLayla.innerHTML = "Chatzot Layla: " + zmanimCalendar.getSolarMidnight().toJSDate().toLocaleTimeString();
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
