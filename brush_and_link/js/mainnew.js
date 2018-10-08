var svg = d3.select('svg');

var svgWidth = +svg.attr('width');
var dataAttributes = ['density_growth','pop_growth','land_growth']
var barAttributes = [['meanDensity2000','meanDensity2010'],['totalPop2000','totalPop2010'],['totalLand2000','totalLand2010']]
var svgHeight = +svg.attr('height');
var histXPos = 250;
var histPosition = { t: 20, r: 20, b: 20, l: 20 };
var histWidth = (svgWidth - histXPos) / 3;
var histHeight = svgHeight - histPosition.t - histPosition.b;
var histXScaleWidth = histWidth - histPosition.r - histPosition.l;
var histYScaleHeight = histHeight - histPosition.b - histPosition.t;
var xScale = d3.scaleLinear().range([0, histXScaleWidth]);
var yScale = d3.scaleLinear().range([histYScaleHeight, 0]);
var colorScale;
var ext;
var xAxisBars;
var yAxisBars;
var xScaleBars;
var yScaleBars;
var xAxisHistog;
var max2010MeanDens;
var max2010TotalLand;
var max2010TotalLand;
var max2000TotalPop;
var max2000TotalPop;
var max2000MeanDens;
var bar;
var barXPos = 70;
var barYPos = 10;
var barPosition = { t: 20, r: 10, b: 30, l: 100 };
var barWidth = histWidth * 5 / 6 - 35;
var barHeight = 305;
var barXScale = barWidth - barPosition.l - barPosition.r;
var yearHex = { 2000: '#8c8c8c', 2010: '#d86763' };
var valueHex = ['#fcc9b5', '#fa8873', '#d44951', '#843540'];
var globalNested;
var globalDatums;
var legendHex = {
  '#fcc9b5': '< 5k',
  '#fa8873': '5k-10k',
  '#d44951': '10k-15k',
  '#843540': '15k'
}

var xScaleHistog;
var yScaleHistog;


var extentByAttribute = {};
var brushHist;
var brush = d3.brushX()
  .extent([[0, histHeight/2], [histWidth, histHeight]])
  .on("start", brushstart)
  .on("brush", brushmove)
  .on("end", brushend);

function BarG(attr, num) {
  this.attr = attr;
  this.num = num;
}

function Histogram(attr, num) {
  this.attr = attr;
  this.num = num;
}

BarG.prototype.init = function(g, n) {

  var insertText;

  if (g.__data__.attr[0] == 'meanDensity2000') {
    globalN.sort(function (a, b) {
      return d3.descending(a.value.meanDensity2010, b.value.meanDensity2010);
    });
    
    xScaleBars = d3.scaleLinear()
      .domain([0, max2010MeanDens])
      .range([0, barXScale]);

    oldScaleBars = d3.scaleLinear()
      .domain([0, max2000MeanDens])
      .range([0, barXScale]);

    insertText = 'Average Population Density (persons / sqr. km)';
  }

  if (g.__data__.attr[0] == 'totalPop2000') {
    globalN.sort(function (a, b) {
      return d3.descending(a.value.totalPop2000, b.value.totalPop2010);
    });
    
    xScaleBars = d3.scaleLinear()
      .domain([0, max2010TotalPop])
      .range([0, barXScale]);

    oldScaleBars = d3.scaleLinear()
      .domain([0, max2000TotalPop])
      .range([0, barXScale]);
    insertText = 'Urban Population';
  }

  if (g.__data__.attr[0] == 'totalLand2000') {
    globalN.sort(function (a, b) {
      return d3.descending(a.value.totalLand2000, b.value.totalLand2010);
    });
    
    xScaleBars = d3.scaleLinear()
      .domain([0, max2010TotalLand])
      .range([0, barXScale]);

    oldScaleBars = d3.scaleLinear()
      .domain([0, max2000TotalLand])
      .range([0, barXScale]);
    insertText = 'Urban Land (sqr. km)';
  }

  bar = svg.select('.container')
    .append('g')
    .attr('class','barContainer')
    .attr('fill', 'white')
    .attr('opacity',.9)
    .attr('transform', 'translate(' + [barXPos + (histWidth)*n, barYPos] + ')');
  countries = globalN.map(function (d) {
    return d.key;
  });

  yScaleBars = d3.scaleBand()
    .domain(countries)
    .rangeRound([barPosition.t, barHeight + barPosition.t])
    .padding(.5);


  yAxisBars = d3.axisLeft(yScaleBars);

  bar.append('rect')
    .attr('class', 'frame')
    .attr('width', barWidth)
    .attr('height', barHeight + barPosition.t + barPosition.b);

  bar.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + [barPosition.l, 0] + ')')
    .call(yAxisBars);

  xAxisBars = d3.axisBottom(xScaleBars)
    .ticks(5)
    .tickFormat(function (d) {
      out = d/1000;
      if (g.__data__.attr[0] == 'totalPop2010') {
        out += "M";
      } else {
        out += 'k';
      }
      return out;
    });

  bar.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(' + [barPosition.l, histHeight / 2 - 15] + ')')
    .call(xAxisBars);

  bar.append('text')
    .attr('fill','black')
    .attr('class', 'barTitleLabel')
    .attr('transform', 'translate(' + [barWidth / 2, barPosition.t] + ')')
    .text(insertText)
    .style('font-size', '12px');
}

BarG.prototype.update = function(dat,g) {

  var bars = bar.selectAll('.bar')
    .data(g, function (d) {
      return d.country;
    })
    .enter()
    .append('g')
    .attr('class', 'bar')
    .attr('transform', function (d) {
      return 'translate(' + [barPosition.l, yScaleBars(d.key)] + ')';
    });
  
  if (dat.__data__.attr[0] == 'meanDensity2000') {
    xScaleBars = d3.scaleLinear()
      .domain([0, max2010MeanDens])
      .range([0, barXScale]);

    oldScaleBars = d3.scaleLinear()
      .domain([0, max2000MeanDens])
      .range([0, barXScale]);

    bars.append('rect')
      .attr('class','bar')
      .attr('height', yScaleBars.bandwidth() / 2)
      .attr('width', function (d) {
        return oldScaleBars(d.value.meanDensity2000);
      })
      .attr('fill', function (d) {
        return yearHex[2000];
      });

    bars.append('rect')
      .attr('class','bar')
      .attr('y', yScaleBars.bandwidth() / 2)
      .attr('height', yScaleBars.bandwidth() / 2)
      .attr('width', function (d) {
        return xScaleBars(d.value.meanDensity2010);
      })
      .attr('fill', function (d) {
        return yearHex[2010];
      });
  }

  if (dat.__data__.attr[0] == 'totalPop2000') {
    xScaleBars = d3.scaleLinear()
      .domain([0, max2010TotalPop])
      .range([0, barXScale]);

    oldScaleBars = d3.scaleLinear()
      .domain([0, max2000TotalPop])
      .range([0, barXScale]);

    bars.append('rect')
      .attr('class','bar')
      .attr('height', yScaleBars.bandwidth() / 2)
      .attr('width', function (d) {
        return oldScaleBars(d.value.totalPop2000);
      })
      .attr('fill', function (d) {
        return yearHex[2000];
      });

    bars.append('rect')
      .attr('class','bar')
      .attr('y', yScaleBars.bandwidth() / 2)
      .attr('height', yScaleBars.bandwidth() / 2)
      .attr('width', function (d) {
        return xScaleBars(d.value.totalPop2010);
      })
      .attr('fill', function (d) {
        return yearHex[2010];
      });
  }

  if (dat.__data__.attr[0] == 'totalLand2000') {
    xScaleBars = d3.scaleLinear()
      .domain([0, max2010TotalLand])
      .range([0, barXScale]);

    oldScaleBars = d3.scaleLinear()
      .domain([0, max2000TotalLand])
      .range([0, barXScale]);

    bars.append('rect')
      .attr('class','bar')
      .attr('height', yScaleBars.bandwidth() / 2)
      .attr('width', function (d) {
        return oldScaleBars(d.value.totalLand2000);
      })
      .attr('fill', function (d) {
        return yearHex[2000];
      });

    bars.append('rect')
      .attr('class','bar')
      .attr('y', yScaleBars.bandwidth() / 2)
      .attr('height', yScaleBars.bandwidth() / 2)
      .attr('width', function (d) {
        return xScaleBars(d.value.totalLand2010);
      })
      .attr('fill', function (d) {
        return yearHex[2010];
      });
  }

  bars = d3.selectAll('.bar')
    .on('mouseenter',function() {
      filter(this);
    })
    .on('mouseout',function() {
      clear();
    });
  
}

Histogram.prototype.init = function(g) {
  var histogram = d3.select(g);


  if (g.__data__.attr == 'density_growth') {
  histogram.append('text')
    .attr('fill','black')
    .attr('class', 'x label')
    .attr('transform', 'translate(' + [histWidth / 2, histHeight * 2 / 3 - 15] + ')')
    .text('Population Density Growth (Average)')
    .style('font-size', '12px');

  histogram.append('text')
    .attr('fill','black')
    .attr('class', 'y label')
    .attr('transform', 'translate(' + [histWidth * 3 / 4, histHeight * 3 / 4] + ')')
    .text('Urban density - 2010')
    .style('font-size', '12px')
    .style('text-anchor', 'middle');

    ext = d3.extent(globalDatums, function (d) {
      return d.density_growth;
    });
  }

  if (g.__data__.attr == 'pop_growth') {
  histogram.append('text')
    .attr('fill','black')
    .attr('class', 'x label')
    .attr('transform', 'translate(' + [histWidth / 2, histHeight * 2 / 3 - 15] + ')')
    .text('Population Growth (Average)')
    .style('font-size', '12px');

  histogram.append('text')
    .attr('fill','black')
    .attr('class', 'y label')
    .attr('transform', 'translate(' + [histWidth * 3 / 4, histHeight * 3 / 4] + ')')
    .text('Urban Population - 2010')
    .style('font-size', '12px')
    .style('text-anchor', 'middle');

    ext = d3.extent(globalDatums, function (d) {
      return d.pop_growth;
    });
  }

  if (g.__data__.attr == 'land_growth') {
  histogram.append('text')
    .attr('fill','black')
    .attr('class', 'x label')
    .attr('transform', 'translate(' + [histWidth / 2, histHeight * 2 / 3 - 15] + ')')
    .text('Growth in Urban Land')
    .style('font-size', '12px');

  histogram.append('text')
    .attr('fill','black')
    .attr('class', 'y label')
    .attr('transform', 'translate(' + [histWidth * 3 / 4, histHeight * 3 / 4] + ')')
    .text('Urban Land - 2010')
    .style('font-size', '12px')
    .style('text-anchor', 'middle');

    ext = d3.extent(globalDatums, function (d) {
      return d.land_growth;
    });
  }


  xScaleHistog = d3.scaleLinear()
    .domain(ext)
    .range([0, histXScaleWidth]);

  xAxisHistog = d3.axisBottom(xScaleHistog)
    .ticks(7)
    .tickFormat(function (d) {
      return d * 100 + "%";
    });

  histogram.append('rect')
    .attr('class','frame')
    .attr('transform', 'translate(' + [0, 0] + ')')
    .attr('width', histWidth)
    .attr('height',histHeight);

  histogram.append('text')
    .attr('fill','black')
    .attr('class', 'y label')
    .attr('transform', 'translate(' + [0, histHeight - histPosition.b] + ') rotate(-90)')
    .text('Number of Cities')
    .style('font-size', '12px');

  histogram.append('text')
    .attr('fill','black')
    .attr('class', 'y label')
    .attr('transform', 'translate(' + [histWidth / 2, histHeight * 2 / 3] + ')')
    .text('between 2000 and 2010')
    .style('font-size', '12px');

  var legendHistog = histogram.append('g')
    .attr('transform', 'translate(' + [histWidth * 3 / 4, histHeight * 3 / 4] + ')');

  valueHex.forEach(function (d, i) {
    var group = legendHistog.append('g');

    group.append('rect')
      .attr('height', '15')
      .attr('width', '15')
      .style('fill', d)
      .attr('transform', 'translate(' + [0, 45 - i * 15] + ')');

    group.append('text')
    .attr('fill','black')
      .attr('x', '20')
      .attr('dy', '0.7em')
      .text(legendHex[d])
      .style('font-size', '12px')
      .attr('transform', 'translate(' + [0, 45 - i * 15] + ')');
  });
  histogram.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(' + [0, histHeight] + ')')
    .call(xAxisHistog);
  var histogramYAxis = d3.axisLeft(yScaleHistog)
    .ticks(7);

  histogram.append('g')
    .attr('class', 'y axis')
    .call(histogramYAxis);

  var yGridHistog = d3.axisLeft(yScaleHistog)
    .ticks(6)
    .tickSize(-histXScaleWidth, 0, 0)
    .tickFormat('')
    .tickSizeOuter(0);

  histogram.append('g')
    .attr('class', 'y grid')
    .call(yGridHistog);
}

Histogram.prototype.update = function(g, maybeFilteredData) {
  colorScale = d3.scaleQuantize().range(valueHex);
  var histogram = d3.select(g);

  if (g.__data__.attr == 'density_growth') {
    colorScale.domain([0,15000]);

    var bins = d3.histogram()
      .domain(xScaleHistog.domain())
      .thresholds(xScaleHistog.ticks(80))
      .value(function (d) {
        return d.density_growth;
      })
      (maybeFilteredData);

    var bin = histogram.selectAll('.bin')
      .data(bins)
      .enter()
      .append('g')
      .attr('class', 'bin')
      .attr('transform', function (d) {
        return 'translate(' + [(xScaleHistog(d.x0) + (xScaleHistog(d.x1) - xScaleHistog(d.x0)) / 2.0), 0] + ')';
      });

    var dots = bin.selectAll('.dot')
      .data(function (d) {
        d.sort(function (a, b) {
          return b.density_2010 - a.density_2010;
        });

        return d.map(function (d, i) {
          return {
            "d2010": d.density_2010,
            "ypos": i,
            "city": d.city,
            "country": d.country,
            "density_growth": d.density_growth,
            "pop_growth": d.pop_growth,
            "land_growth": d.land_growth,
            "xpos": xScaleHistog(d.x0) + (xScaleHistog(d.x1) - xScaleHistog(d.x0)) / 2
          };
        });
      })
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr("fill", function(d) { return colorScale(d.d2010); })
      .attr('r', '2')
      .attr('cx', function (d) {
        return 1;
      })
      .attr('cy', function (d) {
        return yScaleHistog(d.ypos) - 2;
      });

  }

  if (g.__data__.attr == 'land_growth') {
    colorScale.domain([0,800]);

    var bins = d3.histogram()
      .domain(xScaleHistog.domain())
      .thresholds(xScaleHistog.ticks(80))
      .value(function (d) {
        return d.land_growth;
      })
      (maybeFilteredData);

    var bin = histogram.selectAll('.bin')
      .data(bins)
      .enter()
      .append('g')
      .attr('class', 'bin')
      .attr('transform', function (d) {
        return 'translate(' + [(xScaleHistog(d.x0) + (xScaleHistog(d.x1) - xScaleHistog(d.x0)) / 2.0), 0] + ')';
      });

    var dots = bin.selectAll('.dot')
      .data(function (d) {
        d.sort(function (a, b) {
          return b.land_2010 - a.land_2010;
        });

        return d.map(function (d, i) {
          return {
            "d2010": d.land_2010,
            "ypos": i,
            "city": d.city,
            "country": d.country,
            "density_growth": d.density_growth,
            "pop_growth": d.pop_growth,
            "land_growth": d.land_growth,
            "xpos": xScaleHistog(d.x0) + (xScaleHistog(d.x1) - xScaleHistog(d.x0)) / 2
          };
        });
      })
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr("fill", function(d) { return colorScale(d.d2010); })
      .attr('r', '2')
      .attr('cx', function (d) {
        return 1;
      })
      .attr('cy', function (d) {
        return yScaleHistog(d.ypos) - 2;
      });
  }

  if (g.__data__.attr == 'pop_growth') {
    colorScale.domain([0,4000000]);

    var bins = d3.histogram()
      .domain(xScaleHistog.domain())
      .thresholds(xScaleHistog.ticks(80))
      .value(function (d) {
        return d.pop_growth;
      })
      (maybeFilteredData);

    var bin = histogram.selectAll('.bin')
      .data(bins)
      .enter()
      .append('g')
      .attr('class', 'bin')
      .attr('transform', function (d) {
        return 'translate(' + [(xScaleHistog(d.x0) + (xScaleHistog(d.x1) - xScaleHistog(d.x0)) / 2.0), 0] + ')';
      });

    var dots = bin.selectAll('.dot')
      .data(function (d) {
        d.sort(function (a, b) {
          return b.pop_2010 - a.pop_2010;
        });

        return d.map(function (d, i) {
          return {
            "d2010": d.pop_2010,
            "ypos": i,
            "city": d.city,
            "country": d.country,
            "density_growth": d.density_growth,
            "pop_growth": d.pop_growth,
            "land_growth": d.land_growth,
            "xpos": xScaleHistog(d.x0) + (xScaleHistog(d.x1) - xScaleHistog(d.x0)) / 2
          };
        });
      })
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr("fill", function(d) { return colorScale(d.d2010); })
      .attr('r', '2')
      .attr('cx', function (d) {
        return 1;
      })
      .attr('cy', function (d) {
        return yScaleHistog(d.ypos) - 2;
      });
  }
}

svg.append('g')
  .attr('class', 'container')
  .attr('transform', 'translate(' + [histXPos, 0] + ')');

d3.csv('./data/asia_urbanization.csv',
  function(row){
    return {
      city: row.city,
      country: row.country,
      type_country: row.type_country,
      land_2000: +row.land_2000,
      land_2010: +row.land_2010,
      land_growth: +row.land_growth,
      pop_2000: +row.pop_2000,
      pop_2010: +row.pop_2010,
      pop_growth: +row.pop_growth,
      density_2000: +row.density_2000,
      density_2010: +row.density_2010,
      density_growth: +row.density_growth
    }
  },
  function(error, dataset){
    if(error) {
        console.error('Error while loading ./data/asia_urbanization.csv dataset.');
        console.error(error);
        return;
    }

    // **** Your JavaScript code goes here ****

    globalDatums = dataset;

    dataAttributes.forEach(function(attribute) {
      extentByAttribute[attribute] = d3.extent(dataset, function(d) {
        return d[attribute];
      });
    });

  ext = d3.extent(globalDatums, function (d) {
    return d.density_growth;
  });


  xScaleHistog = d3.scaleLinear()
    .domain(ext)
    .range([0, histXScaleWidth]);

  xAxisHistog = d3.axisBottom(xScaleHistog)
    .ticks(7)
    .tickFormat(function (d) {
      return d * 100 + "%";
    });


  yScaleHistog = d3.scaleLinear()
    .domain([0, 156])
    .range([histHeight, histPosition.t]);


    globalN = d3.nest()
      .key(function (d) {
        return d.country;
      })
      .rollup(function (cities) {
        var totalLand2000 = d3.sum(cities, function (d) {
          return d.land_2000;
        });

        var totalLand2010 = d3.sum(cities, function (d) {
          return d.land_2010;
        });

        var totalPop2000 = d3.sum(cities, function (d) {
          return d.pop_2000;
        });

        var totalPop2010 = d3.sum(cities, function (d) {
          return d.pop_2010;
        });

        var meanDensity2000 = d3.mean(cities, function (d) {
          return d.density_2000;
        });

        var meanDensity2010 = d3.mean(cities, function (d) {
          return d.density_2010;
        });

        return {
          totalPop2000,
          totalPop2010,
          totalLand2000,
          totalLand2010,
          meanDensity2000,
          meanDensity2010
        };
      })
      .entries(dataset);

  max2010TotalLand = d3.max(globalN, function(d) {
    return d.value.totalLand2010;
  });
  max2000TotalLand = d3.max(globalN, function(d) {
    return d.value.totalLand2000;
  });

  max2010TotalPop = d3.max(globalN, function(d) {
    return d.value.totalPop2010;
  });
  max2000TotalPop = d3.max(globalN, function(d) {
    return d.value.totalPop2000;
  });

  max2010MeanDens = d3.max(globalN, function(d) {
    return d.value.meanDensity2010;
  });
  max2000MeanDens = d3.max(globalN, function(d) {
    return d.value.meanDensity2000;
  });
    addSet();
  }
);


function addSet() {
  histogram();
  barChart();
}

function histogram() {

  var hists = [];
  var n = 0;
  dataAttributes.forEach(function(attrX, col){
    hists.push(new Histogram(attrX, n));
    n += 1;
  });

  var histEnter = svg.selectAll('.hist')
    .data(hists)
    .enter()
    .append('g')
    .attr('fill', 'none')
    .attr('class','hist')
    .attr('transform', function(d,i) {
      var tx = histXPos + i*histWidth;
      var ty = histPosition.t;
      return 'translate('+[tx, ty]+')';
    });

  histEnter.each(function(c) {
    c.init(this);
    c.update(this,globalDatums);
  });
  histEnter.append('g')
    .attr('class','brush')
    .call(brush);

}


function barChart() {

  var barGs = [];
  var n = 0;
  barAttributes.forEach(function(attrX, col) {
    barGs.push(new BarG(attrX, n));
    n += 1;
  });


//  var barGs = [];
//  dataAttributes.forEach(function(attrX, col){
//    dataAttributes.forEach(function(attrY, row){
//      barGs.push(new Histogram(attrX, attrY, col, row));
//    });
//  });
//
  var barGsEnter = svg.selectAll('.barG')
    .data(barGs)
    .enter()
    .append('g')
    .attr('class','barG')
    .attr('stroke','red')
    .attr('transform', function(d) {
      var tx = barWidth;
      var ty = barHeight;
      return 'translate('+[tx, ty]+')';
    });

  var n = 0;
  barGsEnter.each(function(c) {
    c.init(this, n);
    c.update(this,globalN);
    n+=1
  });

}

function brushstart(histo) {
  if(brushHist !== this) {
    brush.move(d3.select(brushHist), null);
    xScale.domain(extentByAttribute[histo.attr]);
    yScale.domain(extentByAttribute[histo.attr]);
    brushHist = this;
  }
}

function brushmove(histo) {
  var e = d3.event.selection;
  if(e) {
    xScale.domain(extentByAttribute[histo.attr]);
    svg.selectAll(".dot")
      .classed("hidden", function(d){
        return (e[0] > Math.floor(xScale(d[histo.attr]))
          || Math.ceil(xScale(d[histo.attr])) > e[1]);
      });

  var filtered = globalDatums.filter(function(d) {
    return (e[0] <= Math.floor(xScale(d[histo.attr]))
      && Math.ceil(xScale(d[histo.attr])) <= e[1]);
  });

  svg.selectAll('.hist')
    .each(function(c) {
      c.update(this, filtered);
    });
  }
}

function brushend() {
  if(!d3.event.selection) {

    svg.selectAll('.hidden')
      .classed('hidden',false);

    svg.selectAll('.hist')
      .each(function(c) {
        c.update(this,globalDatums);
      });
    brushHist = undefined;
  }
}

function filter(dat) {
  var filtered = globalN.filter(function(d) {
    return d.country == dat.__data__.key;
  });

  svg.selectAll('.dot')
    .classed('hidden',function(d){
      return d.country != dat.__data__.key;
    });

  svg.selectAll('.bar')
    .classed('hidden',function(d) {
      return d.key !== dat.__data__.key;
    });

  svg.selectAll('.barG')
    .each(function(b) {
      b.update(this, filtered);
    });
}

function clear() {
  svg.selectAll('.dot')
    .classed('hidden',false);
  svg.selectAll('.bar')
    .classed('hidden',false);

//  svg.selectAll('.barG')
//    .each(function(b) {
//      b.update(this, globalN);
//    });
}
