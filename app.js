
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
  var url = baseURL + operationName + serviceVersion + myKey + responseFormat + keywordQuery + catQuery;

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
    //Builds an array of prices
    var pricesArray = [];
    for (var i = 0; i < results.length; i++) {
      pricesArray.push(parseFloat(results[i].sellingStatus[0].currentPrice[0].__value__));
    }
    console.log(pricesArray);
    var averagePrice = avg(pricesArray);
    console.log("The average price is: ", averagePrice);

    //List search information
    var searchInfoDiv = document.getElementById("search-info");
    var searchInfoP = document.getElementById("search-info-p");
    var selectedAttName = catSelection[catSelection.selectedIndex].getAttribute("name");
    searchInfoP.innerHTML = "You searched for <b>" + keywords + "</b> in <b>" + selectedAttName + "</b>.";
    var statementP = document.getElementById("search-info-statment");
    statementP.innerText = "Let's crunch some numbers...";

    var itemLocationData = grabLocData(results);
    console.log(itemLocationData);
    drawRegionsMap(itemLocationData);

  }).fail(function(response) {

    console.log("fail");
  })


})

//Gets the average of an array of numbers
var avg = function(array) {
  var sum = 0;
  for (var i = 0; i < array.length; i++) {
    sum += array[i];
  }
  var avg = (sum / array.length).toFixed(2);
  return avg;
}

//Builds the location data array for Google GeoChart
var grabLocData = function(data) {
  var locationData = {};
  for (var i = 0; i < data.length; i++) {
    var currentCountry = data[i].country[0];
    if (!locationData[currentCountry]) {
      locationData[currentCountry] = 0;
    }
    locationData[currentCountry] += 1;
  }
  console.log(locationData);
  console.log(locationData[0]);
  //Create an array from the object (Google format)
  var locationArray = [['Country', 'Popularity']];
  for (var loc in locationData) {
    var tempArray = [];
    tempArray.push(loc);
    tempArray.push(locationData[loc]);
    locationArray.push(tempArray);
  }
  return locationArray;
}
