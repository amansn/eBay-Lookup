google.charts.load('current', {packages: ['geochart']});

function drawRegionsMap(array) {

        var data = google.visualization.arrayToDataTable(array);

        var options = {};
        options['dataMode'] = 'markers';

        var chart = new google.visualization.GeoChart(document.getElementById('region-map'));

        chart.draw(data, options);
      }
