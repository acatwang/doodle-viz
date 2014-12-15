d3.csv('static/data/doodle_data_v2.csv', function(data) {


    var chartData = [ {'name':"North America", data:[]}, // 'name':"North America", 
                        {'name':"South America", data:[]}, //'name':"Australia",
                        {'name':"Europe", data:[]}, //'key':"Europe",
                        {'name':"Asia", data:[]} //:"Asia", 
                    ];

   //variable: pace of life demical 

    //var chartData = [{'data':}]
    //Filter out the row has valid 

    data = data.filter(function(row){
        return row['OverallPaceMeans'];
    });


    $.each(data, function(idx,obj){
    d = {'shape': "circle",
            'z': parseFloat(obj['fraction_consensus_polls_open']),
            'x': parseFloat(obj['IDV']),
            'y': parseFloat(obj['OverallPaceMeans']),
            'country':obj['country']};
    if (parseInt(obj['OverallPaceMeans']) != NaN){
        // d = [parseFloat(obj['IDV']), 
        //      parseFloat(obj['OverallPaceMeans']), 
        //      parseFloat(obj['fraction_consensus_polls_open']),
        //      obj['country']]
        if (obj['continent'] == "North America"){
          chartData[0].data.push(d);

        }
        else if (obj['continent'] == "South America"){
          chartData[1].data.push(d);
        }
        else if (obj['continent'] == "Europe"){
          chartData[2].data.push(d);
        }
        else if (obj['continent'] == "Asia"){
          chartData[3].data.push(d);
        }
        }
    })

    console.log(chartData);
    console.log(d);

    var legend = "Collectivism";
    $(function () {
        $('#chart').highcharts({

            chart: {
                type: 'bubble',
                zoomType: 'xy',
                marginRight: 35
            },

            title: {
                text: 'YO'
            },

            xAxis: {
            min:10,
            max:100,
            title: {
                
                text: legend.concat(Array(100).join('\u00a0'),'Individualism')
                //align: 'center'
            }
        },
            yAxis: {
            lineWidth: 1,
            tickWidth: 1,
            max: 5,
            title: {
                //align: 'high',
                //offset: 0,
                text: 'Overall Pace of Life',
                //rotation: 0,
                y: -10
            }
        },
            // tooltip: {
            //      pointFormat: "Value: {point.y:.2f}"
            // },

            tooltip: {
            formatter: function () {
                console.log(this.point);

                return this.series.name + '(' + this.point.country+ ') <br>' + 'the IDV score is <b>' + this.x +
                    '</b> <br>the pace of life score is <b>' + this.y + '</b>';
                 }   
            },

            //x-axis title 
            //label the size of the bubble

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