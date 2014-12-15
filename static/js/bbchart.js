
d3.csv('static/data/doodle_data_v2.csv', function(data) {

  // TODO: process the data as an array of grouped key-value dictionary
  // Each group(continent) is a key
  console.log(data);
  var chartData = [ {'key':"North America", 'values':[]},
                    {'key':"Australia", 'values':[]},
                    {'key':"Europe", 'values':[]},
                    {'key':"Asia", 'values':[]}
                  ];
  data.filter(function(row){
    return row['OverallPaceMeans'];
  });

  $.each(data, function(idx,obj){
    d = {shape: "circle",
            size: parseInt(obj['fraction_consensus_polls_open']),
            x: parseInt(obj['IDV']),
            y: parseInt(obj['OverallPaceMeans'])}
    if (obj['continent'] == "North America"){
      chartData[0]["values"].push(d);
    }
    else if (obj['continent'] == "Australia"){
      chartData[1]["values"].push(d);
    }
    else if (obj['continent'] == "Europe"){
      chartData[2]["values"].push(d);
    }
    else if (obj['continent'] == "Asia"){
      chartData[3]["values"].push(d);
    }
  })

  console.log(chartData);

  nv.addGraph(function() {
    var chart = nv.models.scatterChart()
                  .showDistX(true)    
                  //showDist, when true, will display those little distribution lines on the axis.
                  .showDistY(true)
                  .transitionDuration(350)
                  .color(d3.scale.category10().range());

    //Configure how the tooltip looks.
    chart.tooltipContent(function(key) {
        return '<h3>' + key + '</h3>';
    });

    //Axis settings
    chart.xAxis.tickFormat(d3.format('.02f'));
    chart.yAxis.tickFormat(d3.format('.02f'));

    //We want to show shapes other than circles.
    chart.scatter.onlyCircles(false);

    var chartData = randomData(4,20);

      d3.select('#chart svg')
          .datum(chartData)
          .transition().duration(500)
          .call(chart);




    nv.utils.windowResize(chart.update);

    return chart;
  });

}); //End of d3.csv
/**************************************
 * Simple test data generator
 */
function randomData(groups, points) { //# groups,# points per group
  var data = [],
      shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
      random = d3.random.normal();

  for (i = 0; i < groups; i++) {
    data.push({
      key: 'Group ' + i,
      values: []
    });

    for (j = 0; j < points; j++) {
      data[i].values.push({
        x: random()
      , y: random()
      , size: Math.random()   //Configure the size of each scatter point
      , shape: (Math.random() > 0.95) ? shapes[j % 6] : "circle"  //Configure the shape of each scatter point.
      });
    }
  }

  return data;
}

d = randomData(4,40);
console.log(d);