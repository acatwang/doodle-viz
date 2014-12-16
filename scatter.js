var width = 1000,
    size = 140,
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
  .domain([-1,0,1])
  .range(["blue","white", "red"]);

function filterByParCoords(parData){

    parFilterCircles = document.getElementsByTagName('circle');
    //console.log(parFilterCircles);

    for (var par in parFilterCircles){
        parFilterCircles[par].setAttribute('class','');
        innerContent = parFilterCircles[par].textContent || parFilterCircles[par].innerText;
        if (parData.indexOf(innerContent) == -1){
          parFilterCircles[par].setAttribute('class','hidden');
      }
    }
  }


function getCorrelation(var1, var2){

  // gets variables for correlation
  var corrString = var1.concat(var2);

  if (var1.indexOf(var2) != -1) return 1
  else {

    if (corrString.indexOf('numberOfPolls+C1') != -1 && corrString.indexOf('GDP') != -1) {
      return 0.4448433;
    }
    else if (corrString.indexOf('numberOfPolls+C1') != -1 && corrString.indexOf('PDI') != -1){
      return -0.2261446;
    }
    else if (corrString.indexOf('numberOfPolls+C1') != -1 && corrString.indexOf('IDV') != -1) {
      return 0.3449168;
    }
    else if (corrString.indexOf('numberOfPolls+C1') != -1 && corrString.indexOf('OverallPaceMeans') != -1) {
      return -0.2623105;
    }
    else if (corrString.indexOf('GDP') != -1 && corrString.indexOf('PDI') != -1) {
      return -0.4465107;
    }
    else if (corrString.indexOf('GDP') != -1 && corrString.indexOf('IDV') != -1) {
      return 0.3213045;
    }
    else if (corrString.indexOf('GDP') != -1 && corrString.indexOf('OverallPaceMeans') != -1) {
      return -0.5875585;
    }
    else if (corrString.indexOf('PDI') != -1 && corrString.indexOf('IDV') != -1) {
      return -0.593616;
    }
    else if (corrString.indexOf('PDI') != -1 && corrString.indexOf('OverallPaceMeans') != -1) {
      return 0.6111763;
    }
    else if (corrString.indexOf('IDV') != -1 && corrString.indexOf('OverallPaceMeans') != -1) {
      return -0.4305057;
    }
      
  }

}


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

    function check(d) {

            switch((n - d.i - 1)){
              case 4:
                if (d.j < 1)
                return 1;
                break;
              case 3:
                if (d.j < 2)
                return 1;  
                  break;
              case 2:
                if (d.j < 3)
                return 1;    
                  break;
              case 1:
                if (d.j != 4)
                return 1;    
                  break;
              case 0:
                  return 1;
                  break;
              default:
                  return 0;
                  break;
            }
    }

    cell.append("rect")
        .attr("class", function(d) {
          //Only adds frame for left half of matrix
            if (check(d)) return "frame";
          })
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("fill", function(d){return blue2red(getCorrelation(d.x, d.y));})
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 4)
        .style("fill", function(d) { 
          return colorGrid(d.continent); 
        })
        .text(function(d) {return d["country"];});

  }

  

  var brushCell;

  // Clear the previously-active brush
  function brushstart(p) {
    // - -- - ------- UPDATE PARCOORD DATA HERE --- ----- ------
    // Draw a new ParCoord when the brush reset
    console.log("clear brush, draw a new PC");
    drawParCoords();
//    parcoords.brushReset();

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
    var brushedCountries = [];
    svg.selectAll("circle").classed("hidden", function(d) {

      if (!(e[0][0] > d[p.x] || d[p.x] > e[1][0] || e[0][1] > d[p.y] || d[p.y] > e[1][1])){
        if (brushedCountries.indexOf(d["country"]) == -1) {
          brushedCountries.push(d["country"]);
        }
      }
      else return 1;
    });
    //console.log(brushedCountries);

    // - -- - ------- UPDATE PARCOORD DATA HERE --- ----- ------
    updateParCoords(brushedCountries); 
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

});
