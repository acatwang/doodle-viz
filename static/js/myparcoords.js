// TODO: quantitative color scale for continents
var blue_to_brown = d3.scale.linear()
  .domain([9, 50])
  .range(["steelblue", "brown"])
  .interpolate(d3.interpolateLab);
var color = function(d) { return blue_to_brown(1); };


var parcoords = d3.parcoords()("#parcoord")
  .color(color)
  .alpha(0.4);

drawParCoords();

function drawParCoords(scatterplot_select){
  console.log(scatterplot_select);
  console.log(typeof(scatterplot_select)=='undefined');
  d3.csv('static/data/doodle_data_v2.csv', function(data) {
    //console.log(data);
    dataOfInterest =  [];
    data.filter(function(row){
      dataOfInterest.push(_(row).pick('country','IDV','OverallPaceMeans','numberofoptions_mean','planningahead_meanminutes','responsetime_mean','fraction_consensus_polls_open'));  
    })
    console.log(dataOfInterest);
    
     // slickgrid needs each data element to have an id
    data.forEach(function(d,i) { d.id = d.id || i; });
    dataOfInterest.forEach(function(d,i) {d.id = d.id || i; });
    
    // Update parcoord when user select nodes in scatterplot
    if (typeof(scatterplot_select) != 'undefined'){
      if(scatterplot_select.length >0){
        console.log("get countries")
        var idlist_scatterplot = []
        dataOfInterest = dataOfInterest.filter(function(row){
          if (scatterplot_select.indexOf(row.country) > -1){
            idlist_scatterplot.push(row.id);
            return row;
          }
        })
      }
    }

    parcoords
      .data(dataOfInterest)
      .render()
      .brushMode("1D-axes")  // enable brushing
      .reorderable(); // enable reordering
    

   
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
      filterByParCoords([data[i].country]);
    });

    grid.onMouseLeave.subscribe(function(e,args) {
      if (grid.getSelectedRows().length == 0) parcoords.unhighlight();
      
      countrylist = [] ;
      $.each(data, function(i,obj){
        countrylist.push(obj['country']);
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
        countrylist.push(obj['country']);
      })
      console.log(countrylist);
      filterByParCoords(countrylist);

    });


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

/*
// load csv file and create the chart
var colOfInterest = ['OverallPaceMeans','numberofoptions_mean','planningahead_meanminutes','responsetime_mean','fraction_consensus_polls_open'];
d3.csv('static/data/doodle_data_v2.csv', function(data) {
  console.log(data);


  dataOfInterest =  [];
  data.filter(function(row){
    //return row['OverallPaceMeans'];
    //console.log(_(row).pick('OverallPaceMeans','numberofoptions_mean','planningahead_meanminutes','responsetime_mean','fraction_consensus_polls_open'));
    dataOfInterest.push(_(row).pick('country','IDV','OverallPaceMeans','numberofoptions_mean','planningahead_meanminutes','responsetime_mean','fraction_consensus_polls_open'));  
  })
  console.log(dataOfInterest);
  
  // function updateParCoords(countries){
  //   dataOfInterest = $.grep(dataOfInterest, function(e){ return e.country in countries});
  // }; 


  parcoords
    .data(dataOfInterest)
    .render()
    .brushMode("1D-axes")  // enable brushing
    .reorderable(); // enable reordering
  

  // slickgrid needs each data element to have an id
  
  data.forEach(function(d,i) { d.id = d.id || i; });
  dataOfInterest.forEach(function(d,i) {d.id = d.id || i; });
  
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
    filterByParCoords([data[i].country]);
  });

  grid.onMouseLeave.subscribe(function(e,args) {
    if (grid.getSelectedRows().length == 0) parcoords.unhighlight();
    
    countrylist = [] ;
    $.each(data, function(i,obj){
      countrylist.push(obj['country']);
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
      countrylist.push(obj['country']);
    })
    console.log(countrylist);
    filterByParCoords(countrylist);


  });

  function gridUpdate(data) {
    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.endUpdate();
  };

}); // End of csv reading

*/
/*
function updateParCoords(countries){
  parcoords.unhighlight();

  console.log("update parcoord");
  console.log(countries);

  dataOfInterest = [];
  d3.csv('static/data/doodle_data_v2.csv', function(data) {
    data.filter(function(row){
      dataOfInterest.push(_(row).pick('country','IDV','OverallPaceMeans','numberofoptions_mean','planningahead_meanminutes','responsetime_mean','fraction_consensus_polls_open'));  
    })
    
     
    console.log("updated data");
    dataOfInterest.forEach(function(d,i) {d.id = d.id || i; });
    data.forEach(function(d,i) { d.id = d.id || i; });

    console.log(dataOfInterest);
    //console.log($.grep(dataOfInterest, function(e){ return e.country in countries;}));
    dataOfInterest_filtered = dataOfInterest.filter(function(row){
      if (countries.indexOf(row.country) > -1){
        return row;
      }
    })
    console.log(dataOfInterest_filtered);


    var d = parcoords.brushed() || dataOfInterest_filtered;
    console.log(d);
    parcoords.highlight(d);
    

    //update the table
    //Get an array of selected ids
    var idlist = [];
    $.each(d,function(i,obj){
      idlist.push(obj.id);
    })
    gridUpdate($.grep(data, function(e){ return e.id in idlist}));

  })
}; 
*/

function updateParCoords(countries){
  drawParCoords(countries);
}