
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
  var pagination = "&paginationInput.pageNumber="
  var pageNum = 1;
  var urlFilter = "&itemFilter(0).name=SoldItemsOnly&itemFilter(0).value=true&itemFilter(1).name=LocatedIn&itemFilter(1).value=US";
  var url = baseURL + operationName + serviceVersion + myKey + responseFormat + keywordQuery + catQuery + pagination + pageNum + urlFilter;

  $.ajax({
    type: "GET",
    url: url,
    dataType: "jsonp",
    callback: "callbackname"
  }).done(function(response) {
    console.log("done");
    console.log(response);

    var preResults = response.findCompletedItemsResponse[0].searchResult[0].item;

    //Clear the default content box
    var defaultContent = document.getElementById("default-content");
    defaultContent.innerHTML = "Getting results...just a moment...";
    document.getElementById("content").style.display = "none";

    //If there are no results, ask the user to try again.
    if (preResults === undefined) {
      defaultContent.innerHTML = "<h1>No results found. Try searching for something else.</h1>";
      document.getElementById("content").style.display = "none";
      return false;
    }

    //First set of results
    var results = [];
    for (i = 0; i < preResults.length; i++) {
      results.push(preResults[i]);
    }

    //If there are additional results, add to the results array up to 1000 results

    var addMoreResults = function(data) {
      for (i = 2; i <= 10; i++) {
        pageNum++;
        url = baseURL + operationName + serviceVersion + myKey + responseFormat + keywordQuery + catQuery + pagination + pageNum + urlFilter;
        var count = 100;

        $.ajax({
          type: "GET",
          url: url,
          dataType: "jsonp",
          callback: "callbackname"
        }).done(function(response2) {
          console.log("done2");

          var currentResults = response2.findCompletedItemsResponse[0].searchResult[0].item;
          for (j = 0; j < currentResults.length; j++) {
            results.push(currentResults[j]);
          }

          if (currentResults.length < 100 || i === 10) {

            return false;

          }

        }).fail(function(reponse2) {
          console.log("fail2");
        })
      }
    }


        addMoreResults(results);

        setTimeout(function() {
        defaultContent.innerHTML = "";

        document.getElementById("content").style.display = "block";

        //List search information
        var searchInfoDiv = document.getElementById("search-info");
        var searchInfoP = document.getElementById("search-info-p");
        var selectedAttName = catSelection[catSelection.selectedIndex].getAttribute("name");
        searchInfoP.innerHTML = "You searched for <b>" + keywords + "</b> in <b>" + selectedAttName + "</b>.";
        var statementP = document.getElementById("search-info-statement");
        statementP.innerText = "Let's look at some data.";

        var itemLocationData = grabLocData(results);
        drawMarkersMap(itemLocationData);




        //Builds an array of prices
        var pricesArray = [];
        for (var i = 0; i < results.length; i++) {
          pricesArray.push(parseFloat(results[i].sellingStatus[0].currentPrice[0].__value__));
        }
        var averagePrice = avg(pricesArray);
        displayAvgPrice(avg(pricesArray));

        var itemPriceData = grabPriceData(results, averagePrice);
        drawChart(itemPriceData);

        var typeData = grabTypeData(results);
        pieChart(typeData);

        console.log("results", results);
        filterTest(results);
      }, 5000);

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

  //Create an array from the object (Google format)
  var locationArray = [['State', 'Listings']];
  for (var loc in locationData) {
    var tempArray = [];
    tempArray.push(loc);
    tempArray.push(locationData[loc]);
    locationArray.push(tempArray);
  }
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

//Builds the price data array for Google Column Chart
var grabPriceData = function(data, avg) {
  var priceArray = [
    ["Stat", "Price", { role: "style" }, { role: 'annotation' } ],
    ["Minimum Price", 0, "#f4ae01", 0],
    ["Average Price", 0, "#85b716", 0],
    ["Highest Price", 0, "#0063d1", 0]
  ];
  var minPrice = 0;
  var maxPrice = 0;
  minPrice = parseFloat(data[0].sellingStatus[0].currentPrice[0].__value__);
  maxPrice = parseFloat(data[0].sellingStatus[0].currentPrice[0].__value__);
  for (i = 0; i < data.length; i++) {
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

  return priceArray;
}

//Builds the "listing-type" array for the Google Pie Chart
var grabTypeData = function(data) {
  //Base Array
  var typeArray = [
    ['Listing Type', 'Listings'],
    ['Auction',     0],
    ['Fixed Price',      0],
    ['Store Inventory',  0]
  ];
  //Build an object to store data temporarily
  var typeObj = {};
  for (var i = 0; i < data.length; i++) {
    var typeData = data[i].listingInfo[0].listingType[0];
    if (!typeObj[typeData]) {
    typeObj[typeData] = 0;
    }
    typeObj[typeData] += 1;
  }

  typeArray[1][1] = typeObj["Auction"];
  typeArray[2][1] = typeObj["FixedPrice"];
  typeArray[3][1] = typeObj["StoreInventory"];

  return typeArray;
}


//Built a function to test if my filters are working correctly
var filterTest = function(results) {

  //Check if all items are SoldItemsOnly = true
  var soldTest = function() {
    for (i = 0; i < results.length; i++) {
      if (results[i].sellingStatus[0].sellingState[0] !== "EndedWithSales") {
        return false;
      }
    }
    return true;
  }
  if (soldTest()) {
    console.log("SoldItemsOnly = true!");
  } else {
    console.log("ERROR: SoldItemsOnly = false!");
  }

  //Check if all items are LocatedIn = US
  var locationTest = function() {
    for (i = 0; i < results.length; i++) {
      if (results[i].country[0] !== "US") {
        return false;
      }
    }
    return true;
  }
  if (locationTest()) {
    console.log("LocatedIn = US!");
  } else {
    console.log("ERROR: LocatedIn != US!");
  }

  //Check if any of the items are repeating (have the same item ID)
  var duplicateTest = function() {
    var dupCount = 0;
    var dupObj = {};
    for (i = 0; i < results.length; i++) {
      if (dupObj[results[i].itemId[0]] === undefined) {
      dupObj[results[i].itemId[0]] = 1;
      } else {
        dupCount++
      }
    }
    console.log("dupCount: ", dupCount);
    return dupCount;
  }
  if (duplicateTest() <= 5) {
    console.log("All ok! 5 or less duplicates found!");
  } else {
    console.log("ERROR: Too many duplicate items!");
  }

}

//Remove duplicate items - unable to get this working before deadline
// var removeDuplicates = function(results) {
//   var dupsRemoved = 0;
//   var dupObj = {};
//   for (i = 0; i < results.length; i++) {
//     if (dupObj[results[i].itemId[0]] !== 1) {
//       dupObj[results[i].itemId[0]] = 1;
//     } else {
//       dupsRemoved++;
//       delete results[i];
//       i++
//     }
//     console.log("dupObj: ", dupObj);
//   };
//   console.log("dupsRemoved: ", dupsRemoved);
// }
