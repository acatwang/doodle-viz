// TODO: quantitative color scale for continents
var blue_to_brown = d3.scale.linear()
  .domain([9, 50])
  .range(["steelblue", "brown"])
  .interpolate(d3.interpolateLab);
var color = function(d) { return blue_to_brown(1); };


var colorContinent = d3.scale.ordinal()
    .domain(["Asia", "Europe", "South America", "North America", "Africa", "Australia"])
    .range(["rgb(247, 163, 92)", "rgb(144, 237, 125)", "rgb(67, 67, 72)", "rgb(124, 181, 236)", "rgb(181, 100, 71)","rgb(85, 181, 204)"])


var parcoords = d3.parcoords()("#parcoord")
  .alpha(0.4);

drawParCoords();

function drawParCoords(scatterplot_select){
  console.log(scatterplot_select);
  //console.log(typeof(scatterplot_select)=='undefined');
  d3.csv('static/data/doodle_data_v3.csv', function(data) {
    console.log(data);
    dataOfInterest =  [];
    data.filter(function(row){
      dataOfInterest.push(_(row).pick('Country','IDV','Fraction of Consensus', 'Pace of Life', 'Response Time', 'Planning Ahead of Time'));  
    })
    //console.log(dataOfInterest);
    
     // slickgrid needs each data element to have an id
    data.forEach(function(d,i) { d.id = d.id || i; });
    dataOfInterest.forEach(function(d,i) {d.id = d.id || i; });
    
    // Update parcoord when user select nodes in scatterplot
    if (typeof(scatterplot_select) != 'undefined'){
      if(scatterplot_select.length >0){
        console.log("get countries")
        var idlist_scatterplot = []
        dataOfInterest = dataOfInterest.filter(function(row){
          if (scatterplot_select.indexOf(row.Country) > -1){
            idlist_scatterplot.push(row.id);
            return row;
          }
        })
      }
    }

    parcoords
      .data(dataOfInterest)
      .color(function(d) { console.log(d);return colorContinent(data[d.id]['Continent']); })

      .render()
      .reorderable() // enable reordering
      .brushMode("1D-axes");  // enable brushing

   
    // setting up grid
    var column_keys = d3.keys(data[0]);
    var columns = column_keys.map(function(key,i) {
      return {
        id: key,
        name: key,
        field: key,
        sortable: true,
        selectable: true,

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

    grid.setSelectionModel(new Slick.RowSelectionModel());



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

    // highlight row in chart when hover

    grid.onMouseEnter.subscribe(function(e,args) {

      var i = grid.getCellFromEvent(e).row;

      var d = parcoords.brushed() || data;
      if (grid.getSelectedRows().length == 0) parcoords.highlight([d[i]]);
      
      // Send country name to scatterplot
      console.log([data[i].country]);
      filterByParCoords([data[i].Country]);
    });

    grid.onMouseLeave.subscribe(function(e,args) {
      if (grid.getSelectedRows().length == 0) parcoords.unhighlight();
      
      countrylist = [] ;
      $.each(data, function(i,obj){
        countrylist.push(obj['Country']);
      })
      filterByParCoords(countrylist);
    });



    // click to highlight row 
    grid.onClick.subscribe(function(e){
      var cell = grid.getCellFromEvent(e);
        console.log(cell.row);//Here is the row id, I want to change this row background color
        grid.setSelectedRows(cell.row);
    });

    grid.onSelectedRowsChanged.subscribe(function(e){
      console.log("selectedrowchanged");
      selectedrows = grid.getSelectedRows();
      console.log(selectedrows);

      var d = parcoords.brushed() || data;
      console.log(d);
      console.log(d.filter(function(obj){return selectedrows.indexOf(obj.id) > -1}));
      parcoords.highlight(d.filter(function(obj){return selectedrows.indexOf(obj.id) > -1}));

      // countrylist = [];
      // $.each(data, function(i,obj){
      //   if (selectedrows.indexOf(obj.id) > -1){
      //     countrylist.push(obj['country']);
      //   }
      // })
      // console.log("hover countries");
      // console.log(countrylist);
      //filterByParCoords(countrylist);
    });


    // fill grid with data
    gridUpdate(data);
    
    // update grid on brush
    parcoords.on("brush", function(d) {
      parcoords.highlight(d);
      console.log("update grid on brush with this data");
      console.log(d);
      //Get an array of selected ids
      var idlist = [];
      $.each(d,function(i,obj){
        idlist.push(obj.id);
      })

      console.log(idlist);
      console.log($.grep(data, function(e){ return e.id in idlist}));
      gridUpdate($.grep(data, function(e){ return e.id in idlist}));


      // Send data to scatterplots
      countrylist = []
      $.each(d,function(i,obj){
        countrylist.push(obj['Country']);
      })
      console.log(countrylist);
      filterByParCoords(countrylist);

    });

    $('g.dimension').click(function(){
      console.log("click axis");
      parcoords.brushReset();
      parcoords.unhighlight();

    })    
    if (typeof(scatterplot_select) != 'undefined'){
      console.log('update grid');
      gridUpdate($.grep(data, function(e){ return e.id in idlist_scatterplot}));
    }
  
    function gridUpdate(data) {
      dataView.beginUpdate();
      dataView.setItems(data);
      dataView.endUpdate();
    };

  }); // End of csv reading
}


function updateParCoords(countries){
  console.log(countries);
  drawParCoords(countries);
}