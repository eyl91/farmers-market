$(document).ready(function () {

  let currentQuery;
  let currentMarket;

  $('#submit').on('click', function () {
    const input = $('.search-input').val().trim();
    console.log(input);
    /* zipAddress(input); */
    apiQuery(input);
  });

  // GOOGLE MAPS 
  var geocoder; //To use later
  var map; //Your map
  function initMap() {
    geocoder = new google.maps.Geocoder();
    //Default setup
    var latlng = new google.maps.LatLng(32.7157, -117.1611);
    var myOptions = {
      zoom: 8,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map"), myOptions);
  }

  // ------------------------------------------- Call this wherever needed to actually handle the display
  function zipAddress(zipCode) {

    var contentString = '<div id="content">' +
      '<div id="siteNotice">' +
      '</div>' +
      '<h1 id="firstHeading" class="firstHeading">Uluru</h1>' +
      '<div id="bodyContent">' +
      '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
      'sandstone rock formation in the southern part of the ' +
      'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) ' +
      'south west of the nearest large town, Alice Springs; 450&#160;km ' +
      '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major ' +
      'features of the Uluru - Kata Tjuta National Park. Uluru is ' +
      'sacred to the Pitjantjatjara and Yankunytjatjara, the ' +
      'Aboriginal people of the area. It has many springs, waterholes, ' +
      'rock caves and ancient paintings. Uluru is listed as a World ' +
      'Heritage Site.</p>' +
      '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
      'https://en.wikipedia.org/w/index.php?title=Uluru</a> ' +
      '(last visited June 22, 2009).</p>' +
      '</div>' +
      '</div>';

    geocoder.geocode({
      'address': zipCode
    }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        //Got result, center the map and put it out there
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
        });
        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        marker.addListener('click', function () {
          infowindow.open(map, marker);
        });

      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }

  function apiQuery(input) {

    $.post(`/api/zip/${input}`, function (body, response, err) {
      console.log(input);
      console.log(err);
      currentQuery = body.results;
      console.log(currentQuery);
      console.log(`Markets Found: ${response}`);
      listGenerator(currentQuery);
    });

  }

  function listGenerator(arrayOfMarkets) {
    let listContainer = $('#queryList');
    let list = arrayOfMarkets.map(function(marketData){return marketData});
    list.forEach(marketData => {
      let linkButton = `<a href="/api/${marketData.id}" class="list-group-item list-group-item-action" data-marketid="${marketData.id}">${marketData.marketname}</a>`;
      listContainer.append(linkButton);
    });
    
  }

  function marketInfoGenerator(marketDataObject) {
    $('#dataContainer').empty();
    const marketObject = marketDataObject;
    console.log('RIGHT HERE!!!!!! --------> ', marketObject);
    let dataContainer = $('dataContainer');
    let marketContent = 
    `<div class="info">
      <div class="img">
      <img class="center-block" id="farm" src="../img/farm.png" alt="farm"> 
      </div>     
    <div class="marketHeader">
      <h3 class="text-center" id="marketName">${marketObject.marketname}</h3>
    </div>
    <div class=" addressTime">
      <ul class="infoList">
        <li><span class="text-center" id="address">Address: </span><span>${marketObject.Address}</span></li>
        <li id="scheduleStyle"><span class="text-center" id="schedule">Schedule: </span><span>${marketObject.Schedule}</span></li>
        <li><span class="text-center" id="products">Products: </span><span>${marketObject.Products}</span></li>
      </ul>
     </div>
  
    
    <div class="amenitiesContainer">
    <ul id="amentities">
    <li>${marketObject.outdoors} <input type="text" class="input-val" id=outdoors name="input"><button class=input-submit data-name="outdoors" data-id="${marketObject.usda_id}" type="submit">Submit</button></li> 
    <li>${marketObject.restroom} <input type="text" class="input-val" id=restroom name="input"><button class=input-submit data-name="restromm" data-id="${marketObject.usda_id}" type="submit">Submit</button></li>
    <li>${marketObject.petFriendly} <input type="text" class="input-val" id=petFriendly name="input"><button class=input-submit data-name="petFriendly" data-id="${marketObject.usda_id}" type="submit">Submit</button></li>
    <li>${marketObject.alcohol} <input type="text" class="input-val" id=alcohol name="input"><button class=input-submit data-name="alcohol" data-id="${marketObject.usda_id}" type="submit">Submit</button></li>
    </ul>
    </div>
    <iframe src="${marketObject.GoogleLink}" width="600" height="450" frameborder="0" style="border:0" allowfullscreen></iframe>

    </div>
    </div>
  `;
   // <iframe src="${marketObject.GoogleLink}" width="600" height="450" frameborder="0" style="border:0" allowfullscreen></iframe>
   //  </div>
    $('#dataContainer').append(marketContent);
  }
  /* --------------------------------------------------------- Event delegation for market button links */
  $(document).on('click', '.list-group-item', function(event) {
    event.preventDefault()
    let clickedButtonMarketId = $(this).attr('data-marketid');
    console.log(clickedButtonMarketId)
    $.post(`/api/${clickedButtonMarketId}`)
    
    .done(function(data) {
      console.log('call completed')
      console.log(data)

      $.get(`/api/market-data/${clickedButtonMarketId}`, function (body) {
        marketInfoGenerator(body);
      })
        .fail(function () {
          alert("error");
        });

    })

    .fail(function(err) {
      console.log(err)
    })



  });

  $(document).on('click', '.input-submit ', function (event) {
    // event.preventDefault();
    const userSubmit = $(".input-val").val().trim();
    const userInputParam = $(".input-submit").attr('data-name');
    const marketId = $(".input-submit").attr('data-id');
    userInput(marketId, userInputParam, userSubmit);

    $.get(`/api/market-data/${marketId}`, function (body) {
      marketInfoGenerator(body);
    })
      .fail(function () {
        alert("error");
      });

  });
});
