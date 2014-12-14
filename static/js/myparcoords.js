// quantitative color scale
var blue_to_brown = d3.scale.linear()
  .domain([9, 50])
  .range(["steelblue", "brown"])
  .interpolate(d3.interpolateLab);
var color = function(d) { return blue_to_brown(d['economy (mpg)']); };
var parcoords = d3.parcoords()("#parcoord")
  .color(color)
  .alpha(0.4);

// load csv file and create the chart
d3.csv('static/data/doodle_data_v2.csv', function(data) {
  parcoords
    .data(data)
    .render()
    .brushMode("1D-axes")  // enable brushing
    .reorderable(); // enable reordering
  

  // slickgrid needs each data element to have an id
  data.forEach(function(d,i) { d.id = d.id || i; });

  // setting up grid
  var column_keys = d3.keys(data[0]);
  var columns = column_keys.map(function(key,i) {
    return {
      id: key,
      name: key,
      field: key,
      sortable: true
    }
  });

  var options = {
    enableCellNavigation: true,
    enableColumnReorder: false,
    multiColumnSort: false
  };

  var dataView = new Slick.Data.DataView();
  var grid = new Slick.Grid("#grid", dataView, columns, options);
  var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));

  // wire up model events to drive the grid
  dataView.onRowCountChanged.subscribe(function (e, args) {
    grid.updateRowCount();
    grid.render();
  });
  dataView.onRowsChanged.subscribe(function (e, args) {
    grid.invalidateRows(args.rows);
    grid.render();
  });
  // column sorting
  var sortcol = column_keys[0];
  var sortdir = 1;
  function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
  }
  
  // click header to sort grid column
  grid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;
    if ($.browser.msie && $.browser.version <= 8) {
      dataView.fastSort(sortcol, args.sortAsc);
    } else {
      dataView.sort(comparer, args.sortAsc);
    }
  });
  // highlight row in chart
  grid.onMouseEnter.subscribe(function(e,args) {
    var i = grid.getCellFromEvent(e).row;
    var d = parcoords.brushed() || data;
    parcoords.highlight([d[i]]);
  });
  grid.onMouseLeave.subscribe(function(e,args) {
    parcoords.unhighlight();
  });
  // fill grid with data
  gridUpdate(data);
  // update grid on brush
  parcoords.on("brush", function(d) {
    gridUpdate(d);
  });
  function gridUpdate(data) {
    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.endUpdate();
  };
  
  /* The following are using example from
   * https://github.com/syntagmatic/parallel-coordinates/blob/master/examples/table.html
  
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

*/
}); // End of csv reading