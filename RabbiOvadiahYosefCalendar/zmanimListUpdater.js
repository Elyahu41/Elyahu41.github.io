class ROZmanim extends KosherZmanim.ComplexZmanimCalendar {
  constructor(geoLocation) {
    super(geoLocation);
    this.setCandleLightingOffset(20);
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

//TODO! finish location name, tekufas, morid hatal, shaah zmanit MGA/GRA, birchot hachama, birkat helevana, debug elevation on the bottom of the page,

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
  parasha.innerHTML =
    hebrewFormatter.formatParsha(jewishCalendar) +
    " " +
    hebrewFormatter.formatSpecialParsha(jewishCalendar);
  jewishCalendar.setDate(currentDay); //reset to current day

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
  var tzeitT = document.getElementById("TzeitT");
  var tzeitTL = document.getElementById("TzeitTL");
  var tzeitSC = document.getElementById("TzeitShabbatChag");
  var rt = document.getElementById("RT");
  var chatzotLayla = document.getElementById("ChatzotLayla");
  var daf = document.getElementById("Daf");
  var dafYerushalmi = document.getElementById("DafYerushalmi");

  if (!showSeconds) {
    alot.innerHTML =
      "Alot Hashachar: " +
      zmanimCalendar
        .getAlos72Zmanis()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    talit.innerHTML =
      "Earliest Talit and Tefilin: " +
      zmanimCalendar
        .getEarliestTalitAndTefilin()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); //no need to convert to JSDate
    sunrise.innerHTML =
      "Sunrise (Mishor): " +
      zmanimCalendar
        .getSeaLevelSunrise()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    latestShmaMGA.innerHTML =
      "Latest Shma MG'A: " +
      zmanimCalendar
        .getSofZmanShmaMGA72MinutesZmanis()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    latestShmaGRA.innerHTML =
      "Latest Shma GR'A: " +
      zmanimCalendar
        .getSofZmanShmaGRA()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    if (
      jewishCalendar.getYomTovIndex() ===
      KosherZmanim.JewishCalendar.EREV_PESACH
    ) {
      sofZmanAchilatChametz.style.display = "block";
      sofZmanBiurChametz.style.display = "block";
      sofZmanAchilatChametz.innerHTML =
        "Sof Zman Achilat Chametz: " +
        zmanimCalendar
          .getSofZmanTfilaMGA72MinutesZmanis()
          .toJSDate()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      latestBerachotShmaGRA.innerHTML =
        "Latest Berachot Shma GR'A: " +
        zmanimCalendar
          .getSofZmanTfilaGRA()
          .toJSDate()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      sofZmanBiurChametz.innerHTML =
        "Sof Zman Biur Chametz: " +
        zmanimCalendar
          .getSofZmanBiurChametzMGA()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); //no need to convert to JSDate
    } else {
      sofZmanAchilatChametz.style.display = "none";
      sofZmanBiurChametz.style.display = "none";
      latestBerachotShmaGRA.innerHTML =
        "Latest Berachot Shma GR'A: " +
        zmanimCalendar
          .getSofZmanTfilaGRA()
          .toJSDate()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    chatzot.innerHTML =
      "Chatzot: " +
      zmanimCalendar
        .getChatzos()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    minchaGedola.innerHTML =
      "Mincha Gedola: " +
      zmanimCalendar
        .getMinchaGedolaGreaterThan30()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    minchaKetana.innerHTML =
      "Mincha Ketana: " +
      zmanimCalendar
        .getMinchaKetana()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    plag.innerHTML =
      "Plag HaMincha: " +
      zmanimCalendar
        .getPlagHamincha()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); //no need to convert to JSDate

    if (jewishCalendar.hasCandleLighting()) {
      var cookieForCLT = getCookie("candleLightingTime");
      if (cookieForCLT) {
        zmanimCalendar.setCandleLightingOffset(parseInt(cookieForCLT));
      } else {
        zmanimCalendar.setCandleLightingOffset(20); //default to 20 minutes
      }
      candle.style.display = "block";
      candle.innerHTML =
        "Candle Lighting (" +
        zmanimCalendar.getCandleLightingOffset() +
        ") " +
        zmanimCalendar
          .getCandleLighting()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); //no need to convert to JSDate
      candle.onclick = function () {// add on click event to the candle lighting time to save the time to a cookie
        if (document.getElementById("candleMinutes") == null) {
          candle.innerHTML =
            'Candle Lighting (<input type="number" id="candleMinutes" onchange="saveCandleLightingSetting()"/>): ' +
            zmanimCalendar
              .getCandleLighting()
              .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); //no need to convert to JSDate
        }
      };
    } else {
      candle.style.display = "none";
    }

    sunset.innerHTML =
      "Sunset: " +
      zmanimCalendar
        .getSunset()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    tzeit.innerHTML =
      "Tzeit Hacochavim: " +
      zmanimCalendar
        .getTzait()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); //no need to convert to JSDate

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
        "Tzeit Taanit: " +
        zmanimCalendar
          .getTzaitTaanit()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      tzeitTL.innerHTML =
        "Tzeit Taanit L'Chumra: " +
        zmanimCalendar
          .getTzaitTaanitLChumra()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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
      tzeitSC.style.display = "block";
      tzeitSC.innerHTML =
        "Tzeit Shabbat/Chag (" + zmanimCalendar.getAteretTorahSunsetOffset() + "): " +
        zmanimCalendar
          .getTzaisAteretTorah()
          .toJSDate()
          .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

          tzeitSC.onclick = function () {// add on click event to the tzeit shabbat time to save the time to a cookie
            if (document.getElementById("tzeitShabbatMinutes") == null) {
              tzeitSC.innerHTML =
                'Tzeit Shabbat/Chag (<input type="number" id="tzeitShabbatMinutes" onchange="saveTzeitShabbatSetting()"/>): ' +
                zmanimCalendar
                  .getTzaisAteretTorah()
                  .toJSDate()
                  .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
            }
        }
    } else {
      tzeitSC.style.display = "none";
    }

    rt.innerHTML =
      "Rabbeinu Tam: " +
      zmanimCalendar
        .getTzais72Zmanis()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    chatzotLayla.innerHTML =
      "Chatzot Layla: " +
      zmanimCalendar
        .getSolarMidnight()
        .toJSDate()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } else {
    // if the user wants to see the seconds
    alot.innerHTML =
      "Alot Hashachar: " +
      zmanimCalendar.getAlos72Zmanis().toJSDate().toLocaleTimeString();
    talit.innerHTML =
      "Earliest Talit and Tefilin: " +
      zmanimCalendar.getEarliestTalitAndTefilin().toLocaleTimeString(); //no need to convert to JSDate
    sunrise.innerHTML =
      "Sunrise (Mishor): " +
      zmanimCalendar.getSeaLevelSunrise().toJSDate().toLocaleTimeString();
    latestShmaMGA.innerHTML =
      "Latest Shma MG'A: " +
      zmanimCalendar
        .getSofZmanShmaMGA72MinutesZmanis()
        .toJSDate()
        .toLocaleTimeString();
    latestShmaGRA.innerHTML =
      "Latest Shma GR'A: " +
      zmanimCalendar.getSofZmanShmaGRA().toJSDate().toLocaleTimeString();

    if (
      jewishCalendar.getYomTovIndex() ===
      KosherZmanim.JewishCalendar.EREV_PESACH
    ) {
      sofZmanAchilatChametz.style.display = "block";
      sofZmanBiurChametz.style.display = "block";
      sofZmanAchilatChametz.innerHTML =
        "Sof Zman Achilat Chametz: " +
        zmanimCalendar
          .getSofZmanTfilaMGA72MinutesZmanis()
          .toJSDate()
          .toLocaleTimeString();
      latestBerachotShmaGRA.innerHTML =
        "Latest Berachot Shma GR'A: " +
        zmanimCalendar.getSofZmanTfilaGRA().toJSDate().toLocaleTimeString();
      sofZmanBiurChametz.innerHTML =
        "Sof Zman Biur Chametz: " +
        zmanimCalendar.getSofZmanBiurChametzMGA().toLocaleTimeString(); //no need to convert to JSDate
    } else {
      sofZmanAchilatChametz.style.display = "none";
      sofZmanBiurChametz.style.display = "none";
      latestBerachotShmaGRA.innerHTML =
        "Latest Berachot Shma GR'A: " +
        zmanimCalendar.getSofZmanTfilaGRA().toJSDate().toLocaleTimeString();
    }

    chatzot.innerHTML =
      "Chatzot: " + zmanimCalendar.getChatzos().toJSDate().toLocaleTimeString();
    minchaGedola.innerHTML =
      "Mincha Gedola: " +
      zmanimCalendar
        .getMinchaGedolaGreaterThan30()
        .toJSDate()
        .toLocaleTimeString();
    minchaKetana.innerHTML =
      "Mincha Ketana: " +
      zmanimCalendar.getMinchaKetana().toJSDate().toLocaleTimeString();
    plag.innerHTML =
      "Plag HaMincha: " + zmanimCalendar.getPlagHamincha().toLocaleTimeString(); //no need to convert to JSDate

    if (jewishCalendar.hasCandleLighting()) {
      var cookieForCLT = getCookie("candleLightingTime");
      if (cookieForCLT) {
        zmanimCalendar.setCandleLightingOffset(parseInt(cookieForCLT));
      } else {
        zmanimCalendar.setCandleLightingOffset(20); //default to 20 minutes
      }
      candle.style.display = "block";
      candle.innerHTML =
        "Candle Lighting (" +
        zmanimCalendar.getCandleLightingOffset() +
        ") " +
        zmanimCalendar.getCandleLighting().toLocaleTimeString(); //no need to convert to JSDate
      // add on click event to the candle lighting time to save the time to a cookie
      candle.onclick = function () {
        if (document.getElementById("candleMinutes") == null) {
          candle.innerHTML =
            'Candle Lighting (<input type="number" id="candleMinutes" onchange="saveCandleLightingSetting()"/>): ' +
            zmanimCalendar.getCandleLighting().toLocaleTimeString(); //no need to convert to JSDate
        }
      };
    } else {
      candle.style.display = "none";
    }

    sunset.innerHTML =
      "Sunset: " + zmanimCalendar.getSunset().toJSDate().toLocaleTimeString();
    tzeit.innerHTML =
      "Tzeit Hacochavim: " + zmanimCalendar.getTzait().toLocaleTimeString(); //no need to convert to JSDate

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
        "Tzeit Taanit: " + zmanimCalendar.getTzaitTaanit().toLocaleTimeString();
      tzeitTL.innerHTML =
        "Tzeit Taanit L'Chumra: " +
        zmanimCalendar.getTzaitTaanitLChumra().toLocaleTimeString();
    } else {
      tzeitT.style.display = "none";
      tzeitTL.style.display = "none";
    }

    if (
      jewishCalendar.isAssurBemelacha() &&
      !jewishCalendar.hasCandleLighting()
    ) {
      tzeitSC.style.display = "block";
      tzeitSC.innerHTML =
        "Tzeit Shabbat/Chag (40): " +
        zmanimCalendar.getTzaisAteretTorah().toJSDate().toLocaleTimeString();
    } else {
      tzeitSC.style.display = "none";
    }

    rt.innerHTML =
      "Rabbeinu Tam: " +
      zmanimCalendar.getTzais72Zmanis().toJSDate().toLocaleTimeString();
    chatzotLayla.innerHTML =
      "Chatzot Layla: " +
      zmanimCalendar.getSolarMidnight().toJSDate().toLocaleTimeString();
  }
  var dafObject = KosherZmanim.YomiCalculator.getDafYomiBavli(jewishCalendar);
  daf.innerHTML =
    "Daf Yomi: " +
    dafObject.getMasechta() +
    " " +
    numberToHebrew(dafObject.getDaf());

  var dafYerushalmiObject =
    KosherZmanim.YerushalmiYomiCalculator.getDafYomiYerushalmi(jewishCalendar);
  if (numberToHebrew(dafYerushalmiObject.getDaf()) === null) {
    //edge case for Yom Kippur and Tisha B'Av
    dafYerushalmi.innerHTML = "No Daf Yomi Yerushalmi";
  } else {
    dafYerushalmi.innerHTML =
      "Daf Yomi Yerushalmi: " +
      dafYerushalmiObject.getMasechta() +
      " " +
      numberToHebrew(dafYerushalmiObject.getDaf());
  }
  // end of zmanim list update
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
  var result = "";
  var yomTovOfToday = getYomTov(jewishCalendar);
  var yomTovOfNextDay = getYomTovForNextDay();

  if (yomTovOfToday === "" && yomTovOfNextDay === "") {
    //NEEDED if both empty
    result = "";
  } else if (yomTovOfToday === "" && !yomTovOfNextDay.startsWith("Erev")) {
    //if next day has yom tov
    result = "Erev " + yomTovOfNextDay;
  } else if (
    !(yomTovOfNextDay === "") &&
    !yomTovOfNextDay.startsWith("Erev") &&
    !yomTovOfToday.endsWith(yomTovOfNextDay)
  ) {
    //if today and the next day have yom tov
    result = yomTovOfToday + " / Erev " + yomTovOfNextDay;
  } else {
    result = yomTovOfToday;
  }

  result = addTaanitBechorot(result);
  result = addRoshChodesh(result);
  result = addDayOfOmer(result);
  result = addDayOfChanukah(result);
  return result;
}

function addTaanitBechorot(result) {
  if (tomorrowIsTaanitBechorot()) {
    //edge case
    if (result === "") {
      result = "Erev Ta'anit Bechorot";
    } else {
      result = "Erev Ta'anit Bechorot / " + result;
    }
  }
  if (isTaanisBechoros(jewishCalendar)) {
    if (result === "") {
      result = "Ta'anit Bechorot";
    } else {
      result = "Ta'anit Bechorot / " + result;
    }
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
  if (!(roshChodeshOrErevRoshChodesh === "")) {
    if (!(result === "")) {
      result = roshChodeshOrErevRoshChodesh + " / " + result;
    } else {
      result = roshChodeshOrErevRoshChodesh;
    }
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

function addDayOfChanukah(result) {
  var dayOfChanukah = jewishCalendar.getDayOfChanukah();
  if (dayOfChanukah != -1) {
    if (!result === "") {
      result += " / " + getOrdinal(dayOfChanukah) + " day of Chanukah";
    } else {
      result = getOrdinal(dayOfChanukah) + " day of Chanukah";
    }
  }
  return result;
}

function addDayOfOmer(result) {
  var dayOfOmer = jewishCalendar.getDayOfOmer();
  if (dayOfOmer != -1) {
    if (!result === "") {
      result += " / " + getOrdinal(dayOfOmer) + " day of Omer";
    } else {
      result = getOrdinal(dayOfOmer) + " day of Omer";
    }
  }
  return result;
}

function getOrdinal(number) {
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
        return "Shemini Atzeret / Simchat Torah";
      } else {
        return "Shemini Atzeret";
      }
    case KosherZmanim.JewishCalendar.SIMCHAS_TORAH:
      return "Simchat Torah";
    //20 was erev chanuka which was deleted
    case KosherZmanim.JewishCalendar.CHANUKAH:
      return "Chanuka";
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
  if (num <= 0 || num >= 6000) return null; // should refactor
  var let1000 = [" א'", " ב'", " ג'", " ד'", " ה'"];
  var let100 = ["ק", "ר", "ש", "ת"];
  var let10 = ["י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
  var let1 = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];

  var result = new StringBuilder();

  if (num >= 100) {
    if (num >= 1000) {
      result.append(let1000[Math.floor(num) / 1000 - 1]);
      num %= 1000;
    }

    if (num < 500) {
      result.append(let100[Math.floor(num) / 100 - 1]);
    } else if (num < 900) {
      result.append("ת");
      result.append(let100[(Math.floor(num) - 400) / 100 - 1]);
    } else {
      result.append("תת");
      result.append(let100[(Math.floor(num) - 800) / 100 - 1]);
    }

    num %= 100;
  }
  switch (num) {
    // Avoid letter combinations from the Tetragrammaton
    case 16:
      result.append("טז");
      break;
    case 15:
      result.append("טו");
      break;
    default:
      if (num >= 10) {
        result.append(let10[Math.floor(num / 10) - 1]);
        num %= 10;
      }
      if (num > 0) {
        result.append(let1[Math.floor(num) - 1]);
      }
      break;
  }
  return result.toString();
}

function StringBuilder() {
  this.buffer = [];
}

StringBuilder.prototype.append = function (str) {
  this.buffer.push(str);
};

StringBuilder.prototype.toString = function () {
  return this.buffer.join("");
};

// create a function the saves the candle lighting times for the current user to cookies
function saveCandleLightingSetting() {
  var date = new Date();
  date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
  var expires = "expires=" + date.toUTCString();
  var candleLightingTime = document.getElementById("candleMinutes").value;
  var candle = document.getElementById("Candle");
  zmanimCalendar.setCandleLightingOffset(candleLightingTime);
  candle.innerHTML =
    "Candle Lighting (" +
    candleLightingTime +
    "): " +
    zmanimCalendar.getCandleLighting().toLocaleTimeString(); //update the candle lighting time TODO: fix when time is separated from title
  setCookie("candleLightingTime", candleLightingTime, expires);
}

function saveTzeitShabbatSetting() {
    var date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    var expires = "expires=" + date.toUTCString();
    var tzeitShabbatTime = document.getElementById("tzeitShabbatMinutes").value;
    var tzeitShabbat = document.getElementById("TzeitShabbatChag");
    zmanimCalendar.setAteretTorahSunsetOffset(tzeitShabbatTime);
    tzeitShabbat.innerHTML =
        "Tzeit Shabbat (" +
        tzeitShabbatTime +
        "): " +
        zmanimCalendar.getTzaisAteretTorah().toJSDate().toLocaleTimeString(); //update the tzeit shabbat time TODO: fix when time is separated from title
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
