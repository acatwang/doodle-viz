var width = 700,
    size = 100,
    padding = 19.5;

var x = d3.scale.linear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scale.linear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(5);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

var colorGrid = d3.scale.category10();

var blue2red = d3.scale.linear()
  .domain([0,602419])
  .range(["blue","red"])

var colorCorr = function(d) { return blue2red(d['GDP']); };
/*
var blue_to_brown = d3.scale.linear()
  .domain([9, 50])
  .range(["steelblue", "brown"])
  .interpolate(d3.interpolateLab);

var color = function(d) { return blue_to_brown(d['country']); };

var parcoords = d3.parcoords()("#parcoord")
  .color(color)
  .alpha(0.4);*/


d3.csv("static/data/doodle_data_v2.csv", function(error, data) {
  var domainByTrait = {},
      traits = d3.keys(data[0]).filter(function(d) { return d !== "continent" && d !== "country"; }),
      traits = traits.slice(0,5)
      n = traits.length;


  traits.forEach(function(trait) {
    domainByTrait[trait] = d3.extent(data, function(d) { return +d[trait]; });
  });

  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);

  var brush = d3.svg.brush()
      .x(x)
      .y(y)
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend);

  //var svg = d3.select("body").append("svg")
  var svg = d3.select("#scatterplots").append("svg")
      .attr("width", size * n + padding)
      .attr("height", size * n + padding)
    .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

  svg.selectAll(".x.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

  svg.selectAll(".y.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

  cell.call(brush);

  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", function(d) {
          
          //Only adds frame for left half of matrix

            switch((n - d.i - 1)){
              case 4:
                if (d.j < 1)
                return "frame";
                break;
              case 3:
                if (d.j < 2)
                return "frame";  
                  break;
              case 2:
                if (d.j < 3)
                return "frame";    
                  break;
              case 1:
                if (d.j != 4)
                return "frame";    
                  break;
              case 0:
                  return "frame";
                  break;
            }

          })
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("fill", function(d){

          //adds fill for correlation 
          return colorCorr;
        })
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 4)
        .attr("dataCountry", function(d) {return d["country"];})
        .style("fill", function(d) { return colorGrid(d.continent); })
        .text(function(d) {return d["country"];});
  }

  var brushCell;

  // Clear the previously-active brush
  function brushstart(p) {
    if (brushCell !== this) {
      d3.select(brushCell).call(brush.clear());
      x.domain(domainByTrait[p.x]);
      y.domain(domainByTrait[p.y]);
//    console.log(domainByTrait);
      brushCell = this;
    }
  }

  // Highlight the selected circles.
  function brushmove(p) {
    var e = brush.extent();
    var countries = [];
    svg.selectAll("circle").classed("hidden", function(d) {

      if (e[0][0] > d[p.x] || d[p.x] > e[1][0] || e[0][1] > d[p.y] || d[p.y] > e[1][1]){
        if (countries.indexOf(d["country"]) == -1) countries.push(d["country"]);
        return 1;
      }
    });
    console.log(countries);

    // - -- - ------- UPDATE PARCOORD DATA HERE --- ----- ------
    updateParCoords(countries); 
    //parcoords.data(countries); 


  }

  // If the brush is empty, select all circles.
  function brushend() {
    if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
  }

  function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
  }

  d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");

/*
  //starts
  // quantitative color scale
  parcoords
    .data(data)
    .render()
    .brushMode("1D-axes")  // enable brushing
    .reorderable(); // enable reordering
  
  // create data table, row hover highlighting
  var grid = d3.divgrid();
  d3.select("#grid")
    .datum(data.slice(0,10))
    .call(grid)
    .selectAll(".row")
    .on({
      "mouseover": function(d) { parcoords.highlight([d]) },
      "mouseout": parcoords.unhighlight
    });
  
  // update data table on brush event
  parcoords.on("brush", function(d) {
    d3.select("#grid")
      .datum(d.slice(0,10))
      .call(grid)
      .selectAll(".row")
      .on({
        "mouseover": function(d) { parcoords.highlight([d]) },
        "mouseout": parcoords.unhighlight
      });
  });
  //ends*/

});
