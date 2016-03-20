
  //Build out the dropdown using the eBay Shopping API
  $.ajax({
    type: "GET",
    url: "http://open.api.ebay.com/Shopping?callname=GetCategoryInfo&appid=AmanNagp-ProjectT-PRD-738c4f481-839865d6&CategoryID=-1&version=729&IncludeSelector=ChildCategories&responseencoding=JSON",
    dataType: "jsonp",
    jsonp: "callbackname"
  }).done(function(response) {
    console.log("done");
    console.log(response);
    console.log("response.CategoryArray is: ", response.CategoryArray);
    console.log("response.CategoryArray.Category is: ", response.CategoryArray.Category);

    //Need to remove 'root' category from categories object
    var cats = {};
    var catsArray = response.CategoryArray.Category;
    catsArray.shift();
    cats.Category = catsArray;
    console.log(cats);

    //Handlebars for the categories dropdown
    var dropSource = document.getElementById("dropdown-template").innerHTML;
    var dropTemplate = Handlebars.compile(dropSource);
    var compiledDropHtml = dropTemplate(cats);
    var dropContainer = document.getElementById("drop-container");
    dropContainer.innerHTML = compiledDropHtml;


  }).fail(function(response) {
    console.log("fail");
    console.log(arguments);
  })


//eBay Finding API call
var baseURL = "http://svcs.ebay.com/services/search/FindingService/v1";
var operationName = "?OPERATION-NAME=findCompletedItems";
var serviceVersion = "&SERVICE-VERSION=1.0.0";
var myKey = "&SECURITY-APPNAME=" + APP_KEY;
var globalID = "&GLOBAL-ID=EBAY-US";
var responseFormat = "&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD";


var searchButton = document.getElementById("search_btn");
searchButton.addEventListener("click", function() {

  var inputBox = document.getElementById("item_lookup_input");
  var keywords = inputBox.value;
  var keywordQuery = "&keywords=" + keywords;
  var catSelection = document.getElementById("dropdown");
  var catValue = catSelection.value;
  var catQuery = "&categoryId=" + catValue;
  var url = baseURL + operationName + serviceVersion + myKey + responseFormat + keywordQuery + catQuery + "&itemFilter(0).paramName=Currency&itemFilter(0).paramValue=USD&itemFilter(1).name=SoldItemsOnly&itemFilter(1).value=true";

  $.ajax({
    type: "GET",
    url: url,
    dataType: "jsonp",
    callback: "callbackname"
  }).done(function(response) {
    console.log("done");
    console.log(response);
    console.log(url);

    var results = response.findCompletedItemsResponse[0].searchResult[0].item;

    //List search information
    var searchInfoDiv = document.getElementById("search-info");
    var searchInfoP = document.getElementById("search-info-p");
    var selectedAttName = catSelection[catSelection.selectedIndex].getAttribute("name");
    searchInfoP.innerHTML = "You searched for <b>" + keywords + "</b> in <b>" + selectedAttName + "</b>.";
    var statementP = document.getElementById("search-info-statement");
    statementP.innerText = "Let's look at some data.";

    var itemLocationData = grabLocData(results);
    console.log(itemLocationData);
    drawMarkersMap(itemLocationData);

    //Builds an array of prices
    var pricesArray = [];
    for (var i = 0; i < results.length; i++) {
      pricesArray.push(parseFloat(results[i].sellingStatus[0].currentPrice[0].__value__));
    }
    console.log(pricesArray);
    var averagePrice = avg(pricesArray);
    console.log("The average price is: ", averagePrice);
    displayAvgPrice(avg(pricesArray));

    var itemPriceData = grabPriceData(results, averagePrice);
    drawChart(itemPriceData);


  }).fail(function(response) {

    console.log("fail");
  })


})

//Builds the location data array for Google GeoChart
var grabLocData = function(data) {
  var locationData = {};
  for (var i = 0; i < data.length; i++) {
    var stateData = data[i].location[0].split(",");
    var currentLoc = "US-" + stateData[1];
    if (!locationData[currentLoc]) {
      locationData[currentLoc] = 0;
    }
    locationData[currentLoc] += 1;
    if (locationData["US-undefined"]) {
      delete locationData["US-undefined"];
    }
  }
  console.log("locationData is ", locationData);
  console.log(locationData[0]);
  //Create an array from the object (Google format)
  var locationArray = [['State', 'Listings']];
  for (var loc in locationData) {
    var tempArray = [];
    tempArray.push(loc);
    tempArray.push(locationData[loc]);
    locationArray.push(tempArray);
  }
  console.log();
  return locationArray;
}


//Gets the average of an array of numbers
var avg = function(array) {
  var sum = 0;
  for (var i = 0; i < array.length; i++) {
    sum += array[i];
  }
  var avg = (sum / array.length).toFixed(2);
  return avg;
}

//Displays the average price
var displayAvgPrice = function(average) {
  document.getElementById("price-span").innerHTML = "$" + average;
  document.getElementById("price-h3").style.display = "block";
}

var grabPriceData = function(data, avg) {
  var priceArray = [
    ["Stat", "Price", { role: "style" }, { role: 'annotation' } ],
    ["Minimum Price", 0, "#f4ae01", 0],
    ["Average Price", 0, "#85b716", 0],
    ["Highest Price", 0, "#0063d1", 0]
  ];
  var minPrice = 0;
  var maxPrice = 0;
  minPrice = data[0].sellingStatus[0].currentPrice[0].__value__;
  maxPrice = data[0].sellingStatus[0].currentPrice[0].__value__;
  for (i = 0; i < data.length; i++) {
    console.log(data[i].sellingStatus[0].currentPrice[0].__value__);
    if (parseFloat(data[i].sellingStatus[0].currentPrice[0].__value__) < minPrice) {
      minPrice = parseFloat(data[i].sellingStatus[0].currentPrice[0].__value__);
    }
    if (parseFloat(data[i].sellingStatus[0].currentPrice[0].__value__) > maxPrice) {
      maxPrice = parseFloat(data[i].sellingStatus[0].currentPrice[0].__value__);
    }
  }
  priceArray[1][1] = minPrice;
  priceArray[1][3] = "$" + minPrice;
  priceArray[3][1] = maxPrice;
  priceArray[3][3] = "$" + maxPrice;

  priceArray[2][1] = avg;
  priceArray[2][3] = "$" + avg;

  console.log("priceArray: ", priceArray);
  return priceArray;
}
