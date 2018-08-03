$(document).ready(() => {
  let savedRestaurants = [];
  const $input = $('#restaurant-das');
  const $searchBtn = $('#search-btn');
  const $restaurantList = $('#restaurant-list');
  const $savedRestaurantList = $('#saved-restaurant-list');

  const buildRestaurantList = (restaurant, element) => {
    element.append(`
      <tr>
        <td scope="row"> ${restaurant.dba} </td>
        <td> ${restaurant.address} </td>
        <td> ${restaurant.inspection_date} </td>
        <td> ${restaurant.grade} </td>
      </tr>`
    );
  };

  const sortViolations = (a, b) => {
    if (a.inspection_date < b.inspection_date)
      return 1;
    if (a.inspection_date > b.inspection_date)
      return -1;
    return 0;
  };

  const extractAddress = (violation) => {
    return `${violation.building} ${violation.street} ${violation.boro}, ${violation.zipcode}`;
  };

  const search = () => {
    $restaurantList.empty();
    const term = $input.val();
    $.ajax({
      url: `https://data.cityofnewyork.us/resource/9w7m-hzhe.json?$where=DBA%20like%20%22%25${term.toUpperCase()}%25%22`,
      success: function (violations) {
        violations.sort(sortViolations);
        const restaurants = {};
        violations.forEach(violation => {
          if (restaurants[violation.camis]) {
            restaurants[violation.camis].violations.push(violation);
          } else {
            restaurants[violation.camis] = {
              camis: violation.camis,
              dba: violation.dba,
              address: extractAddress(violation),
              cuisine_description: violation.cuisine_description,
              inspection_date: violation.inspection_date.slice(0, violation.inspection_date.indexOf('T')),
              phone: violation.phone,
              grade: violation.grade,
              violations: [violation]
            };
          }
        });
        Object.keys(restaurants).map(key => {
          const restaurant = restaurants[key];
          buildRestaurantList(restaurant, $restaurantList);
        });
      }
    });
  };

  chrome.storage.local.get(['restaurants'], function (result) {
    savedRestaurants = result.key ? result.key : [41541793];
    savedRestaurants.forEach(id => {
      $.ajax({
        url: `https://data.cityofnewyork.us/resource/9w7m-hzhe.json?camis=${id}`,
        success: function (violations) {
          violations.sort(sortViolations);
          const latestViolation = violations[0];
          const restaurant = {
            violations,
            camis: latestViolation.camis,
            dba: latestViolation.dba,
            address: extractAddress(latestViolation),
            cuisine_description: latestViolation.cuisine_description,
            inspection_date: latestViolation.inspection_date.slice(0, latestViolation.inspection_date.indexOf('T')),
            phone: latestViolation.phone,
            grade: latestViolation.grade,
          };
          buildRestaurantList(restaurant, $savedRestaurantList);
        }
      });
    });
  });
  $searchBtn.bind('click', search);


  const nameMap = {
    "21 Homes Kitchen": 41398041,
    "Abace Sushi": 50006214,
    "Aki Sushi": null,
    "Al Horno Lean Mexican (47th St)": 50010032,
    "At Nine Thai": 50076881,
    "Balade Your Way": 50047762,
    "Bareburger": 50000763,
    "BOI Noodle House": 41473278,
    "Bon Chon Chicken": 50016964,
    "Cafe China": 50072882,
    "Chopt Creative Salad Co. (Empire State Building)": 50060390,
    "Curry Dream": 41132647,
    "Dallas BBQ": 41173328,
    "Dig Inn": 41365576,
    "Dim Sum Palace": 50051234,
    "Dos Toros Taqueria": 50055078,
    "Evergreen Shanghai Restaurant": 50014124,
    "Good Seed Salad & Market": 50061189,
    "Guy & Gallard": 40951884,
    "Hale & Hearty Soups": 40959649,
    "Happy Family Chinese and Japanese Restaurant": 41340002,
    "Hestia": 50009921,
    "Hudson Market": null,
    "Hummus & Pita Co.": 50016104,
    "Indikitch": 50005876,
    "Jerusalem Cafe": 41643561,
    "Joy Curry & Tandoor": 41666656,
    "Just Salad": 41235038,
    "Kati Roll Company": 41272891,
    "Kofoo": null,
    "Kosher Deluxe": 40825868,
    "Lenwich": 50049229,
    "Let's Poke": 50075055,
    "Little Italy Pizza": 41454913,
    "Market Crates": 50041709,
    "Meltshop": 50014853,
    "Mulberry & Vine": 50047068,
    "Mee Noodle Shop": 50034050,
    "Natureworks": 41419773,
    "Pinkberry - Hell's Kitchen": 50049034,
    "Pokechan": 50057872,
    "Piccolo Cafe": 41538666,
    "Pulled & Chopped BBQ": null,
    "Riko Peruvian": 50051650,
    "Room Service": 50015344,
    "Sophie's Cuban": 50055346,
    "Tacos Time Square": 50060422,
    "The Original Fresh Tortillas Grill": 50050765,
    "Tio Pio": 41232741,
    "Witchcraft": 50065815,
  };

  $(function () {
    $("#restaurant-das").autocomplete({
      source: Object.keys(nameMap),
      delay: 0
    });
  });

});