function update(data, text, circles, selected, projectedCoordinates, numbering) {
	//recalculate the size of the circles depending on the ranking
	//recalculate the list ordering


	//alert('wanna update?');

	datacopy = data;

	//update the json object with the new ranking value

	weights = {
		"male_models_standardized": 1,
		"female_models_standardized": 1,
		"weed_standardized": 1,
		"sarah_palin_standardized": 1,
		"asians_athletes_standardized": -1,
		"bottle_service_standardized": -1,
		"sex_scandals_standardized": 1,
		"brooks_brothers_standardized": 1
	};


	for (var j = 0; j < data.length; j++) {
		fillvalue = 1 / (selected.length + 1);

		var balance = new Array();
		for (var k = 0; k < selected.length; k++) {
			balance[k] = fillvalue * weights[selected[k]];
		};


		datacopy[j].ranking = DotProduct(balance, data[j], selected);

	};


	resorteddata = datacopy.sort(function(a, b) {
		return d3.descending(a.ranking, b.ranking);
	});

	rankings = {};
	for (var b = 0; b < resorteddata.length; b++) {
		rankings[resorteddata[b].city] = b;
	};


	// have to calculate new locations of the blocks here

	text
		.data(resorteddata)
		.transition()
		.attr("x", function(d, i) {
		var xcoordinate = 55;
		if ((rankings[$(this).attr('name')]) > 10) {
			xcoordinate = 220;
		}
		return xcoordinate;
	})



	.transition()
		.attr("y", function(d, i) {
		return (((rankings[$(this).attr('name')] % 11 + 1) * line_height))
	})
		.duration(1000);
	
	if(selected.length != 0)
	    {
		numbering.
		    transition()
		    .style("fill", "#999")
		    .duration(500);
	    }
	else
	    {
		numbering.transition().style("fill", "#F8F8F8").duration(500);
	    }


	console.log(resorteddata)
	var newcircles =
		circles
		.data(resorteddata)
		.attr("cx", function(d, i) {
		return projectedCoordinates[d.city][0];
	})
		.attr("cy", function(d, i) {
		return projectedCoordinates[d.city][1];
	})
		.attr("id", function(d, i) {
		return d.id;
	})
		.attr("name", function(d, i) {
		return d.city;
	})
		.transition()
		.attr("r", function(d, i) {
			//console.log(d.city);
			//console.log(((d.ranking / 3) + .5) * 10);
		return (((d.ranking / 2) + 1) * 13);
	})
		.duration(1000);


}

function DotProduct(weights, data, selected) {
	var sum = 0;
	for (var i = 0; i < weights.length; i++) {
		sum = sum + (weights[i] * eval('data.' + String(selected[i])));
	};
	//console.log(sum)
	return sum
}


var badgeKeys = {
	"male_models_standardized": "Male Models",
	"female_models_standardized": "Female Models",
	"weed_standardized": "Weed",
	"sarah_palin_standardized": "Sarah Palin",
	"asians_athletes_standardized": "Asian Athletes",
	"bottle_service_standardized": "Bottle Service",
	"sex_scandals_standardized": "Sex Scandals",
	"brooks_brothers_standardized": "Brooks Brothers"
};

var selected = new Array();

//d3.keys(badgeKeys);

var badgeColor = d3.scale.ordinal()
	.domain(d3.keys(badgeKeys))
	.range(colorbrewer.Set3[8]);

//PREP FOR MAP
var projection = d3.geo.albers()
	.scale(map_scale)
	.translate([w / 2, h / 2]);

var path = d3.geo.path()
	.projection(projection);

var body = d3.select('body');

var svg = d3.select("#map").insert("svg:svg", "h2")
	.attr("width", w)
	.attr("height", h);


//LOAD DATA
queue()
	.defer(d3.json, "js/BestCitiesIndexStandardized.json")
	.defer(d3.json, "data/us.json")
	.awaitAll(draw);


//FUNCTION TO RUN WHEN DATA IS LOADED

function draw(error, data) {

	var cities = data[0]
	var us = data[1]

	//DRAW MAP
	svg.insert("path")
		.datum(topojson.feature(us, us.objects.land))
		.attr("id", "land")
		.attr("d", path);

	svg.insert("path")
		.datum(topojson.feature(us, us.objects.states, function(a, b) {
		return a != b
	}))
		.attr("id", "states")
		.attr("d", path);


	var cells = svg.append("svg:g")
		.attr("id", "cells");

	var listitems = d3.select("#listitems")
		.insert("svg:svg")
		.attr("width", w)
		.attr("height", h)
		.attr("id", "rows");


	//PREP CITY DATA
	// here is where we can sort the cities list by rankings
	sorted = cities.sort(function(a, b) {
		return d3.descending(a.id, b.id);
	});

	projectedCoordinates1 = [];
	for (var i = 0; i < cities.length; i++) {
		projectedCoordinates1[i] = projection([cities[i].cx, cities[i].cy]);
	}

	projectedCoordinates = {};
	for (var i = 0; i < cities.length; i++) {
		projectedCoordinates[String(cities[i].city)] = projection([cities[i].cx, cities[i].cy]);
	}

	// PLOT CITIES ON MAP
	var circles = svg.append("g")
		.attr("id", "circles")
		.selectAll("circle")
		.data(projectedCoordinates1)
		.enter()
		.append("circle")
		.attr("cx", function(d, i) {

		return projectedCoordinates1[i][0];
	})
		.attr("cy", function(d, i) {
		return projectedCoordinates1[i][1];
	})
		.attr("r", function(d, i) {
		return cities[i].id;
	})
		.attr("id", function(d, i) {
		return cities[i].id;
	})
		.attr("name", function(d, i) {
		return cities[i].city;
	})
		.on("mouseover", function() {
		d3.select(this).style("fill", "iceblue");
	})
		.on("mouseout", function() {
		d3.select(this).style("fill", "steelblue");
	})
		.on("click", function() {});


	var row = listitems.selectAll(".row")
		.data(cities)
		.enter().append("svg:g")
		.attr("class", "row")

	var text = row.append("text").attr("name", function(d, i) {
		return d.city;
	})
		.attr("x", function(d, i) {
		var xcoordinate = 55;
		if (i > 10) {
			xcoordinate = 220
		};
		return xcoordinate
	}).attr("y", function(d, i) {
		return (i % 11 + 1) * line_height;
	}).text(function(d, i) {
		return '  ' + String(d.city);
	}).style("fill", "#999");

	//update(sorted, text, circles, selected, projectedCoordinates);

	var citiesPros = {
		"New York": "The mecca of devastatingly handsome tycoons and swan-necked women. Priced accordingly.",
		"Los Angeles": "When you hop off the plane at LAX with a dream and a cardigan...you discover hordes of platinum blondes plus a growing coke addiction. Also, Asians. So. Many. Asians.",
		"Chicago": "Chicago is shockingly liveable - leafy and skyscrapered, with a former community fundraiser in the White House, so you know there will be good kickbacks.",
		"Orlando": "Orlando is what the world would look like if we all spent our money on what we said we would spend our money on when we were 7.",

		"Miami": "What is there to do in Miami other than drink, party, and go to the beach? Absolutely nothing! And that's why we love it!",
		"Atlanta": "Peachtree Street, the main street in Atlanta, and the site of bonnet stealing, racqueteering, and other assorted antebellum debauchery in Gone with the Wind, is not the only Peachtree street in town. There are 71 others!",
		"Detroit": "The WSJ seems to have it out for Detroit, but there are nice areas of the city! And just outside, there are plenty of pockets of privilege, like Mitt Romney's prep school, Cranbrook Kingsbury, where tuition is $50K a year and Korean enrollment up to 34%.",
		"Philadelphia": "Fun fact: a sub is also called a hoagie.",
		"San Diego": "Gorgeous. Gorgeous. Gorgeous. The girls. The guys. Even dreads look good here.",
		"Houston": "Houston resident George H.W. Bush was once accused of being a Brooks Brothers President. To which he flipped over his tie and responded, \" Nope, J.Press \". H.W., outbroing himself.",
		"Boston": "Boston is unique on the Asians to Athletes ratio because they have Jeremy Lin, who basically overqualifies on both fronts.",
		"San Francisco": "The coldest winter is a San Francisco summer. Keep warm with spiced wine and a new gay best friend.",
		"Baltimore": "Baltimore combines northern efficiency and southern hospitality; the roads are paved, the trains run on time, and your neighbors know your name.",
		"Washington, D.C.": "Home to one of the hopping-est bar scenes in the country. Where do you think all those congressional page scandals got started?",
		"Dallas": "Dallas is the fourth largest metropolitan area in the US. Who knew?!",
		"Tucson": "Tuscon recently hit 39 consecutive days of over 100 degrees. *Shudder*",
		"Las Vegas": "Vegas is hot, dry, rude, garish, and obvious. It's also a showstopper.",
		"Austin": "Austin has a low cost of living and an up-and-coming tech scene. And it's a college town - so there will be, you know, organic food.",
		"Seattle": "Outside of the Bay Area, the best place to live a plush, latted life doing web dev for your roommate's startup.",
		"Minneapolis": "You can buy a 2,000-square-foot house in Minneapolis for $150K. For comparison, in Palo Alto, CA, $150K covers property tax and two gutters.",
		"Portland": "I hear that people in Portland make absinthe from their own compost piles.",
		"Indianapolis": "Drinking Absolut with Hooters girls counts as bottle service in Indianapolis. So obviously, it's cheaper."

	}

	$('svg circle').tipsy({

		html: true,
		fade: true,
		gravity: 'e',
		title: function() {
			var line1 = '<div id="line1" align="left">' + $(this).attr('name') + '</div>';
			var line2 = '<div id = "line2" align="left">' + String(citiesPros[String($(this).attr('name'))]) + '</div>';
			return line1 + line2
		}
	});

	
	var numbering = row.append("text").attr("x", function(d, i) {
		var xcoordinate = 30;
		if (i > 10) {
			xcoordinate = 190;
		};
		return xcoordinate
	}).attr("y", function(d, i) {
		return (i % 11 + 1) * line_height;
	}).text(function(d, i) {
		return (i + 1) + '.   ';
	}).style("fill", "#F8F8F8");
	


	var factors = d3.select("#badges").selectAll("button")
		.data(d3.entries(badgeKeys))
		.enter()
		.append("button")
		.attr("class", "badge")
		.attr("id", function(d) {
		return d.key.substring(0, d.key.length - 13)
	})
		.text(function(d) {
			//console.log(d);
		return d.value
	})
		.on("click", function(d) {
		var badge = d3.select(this);
		console.log(badge)
		if (badge.classed('on')) {
			selected = selected.filter(function(f) {
				return f != d.key
			});
			badge.classed('on', false)
		} else {

			selected.push(d.key)
			badge.classed('on', true)
		}

		//CALL UPDATE FUNCTION HERE
		update(sorted, text, circles, selected, projectedCoordinates, numbering)
	})


}