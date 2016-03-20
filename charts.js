//Base code taken from Google and edited to
google.charts.load('current', {'packages': ['geochart', 'corechart', 'bar']});

      function drawMarkersMap(array) {
      var data = google.visualization.arrayToDataTable(array);

      var options = {
        region: 'US',
        resolution: 'provinces'
      };

      document.getElementById("map-h3").style.display = "block";
      var chart = new google.visualization.GeoChart(document.getElementById('region-map'));
      chart.draw(data, options);
    };

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
