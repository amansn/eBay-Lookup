//Base code taken from Google and edited to
google.charts.load('current', {'packages': ['geochart', 'corechart', 'bar']});

//Item by location Geochart
function drawMarkersMap(array) {
  var data = google.visualization.arrayToDataTable(array);

  var options = {
    region: 'US',
    resolution: 'provinces',
    colorAxis: {colors: ['#e7e7e7', '#0063d1']}
  };

  document.getElementById("map-h3").style.display = "block";
  var chart = new google.visualization.GeoChart(document.getElementById('region-map'));
  chart.draw(data, options);
};

//Price column chart
function drawChart(array) {
  var data = google.visualization.arrayToDataTable(array);

  var view = new google.visualization.DataView(data);


  var options = {
    title: "Price Statistics",
    height: 300,
    bar: {groupWidth: "90%"},
    legend: {position: "none"},
    vAxis: {format: 'currency'},
    chartArea: {width: '70%'},
  };
  var chart = new google.visualization.ColumnChart(document.getElementById("price-chart"));
  chart.draw(view, options);
}


//Pie chart for listing type
function pieChart(array) {

  var data = google.visualization.arrayToDataTable(array);

  var options = {
    slices: {
            0: { color: '#0063d1' },
            1: { color: '#e43137' },
            2: { color: '#85b716' }
          }
  };

  document.getElementById("pie-h3").style.display = "block";
  var chart = new google.visualization.PieChart(document.getElementById('pie-chart'));

  chart.draw(data, options);
}
