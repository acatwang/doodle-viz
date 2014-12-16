d3.csv('static/data/doodle_data_v3.csv', function(data) {


    var chartData = [ {'name':"North America", data:[]}, // 'name':"North America", 
                        {'name':"South America", data:[]}, //'name':"Australia",
                        {'name':"Europe", data:[]}, //'key':"Europe",
                        {'name':"Asia", data:[]} //:"Asia", 
                    ];

   //variable: pace of life demical 

    //var chartData = [{'data':}]
    //Filter out the row has valid 

    data = data.filter(function(row){
        return row['Pace of Life'];
    });


    $.each(data, function(idx,obj){
    d = {'shape': "circle",
            'z': parseFloat(obj['Fraction of Consensus']),
            'x': parseFloat(obj['IDV']),
            'y': parseFloat(obj['Pace of Life']),
            'country':obj['Country']};
    if (parseInt(obj['Pace of Life']) != NaN){
        // d = [parseFloat(obj['IDV']), 
        //      parseFloat(obj['OverallPaceMeans']), 
        //      parseFloat(obj['fraction_consensus_polls_open']),
        //      obj['country']]
        if (obj['Continent'] == "North America"){
          chartData[0].data.push(d);

        }
        else if (obj['Continent'] == "South America"){
          chartData[1].data.push(d);
        }
        else if (obj['Continent'] == "Europe"){
          chartData[2].data.push(d);
        }
        else if (obj['Continent'] == "Asia"){
          chartData[3].data.push(d);
        }
        }
    })

    /*console.log(chartData);
    console.log(d);*/
Highcharts.theme = {
   colors: ["#aaeeee", "#ff0066", "#eeaaee",
      "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"]}



    var legend = "Collectivism";
    var pace ='Quick'
    $(function () {
        $('#chart').highcharts({


            chart: {
                type: 'bubble',
                zoomType: 'xy',
                marginRight: 165,
                spacingBottom: 35,
                spacingLeft: 15

            },

            title: {
                text: '<b>Pace of Life Scores in relation to Individualism Scores & Fraction of Consensus</b>',
                style: {
                    fontSize: '14px'
                }
            },
            subtitle:{
                text: 'Larger bubble indicates higher level of consensus'
            },
            xAxis: [{
                min:10,
                max:100,
                title: {  
                    text: legend.concat(Array(100).join('\u00a0'),'Individualism'),
                    x:40
                    //align: 'center'
                }
            },
            { //--- Primary yAxis
               lineWidth:0,
                title: {
                    text: '<b>Hofstede\'s Individualism/Collectivism Dimension</b>'
                }
            }],
           
            yAxis: [{ //--- Secondary yAxis
                lineWidth: 1,
                tickWidth: 1,
                max: 5,
                title: {
                    text: pace.concat(Array(60).join('\u00a0'),'Slow'),
                    align: 'high',
                    //offset:0,
                    y: -10  
                    },
                    // opposite: true
                },    
                { //--- Primary yAxis
                title: {
                    text: '<b>Overall Pace of Life</b>'
                }
    }],
            // tooltip: {
            //      pointFormat: "Value: {point.y:.2f}"
            // },
            legend: {
                title: {
                    text: 'Continent',
                    },
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -10,
                y: 100
        },

            tooltip: {
            formatter: function () {
                //console.log(this.point);

                return '<b>'+this.point.country+'</b> (' + this.series.name+ ') <br>' + 'IDV score is <b>' + this.x +
                    '</b> <br>Pace of Life score is <b>' + this.y + '</b>';
                 }   
            },

            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        //format: '{point.z:,.1f}',
                        //crop: false,
                        //overflow:'none',
                        align:'left',
                        style: {
                            fontSize: '9px',
                            color: '#6d7e8c',
                            textShadow: '0px 0px 0px'
                            },
                        formatter: function(){
                            /*
                                if(this.point.country.length>8) {
                                    console.log(this.point);
                                    this.point.z.attr({x:20})
                                };
                                */
                                return this.point.country + '<br/>' + Math.round(100*this.point.z)/100 ;
                            }
                                          
                            
                    }
                },
                bubble: {
                    minSize:20,
                    maxSize:50
                }
            },

            //x-axis title 
            //TODO: label the size of the bubble


            series: chartData
            /* [{
                data: [[97, -36, 97], [94, 74, 60], [68, 76, 58], [64, 87, 56], [68, 27, 73], [74, 99, 42], [7, 93, 87], [51, 69, 40], [38, 23, 33], [57, 86, 31]]
            }, {
                data: [[25, 10, 87], [2, 75, 59], [11, 54, 8], [86, 55, 93], [5, 3, 58], [90, 63, 44], [91, 33, 17], [97, 3, 56], [15, 67, 48], [54, 25, 81]]
            }, {
                data: [[47, 47, 21], [20, 12, 4], [6, 76, 91], [38, 30, 60], [57, 98, 64], [61, 17, 80], [83, 60, 13], [67, 78, 75], [64, 12, 10], [30, 77, 82]]
            }]*/
        });
    });
})