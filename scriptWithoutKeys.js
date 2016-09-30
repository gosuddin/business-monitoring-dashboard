"use strict";
var browserWidth = document.documentElement.clientWidth-10 , browserHeight = document.documentElement.clientHeight , radC = Math.PI / 180;

var countNetworks = 10;

var bannerWidth = browserWidth + 10, bannerHeight = (browserHeight / 10) ;

var timerWidth = browserWidth + 8, timerHeight = (browserHeight / 10) - 8;

var SVGWidth = (browserWidth / countNetworks) * 2;
var SVGHeight = ((browserHeight-bannerHeight) / 10) * (4);

var centralAngle = 60;
var clockWidth = 40;
var radius;
var padding = 25;

if (SVGWidth >= SVGHeight)
{

	radius = (SVGHeight / 2) - padding;
}
else
{
	radius = (SVGWidth / 2) - padding;
}
var radialWidth = radius / 5;

var bgarc = d3.svg.arc().outerRadius(radius).innerRadius(radius - radialWidth).startAngle((-180 + (centralAngle / 2)) * radC).endAngle((180 - (centralAngle / 2)) * radC);

//PIE CHART
var fetchPie = d3.layout.pie().value(function(d)
{
	/*return d.impact;*/    //TEST VIZ
	return d.arcLength;  //ACtual Visualization
}).startAngle((-180 + (centralAngle / 2)) * radC).endAngle((180 - (centralAngle / 2)) * radC);
var infoArc = d3.svg.arc().outerRadius(radius).innerRadius(radius - radialWidth);

//Variables for GAUGE
var maxGauges = 10;
var gauges = [];
var radialPadding = radialWidth / 5;
var gaugeRadius = radius - radialWidth - radialPadding - (radialWidth/5);

var intervalLength; //CONFIG PARAMETERS FROM PAGE

//Variables for CLOCK
var blinkDots = [];
var currentTimer = [];
var countDownTimer;
var todaysDate = new Date();
var hour = todaysDate.getHours();
var min = todaysDate.getMinutes();
var secs = todaysDate.getSeconds();

var threshold = 30;

var tooltip;


var noOfSlices;
var presentSlice;
/* DATA */

var dataForUnit1 = [];
var dataForUnit2 = [];
var dataForUnit3 = [];
var dataForUnit4 = [];
var dataForUnit5 = [];
var dataForUnit6 = [];
var dataForUnit8 = [];
var dataForUnit10 = [];
var dataForUnit9 = [];
var dataForUnit7 = [];
var dataSources;
var networkLabels;

  /*var dataSources =[dataForUnit1,dataForUnit3,dataForUnit5,dataForUnit8,dataForUnit9, dataForUnit2,dataForUnit4,dataForUnit6,dataForUnit10,dataForUnit7]*/
 ;
//TIMER 
var incTimer=0;

function setParameters()
{
	
	/*var queriedDate=document.getElementById('startDate').value;*/
	var fromHours = document.getElementById('fromHours').value;
	var fromMins = document.getElementById('fromMins').value;
	var fromSecs = document.getElementById('fromSecs').value;
	var duration = document.getElementById('duration').value;
	var toMins = fromMins+duration;
	var intervalLength=document.getElementById('intervalLength').value;
	if (
		(fromHours=="HH" )||(fromMins=="MM" ) || (fromSecs=="SS" )||
		(duration=="") ||
		(intervalLength=="5-180(mins)")) 
		{
		alert("Please enter the correct parameters for Visualization.");
		}
	if((fromHours<0)||(fromHours>23)){
		alert("Please enter the valid hours for Visualization.");
	}
	if((fromMins<0)||(fromMins>59)){
		alert("Please enter the valid minutes for Visualization.");
	}
	if((fromSecs<0)||(fromSecs>59)){
		alert("Please enter the valid secs for Visualization.");
	}
	else{
	noOfSlices=duration/intervalLength;
	console.log('Slices to be prepared: '+noOfSlices);
	noOfSlices=Math.round(noOfSlices);
	dataSources = [ dataForUnit1, dataForUnit3, dataForUnit5, dataForUnit8, dataForUnit9, dataForUnit2, dataForUnit4, dataForUnit6, dataForUnit10, dataForUnit7 ];
	networkLabel=['Channel 1', 'Channel 2','Channel 3','Channel 4','Channel 5',
	              'Channel 6','Channel 7','Channel 8','Channel 9','Channel 10'];
/*	for(var i=0;i<dataSources.length;i++)
		{
			dataSources[i].length=noOfSlices;
		}*/
	initializeData();
	startViz();
	}
	/*fromDate=new Date(2015,02,28,2,2,2);*/
	/*toDate=new Date(2015,02,28,fromHours,toMins,fromSecs);*/
	
}
function initializeData(){
	for(var i=0;i<dataSources.length;i++)
	{
	 for(var j=0;j<noOfSlices;j++)
	 {
		 console.log('Push in..');
		 dataSources[i].push({
				arcLength : 1, // visualization (arcLength) 
				volume : Math.floor((Math.random() * 100) + 1),
				occurred : false,
				impact : Math.floor((Math.random() * 100) + 1)
			});
	 }
	}
}
function createGauge()
{
	var duration = document.getElementById('duration').value;
	var gauge = iopctrl.arcslider().radius(gaugeRadius).indicator(iopctrl.defaultGaugeIndicator);
	gauge.axis().orient("in").normalize(true).ticks(10).tickSubdivide(4).tickSize(15, 5, 10).tickPadding(8).scale(d3.scale.linear().domain([ 0, duration ]).range([ ((-180 + (centralAngle / 2)) * radC), (180 - (centralAngle / 2)) * radC ]));
	return gauge;
}

function drawLayout()
{
	var i;
	var banner=d3.select('#headerBanner').attr('width', bannerWidth).attr('height', bannerHeight);
	
	var topContainer = d3.select('#topContainer').attr('width', browserWidth).attr('height', browserHeight);

	var middleContainer = d3.select('#middleContainer').attr('width', timerWidth).attr('height', timerHeight);

	var bottomContainer = d3.select('#bottomContainer').style('width', browserWidth).style('height', browserHeight);
	
	banner.append('svg').attr('id', 'banner').attr('width', bannerWidth).attr('height', bannerHeight).style("background-color", "#212E3F");
	 
	d3.select('#banner')
		.append('text')
		.attr('fill','#FF6600')
		.attr('transform','translate('+browserWidth/2+','+bannerHeight/2+')')
		.style('font-size','20 px')
		.text("SAMPLE DASHBOARD");
	
	for (i = 0; i < 5; i++)
	{
		topContainer.append('div').attr('id', 'chart' + i).attr('class', 'chartClass').attr('width', SVGWidth).attr('height', SVGHeight).style("background-color", "#212E3F");
	}

	middleContainer.append('div').attr('id', 'placeTimer').attr('class', 'chartClass').attr('width', timerWidth).attr('height', timerHeight).style("background-color", "#212E3F");

	for (i = 0; i < 5; i++)
	{
		bottomContainer.append('div').attr('id', 'chart' + i).attr('class', 'chartClass').attr('width', SVGWidth).attr('height', SVGHeight).style("background-color", "#212E3F");
	}
	for (i = 0; i < 5; i++)
	{
		topContainer.select('#chart' + i).append('svg').attr('id', 'topSVG' + i).attr('width', SVGWidth).attr('height', SVGHeight);
		bottomContainer.select('#chart' + i).append('svg').attr('id', 'bottomSVG' + i).attr('width', SVGWidth).attr('height', SVGHeight);
	}
	middleContainer.select('#placeTimer').append('svg').attr('id', 'middleSVG').attr('width', timerWidth).attr('height', timerHeight);

}

function drawArcs()
{
	var i;
	for (i = 0; i < 5; i++)
	{
		d3.select('#topSVG' + i).append('g').append('path').attr('transform', 'translate(' + SVGWidth / 2 + ',' + SVGHeight / 2 + ')').attr('fill', '#6A7C86').attr('d', bgarc);

	}

	for (i = 0; i < 5; i++)
	{
		d3.select('#bottomSVG' + i).append('g').append('path').attr('transform', 'translate(' + SVGWidth / 2 + ',' + SVGHeight / 2 + ')').attr('fill', '#6A7C86').attr('d', bgarc);
	}
}

function drawGauge()
{
	var loop;
	var gaugeCounter = 0;
	for ( loop = 0; loop < (countNetworks); loop++)
	{
		gauges[loop] = createGauge();
	}
	for ( loop = 0; loop < (countNetworks / 2); loop++)
	{
		d3.select('#topSVG' + loop).append('g').attr("class", "gauge")
		/* .attr('transform','translate('+((SVGWidth/2)-gaugeRadius)+',0)') */
		.attr("transform", 'translate(' + ((SVGWidth / 2) - (gaugeRadius*2) + radialWidth - 2) + ',' + ((SVGHeight / 2) - (gaugeRadius*2) + radialWidth -2)+ ')').call(gauges[gaugeCounter]);
		gauges[gaugeCounter].value(0);
		gaugeCounter++;
	}
	for ( loop = 0; loop < (countNetworks / 2); loop++)
	{
		d3.select('#bottomSVG' + loop).append('g').attr("class", "gauge")
		/* .attr('transform','translate('+gaugeRadius+',0)') */
		.attr("transform", 'translate(' + ((SVGWidth / 2) - (gaugeRadius*2) + radialWidth -2) + ',' + ((SVGHeight / 2) - (gaugeRadius*2) + radialWidth -2) + ')').call(gauges[gaugeCounter]);
		gauges[gaugeCounter].value(0);
		gaugeCounter++;
	}
}

function drawClock()
{

	var initialClockPositionX = (timerWidth / 2) - clockWidth;
	var initialClockPositionY = timerHeight / 2;
	var moveWith = clockWidth + 5;
	var timerSVG = d3.select('#middleSVG');
	blinkDots[0] = timerSVG.append('g')
					.attr('class', 'segdisplay')
					.append('circle').attr('r', '2')
					.attr('transform', 'translate(' + ((initialClockPositionX)) + ',' + ((timerHeight / 2) + 10) + ')')
					.attr('class', 'on')
					.style('font-size','3px');

	blinkDots[1] = timerSVG.append('g').attr('class', 'segdisplay').append('circle').attr('r', '2').attr('transform', 'translate(' + ((initialClockPositionX)) + ',' + ((timerHeight / 2) + 20) + ')').attr('class', 'on');

	blinkDots[2] = timerSVG.append('g').attr('class', 'segdisplay').append('circle').attr('r', '2').attr('transform', 'translate(' + ((initialClockPositionX) + clockWidth) + ',' + ((timerHeight / 2) + 10) + ')').attr('class', 'on');

	blinkDots[3] = timerSVG.append('g').attr('class', 'segdisplay').append('circle').attr('r', '2').attr('transform', 'translate(' + ((initialClockPositionX) + clockWidth) + ',' + ((timerHeight / 2) + 20) + ')').attr('class', 'on');

	currentTimer[0] = iopctrl.segdisplay().width(clockWidth).digitCount(2).negative(false).decimals(0);
	currentTimer[1] = iopctrl.segdisplay().width(clockWidth).digitCount(2).negative(false).decimals(0);
	currentTimer[2] = iopctrl.segdisplay().width(clockWidth).digitCount(2).negative(false).decimals(0);

	timerSVG.append('text').attr('transform', 'translate(' + (initialClockPositionX - moveWith + (clockWidth / 2)) + ',' + ((initialClockPositionY - 10)) + ')').attr('transform', 'translate(0,0)').attr("fill", "#01BC01").text("CURRENT TIME");

	var i;
	for (i = 0; i < 3; i++)
	{
		timerSVG.append("g").attr("class", "segdisplay").attr('transform', 'translate(' + (((i - 1) * moveWith) + initialClockPositionX) + ',' + ((initialClockPositionY)) + ')').call(currentTimer[i]);
	}
	currentTimer[0].value(hour);
	currentTimer[1].value(min);
	currentTimer[2].value(secs);

}

function drawTooltip()
{
		tooltip = d3.select('#topContainer #chart4') // NEW
		.append('div') // NEW
		.attr('class', 'tooltip'); // NEW
		tooltip.append('div') // NEW
		.attr('class', 'label'); // NEW

		tooltip.append('div') // NEW
		.attr('class', 'source');

		tooltip.append('div') // NEW
		.attr('class', 'count'); // NEW

		tooltip.append('div') // NEW
		.attr('class', 'percent');
 
}

var networkLabel= new Array(); 
function populateData()
{
	var d=document.getElementById('duration').value;
	var l=document.getElementById('intervalLength').value;
	
	console.log("POP () called");
	/*console.log('Length is:'+dataSources.length);
	console.log('dura'+d);
	 CREATE ARRAYS 
	noOfSlices=Math.round(d/l);
	console.log('No of slices '+noOfSlices);
	
	 dataForUnit1.length=noOfSlices;
	for(var i=0;i<dataSources.length;i++)
	{
	 for(var j=0;j<noOfSlices;j++)
	 {
		 console.log('Push in..');
		 dataSources[i].push({
				arcLength : 1, // visualization (arcLength) 
				volume : Math.floor((Math.random() * 100) + 1),
				occurred : false,
				impact : Math.floor((Math.random() * 100) + 1)
			});
	 }
	}*/
		 /*console.log('Pushed in..');*/
	

}
function drawVisualisation(dataSource, pos, num)
{
	var dataForViz = dataSource;
	var posSVGnum = pos + 'SVG' + num;
	var currentSVG = d3.select('#' + posSVGnum).append('g')
					.attr('transform', 'translate(' + SVGWidth / 2 + ',' + SVGHeight / 2 + ')')
					.selectAll('path')
					.data(fetchPie(dataForViz)).enter().append('g')
					.attr('class', 'slice')
					;
	var slices = d3.selectAll('g.slice').append('path').attr('d', infoArc).attr('fill', function(d)
	{
		// RED = FF3E58 GREEN =10B04A GREY =6A7C86
		/*
		 */ if((d.data.occurred==false)) { return '#6A7C86'; } else{
		 
		if ((d.data.impact > threshold))
		{
			return "#FF3E58";
		}
		else
		{
			return "#10B04A";
		}}
		;
	}).attr('stroke', '#FFF').attr('stroke-width', '1')
		.on('mouseover',function(d){
					console.log("IN");
					var impact;
					var volume;
					if(d.data.occured==false)
					{
						impact="NA";
						volume ="NA";
					}
				else
					{
					impact=d.data.impact+"%";
					volume=d.data.volume;
					}
					/*tooltip.select('.label').html("<font color=\"#FFFFFF\">Network: </font>" +
							"<strong><font color=\"#FF6600\">"+d.data.network+" </font>	");*/
					tooltip.select('.source').html("<font color=\"#FFFFFF\">Source:  </font>" +
							"<strong><font color=\"#FF6600\"> NA </font>	");
					tooltip.select('.count').html("<font color=\"#FFFFFF\">Volume: </font>" +
							"<strong><font color=\"#FF6600\">"+volume+" </font>	"); 
					console.log(d.data.occured);
					 
					tooltip.select('.percent').html("<font color=\"#FFFFFF\">Impact: </font>" +
							"<strong><font color=\"#FF6600\">"+impact+" </font>	"); 
					tooltip.style('display', 'block');
					
					console.log(d.data.network);
				})
				.on('mousemove', function(d) {
					var x,y;
					var padding =30;
					var tooltipWidth =120;
					var tooltipHeight = 40;
					if ((d3.event.pageX+padding+tooltipWidth)>(browserWidth))
						{
						x=d3.event.pageX-10-tooltipWidth;
						}
					else{
						x=d3.event.pageX+10;
					}
					if ((d3.event.pageY+10+tooltipHeight)>(browserHeight))
					{
					y=d3.event.pageY-10-tooltipHeight;
					}
					else{
					y=d3.event.pageY+10;
					}
					tooltip.style('top', (y ) + 'px')
					.style('left', (x ) + 'px');
					console.log((d3.event.pageY ));
				})
				.on('mouseout',function(d){
					console.log("OUT");
					tooltip.style('display', 'none');
				});
		currentSVG.append('text')
				.attr("fill","#FF6600")
				.attr('transform', 'translate(0'+','+((SVGHeight/4)+(radius/2))+')')
			    .style("text-anchor","middle")
			    .text(function(){
			    	if (pos=='bottom')
			    		{
			    	return networkLabel[num+5];
			    		}
			    	else{
			    		return networkLabel[num];
			    	}
			    });
	
}

function plotOnPie()
{
	var i;
	for (i = 0; i < 10; i++)
	{
		if (i < 5)
		{
			drawVisualisation(dataSources[i], 'top', i);
		}
		else
		{
			drawVisualisation(dataSources[i], 'bottom', i - 5);
		}
	}
}

function hourlyRefresh(){
	d3.selectAll('g.slice').remove();
}

function moveWithTime(){
	incTimer=1;
	var i;
	var sliceno;
	sliceno=1;
	var d = document.getElementById('duration').value;
	var interval = document.getElementById('intervalLength').value;
	console.log('Duration value: '+ d + 'IL: '+interval );
	var myTimer= setInterval(function () {
		if ((incTimer-1)>=d)
		{
		hourlyRefresh();
		resetData();
		initializeData();
		plotOnPie();
		sliceno=1;
		incTimer=0;
		}
		for(i=0;i<10;i++)
			{
			gauges[i].value(incTimer);
			}
		currentTimer[0].value(new Date().getHours());
		currentTimer[1].value(new Date().getMinutes());
		currentTimer[2].value(new Date().getSeconds());
		console.log('MOD: '+(incTimer%interval)+ 'DIV:'+(incTimer/interval));
		console.log('VALUE OF INTERVAL:' +incTimer);
		if (((incTimer-1)%interval==0)&&((incTimer-1)/interval>=sliceno))
			{
			sliceno++;
			console.log('Should change');
			changeColor(((incTimer-1)/interval)-1,d);
			}
		
		incTimer++;
		}, 1000);
}

function changeColor( i ,d){
	var p,q,r,s;
	var counter =i;
	var maxTime =d;
	presentSlice=new Array();
	presentSlice=d3.selectAll('g.slice');
	/*console.log("Called on interval"+ incTimer-1);*/
	for (p=0;p<10;p++)
	{
	dataSources[p][counter].occurred=true;
	hourlyRefresh();
	}
	if ((incTimer)==maxTime){
		console.log('Delete and draw');
		hourlyRefresh();
		resetData();
	}
	plotOnPie();
	
	
}

function resetData(){
	for(var i=0;i<dataSources.length;i++)
		{
			console.log('Before: '+dataSources[i]+' '+dataSources[i].length);
			dataSources[i].length=0;
			console.log('After: '+dataSources[i]+' '+dataSources[i].length);
		}
	populateData();
}


/* START DRAWING */
drawLayout();
drawArcs();
/*drawGauge();*/
drawClock();
function startViz()
{
/*drawLayout();
drawArcs();*/
drawGauge();
/*drawClock();*/
populateData();
drawTooltip();
plotOnPie();
moveWithTime();
}