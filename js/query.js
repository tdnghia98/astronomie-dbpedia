function parsePlanetName() {
  //Mettre tout en minuscule et capitalizer le nom de la planète e
  let planetName = document.getElementById("planet-input").value;
  planetName = planetName.toLowerCase();
 // planetName = planetName.charAt(0).toUpperCase() + planetName.slice(1);
  planetName.replace(/\(/g,'');
  planetName.replace(/\)/g,'');
  return planetName;
}

//Helper function to insert the results in a table format
function insertGeneralInfoIntoTable(result) {
  let table = document.getElementById("planet-info-table")
  let fields = result.results.bindings;
  let planetName = "";
  let volume = "";
  let minTemp = "";
  let maxTemp = "";
  let moyTemp = "";
  let surface = "";
  let gravity = "";
  let pression = "";
  let abstract = "";
  let speed = "";

  // [0] => Accept only the first result?
  if (fields[0].name) {
    planetName = fields[0].name.value;
  } else {
    planetName = "No name found"
  }

  if (fields[0].volume) {
    volume = fields[0].volume.value+ " times the Earth's volume";
  } else {
    volume = "No volume found"
  }

  if (fields[0].minTemperature) {
    minTemp = fields[0].minTemperature.value + " K";
  } else {
    minTemp = "No minimum temperature found";
  }

  if (fields[0].maxTemperature) {
    maxTemp = fields[0].maxTemperature.value + " K";
  } else {
    maxTemp = "No maximum temperature found";
  }

  if (fields[0].moyTemperature) {
    moyTemp = fields[0].moyTemperature.value + " K";
  } else {
    moyTemp = "No mean temperature found";
  }

  if (fields[0].masse) {
    mass = fields[0].masse.value + " times the Earth's mass";
  } else {
    mass = "No mass found";
  }

  if (fields[0].surface) {
    surface = fields[0].surface.value+ " times the Earth's surface";
  } else {
    surface = "No surface area found";
  }

  if (fields[0].gravite) {
    gravity = fields[0].gravite.value+ " times the Earth's gravity";
  } else {
    gravity = "No gravity information found";
  }

  if (fields[0].pression) {
    pression = fields[0].pression.value+ " times the Earth's pressure";
  } else {
    pression = "No pressure info found";
  }
  if (fields[0].abstract) {
    abstract = fields[0].abstract.value.substr(0, 800);
  } else {
    abstract = "No abstract found";
  }
  if (fields[0].speed) {
    speed = fields[0].speed.value + " km/h";
  } else {
    speed = "No speed found";
  }

  if (fields[0].speed) {
    speed = fields[0].speed.value + " km/h";
  } else {
    speed = "No angular speed found";
  }

  document.getElementById('planet-name').innerHTML = planetName;
  document.getElementById('abstract').innerHTML = abstract;
  document.getElementById('volume').innerHTML = volume;
  document.getElementById('min-temp').innerHTML = minTemp;
  document.getElementById('max-temp').innerHTML = maxTemp;
  document.getElementById('moy-temp').innerHTML = moyTemp;
  document.getElementById('mass').innerHTML = mass;
  document.getElementById('surface').innerHTML = surface;
  document.getElementById('gravity').innerHTML = gravity;
  document.getElementById('pression').innerHTML = pression;
  document.getElementById('speed').innerHTML = speed;

  preloadSimilarPlanetsCoeff(fields);
}

function emptyTable() {
  $('#planet-info-table tbody tr td:nth-child(2)').innerHTML = `<div class="spinner-border text-primary" role="status">
  <span class="sr-only">Loading...</span>
</div>`;
  $('#thumbnail').attr('src', '');
  $('#abstract').innerHTML = '';
}

//Helper function to build query
function buildUrlWithQuery(query) {
  const baseURL = 'http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
  const queryParams = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';
  const encodedQuery = baseURL + encodeURI(query) + queryParams;

  return encodedQuery;
}

function getPlanetInfo() {
  disableSimilarPlanetInterface();
  resetSimilarPlanetInterface();
  emptyTable();
  getPlanetGeneralInfo();
  getPlanetComposition();
  getThumbnailImage();
  getSatelliteInfo();
  getDiscoveryDate();
}

function getPlanetGeneralInfo() {
  const planetName = parsePlanetName();

  const generalInfoQuery = `
  SELECT DISTINCT ?name ?volume AVG(?minTemp) AS ?minTemperature AVG(?maxTemp) AS ?maxTemperature AVG(?moyTemp) AS ?moyTemperature ?masse ?speed ?surface ?gravite ?pression ?abstract WHERE {
  	?planet a dbo:Planet;
   	rdfs:label ?label.
    OPTIONAL {
    	?planet dbo:minimumTemperature ?minTemp.
  	}
  	OPTIONAL {
    	?planet dbo:maximumTemperature ?maxTemp.
  	}
  	OPTIONAL {
    	?planet dbo:meanTemperature ?moyTemp.
  	}
  	OPTIONAL {
    	?planet dbo:volume ?volume.
  	}
  	OPTIONAL {
    	?planet dbo:averageSpeed ?speed.
  	}
  	OPTIONAL {
    	?planet dbp:mass ?masse.
  	}
  	OPTIONAL {
    	?planet dbp:surfaceArea ?surface.
  	}
  	OPTIONAL {
    	?planet dbp:surfaceGrav ?gravite.
  	}
  	OPTIONAL {
    	?planet dbp:surfacePressure ?pression.
  	}
    OPTIONAL {
    	?planet dbo:abstract ?abstract.
      FILTER (langMatches( lang(?abstract), "EN" ) ).
  	}
  	OPTIONAL {
    	?planet foaf:name ?name.
    	FILTER(strStarts(lcase(?name), '${planetName}')).
  	}
    FILTER(strStarts(lcase(?label), '${planetName}')).
    FILTER(strEnds(lcase(?label), '${planetName}')).
}
`;
  const encodedGeneralInfoQuery = buildUrlWithQuery(generalInfoQuery);

  //Ajax call to DBPedia
  $.ajax({
    url: encodedGeneralInfoQuery,
    success: function (result) {
      console.log(result)
      if (result.results.bindings.length == 0) {
        console.log("No results found for this planet")
      }
      insertGeneralInfoIntoTable(result)
    },
    error: function (error) {
      console.log(error)
    }
  })
}

function getPlanetComposition() {
  let planetName = parsePlanetName();
  planetName = planetName.charAt(0).toUpperCase() + planetName.slice(1);
  const planetCompositionQuery = `
  SELECT DISTINCT ?atmosphere WHERE {
  	?planet a dbo:Planet;
   	rdfs:label ?label.
  	OPTIONAL {
    	?planet dbp:atmosphereComposition ?atmosphere.
  	}
  	OPTIONAL {
    	?planet foaf:name ?name.
    	FILTER(strStarts(?name, '${planetName}')).
  	}
    FILTER(strStarts(?label, '${planetName}')).
}`

  const encodedPlanetCompositionQuery = buildUrlWithQuery(planetCompositionQuery);

  $.ajax({
    url: encodedPlanetCompositionQuery,
    success: function (result) {
      if (result.results.bindings.length == 0) {
        console.log("No composition results found for this planet")
      }
      let atmospheres = result.results.bindings;
      let composition = "";
      atmospheres = checkAtmosphere(atmospheres)
      if (atmospheres !== false) {
        atmospheres.forEach(function show(key, values) {
          try { // Try because DBPedia doesn't send consistent data, so type might not be present
            getLabelFromUri(values, function(gaz){
              key = key.substr(2, key.length);
              composition = composition + (composition !== '' ? ', ' : '') + gaz + (key !== '' ? ': ' + key : '');
              document.getElementById("composition").innerHTML = composition;
            });
          } catch (e) {

          }
        });
      }
    else {
      document.getElementById("composition").innerHTML = "No composition info found";
    }    },
    error: function (error) {
      console.log(error)
    }
  })
}

function checkAtmosphere(atmospheres) {
  // remove the empty line
  var i = 0;
  try {
    var nbUri = 0;
    var nbLiteral = 0;
    var arrayUri = [];
    var arrayLiteral = [];
    // Separate Uri and Literal
    for (var i= 0; i < atmospheres.length; i++) {
      if (atmospheres[i].hasOwnProperty('atmosphere')) {
        if (atmospheres[i].atmosphere.type === "uri") {
          nbUri++;
          arrayUri.push(atmospheres[i].atmosphere.value)
        } else if (atmospheres[i].atmosphere.type === "typed-literal"){
          nbLiteral++;
          arrayLiteral.push(atmospheres[i].atmosphere.value)
        }
      }
    }

    // return gaz matched with litteral if there are as many uri and literal
    var mapGaz = new Map();
    if (nbUri>0) {
      if (nbUri === nbLiteral){
        for (i = 0; i < nbUri; i++) {
          mapGaz.set(arrayUri[i], arrayLiteral[i])
        }
      } else {
        for (i = 0; i < nbUri; i++) {
          mapGaz.set(arrayUri[i], '')
        }
      }
    } else {
      return false;
    }
    return mapGaz;

  } catch(e) {
    return false;
  }
}

// Function qui permet de récupérer le label depuis une valeur retournée sous forme d'uri
function getLabelFromUri(uri, callback) {
  var baseURL = 'https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
  var queryParams = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';

  var uriToLabelQuery =
  `select  ?label
  where {
          <${uri}> rdfs:label ?label .
    FILTER (langMatches( lang(?label), "EN" ) )
        }
  LIMIT 1`

  var encodeduriToLabelQuery = baseURL + encodeURI(uriToLabelQuery) + queryParams;
  try {
    $.ajax({
      url: encodeduriToLabelQuery,
      success: function(result) {
        if (result.results.bindings.length == 0) {
          console.log("No results found for this planet")
        }
        callback.call(this, result.results.bindings[0].label.value);
      },
      error: function(error) {
        console.log(error)
      }
    })
  } catch(e) {
    console.log(e);
  }
}

function getThumbnailImage() {
	let planetName = parsePlanetName();
	planetName = planetName.charAt(0).toUpperCase() + planetName.slice(1);

	const encodedThumbnailQuery = "https://query.wikidata.org/sparql?query=SELECT%20%3Fplanet%20%3FplanetLabel%20%3Fimage%20%3Flieu%20%3FlieuLabel%20WHERE%20%7B%0A%20%20%3Fplanet%20wdt%3AP18%20%3Fimage%3B%0A%20%20%20%20rdfs%3Alabel%20%3FplanetLabel%3B%0A%20%20%20%20wdt%3AP276%20wd%3AQ7879772.%0A%20%20FILTER(STRSTARTS(%3FplanetLabel%2C%20%22" + planetName + "%22))%0A%7D&format=json";

	//Ajax call to DBPedia
	$.ajax({
	  url: encodedThumbnailQuery,
	  success: function(result) {
		if (result.results.bindings.length == 0) {
		  console.log("No thumbnail found for this planet")
		}
		console.log(result)
		console.log(result.results.bindings[0].image.value);
		$('#thumbnail').attr('src', result.results.bindings[0].image.value)
	  },
	  error: function(error) {
		console.log(error)
	  }
	})
  }

function getSatelliteInfo() {
  const planetName = parsePlanetName();
  var satelliteQuery;
  if (planetName != "Earth") {
    satelliteQuery = `
    SELECT ?planet ?labelPlanet ?sat ?name
    WHERE {

    ?sat dbp:satelliteOf ?planet .
    ?sat foaf:name ?name .
    ?planet foaf:name ?labelPlanet .

    FILTER (contains(lcase(?labelPlanet),"${planetName}"))

    }
    `
  } else {
    satelliteQuery = `
SELECT ?planet ?sat ?name
 WHERE
   { ?sat dbp:satelliteOf ?planet .
     ?sat foaf:name ?name .
       FILTER ( contains(str(?planet), 'Earth') ).
       FILTER ( datatype(?planet) = rdf:langString ).
  }
    `
  }

  const encodedSatelliteQuery = buildUrlWithQuery(satelliteQuery);

  $.ajax({
    url: encodedSatelliteQuery,
    success: function (result) {
      console.log("result");
      console.log(result);
      if (result.results.bindings.length === 0) {
        console.log("No satellites found for this planet");
        document.getElementById("satellites").innerHTML = "No satellites found";
      }
      //Add data to table
      let results = result.results.bindings;
      if (results.length !== 0) {
        for (var i = 0; i < results.length; i++) {
          let satelliteName = results[i].name.value;
          var nodeSat = $("<span> <b>"+satelliteName+"</b><br> </span>");

          nodeSat.click(function(){
            console.log("Redirection vers " + satelliteName);
            $('#planet-input').val(satelliteName);
            getPlanetInfo();
            window.scrollTo(0,0);
          });


         $("#satellites").append(nodeSat);

        }
        //document.getElementById("satellites").innerHTML = satellites;
      }
    },
    error: function (error) {
      console.log(error)
    }
  })
}

function getDiscoveryDate() {
  const planetName = parsePlanetName();
  const discoveryDateQuery = `
  SELECT ?planet ?label ?date
  WHERE {

  ?planet a dbo:Planet.
  ?planet dbo:discovered ?date.
  ?planet foaf:name ?label.

  filter(contains(lcase(?label),"${planetName}"))
  }
  ORDER BY ASC(?date)
  `;
  const encodedDiscoveryDateQuery = buildUrlWithQuery(discoveryDateQuery);

  $.ajax({
    url: encodedDiscoveryDateQuery,
    success: function (result) {
      console.log(result)
      let date = "No discovery date information found for this planet";
      if (result.results.bindings.length > 0){
        if (result.results.bindings[0].date.value) {
          date = result.results.bindings[0].date.value
        }
      }
      document.getElementById("discovery-date").innerHTML = date;
    },
    error: function (error) {
      console.log(error)
    }
  })

}
