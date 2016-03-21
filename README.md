# Project Two: eBay Lookup

Using eBay's API's, I was able to build a site that can be used to look up detailed information of eBay's listings. The site takes the thousand most recent results for that specific keyword in a selected category that ended in a completed sale.

## API's used
  - eBay Shopping API
  - eBay Finding API
  - Google Chart API

## Technologies used
  - HTML5
  - CSS3
  - JavaScript
  - jQuery
  - HandlebarsJS

### Overview

Currently, the site is able to provide:
  - A Geochart of the item locations
  - A chart detailing the lowest, highest, and average prices for that item
  - A pie chart showing the breakdown between listing types: auction, fixed price, and store inventory

### Struggles

The biggest hurdle was simply getting the API to function through an AJAX call. eBay's documentation seems to be more focused towards the XML format.

I also had trouble getting more than 100 results. eBay enforces a results limit of 100, with a page limit of 100 as well. To increase my results from 100 to 1000, I had to run multiple AJAX calls to grab more data. Unfortunately, because the entire process was too slow, I had to implement a 5 second delay for the functions that displayed the various charts. The next step would be to figure out a way around this obstacle, as well as providing a better analysis of the data.
