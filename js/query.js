function parsePlanetName() {
  //Mettre tout en minuscule et capitalizer le nom de la planète e
  let planetName = document.getElementById("planet-input").value;
  planetName = planetName.toLowerCase();
  planetName = planetName.charAt(0).toUpperCase() + planetName.slice(1);
  return planetName;
}

//Helper function to insert the results in a table format
function insertGeneralInfoIntoTable(result) {
  let table = document.getElementById("planet-info-table")
  let fields = result.results.bindings
  console.log(result)
  let planetName = "";
  let volume = "";
  let minTemp = "";
  let maxTemp = "";
  let moyTemp = "";
  let surface = "";
  let gravity = "";
  let pression = "";

  // [0] => Accept only the first result?
  if (fields[0].label) {
    planetName = fields[0].label.value;
  } else {
    planetName = "No name found"
  }

  if (fields[0].volume) {
    volume = fields[0].volume.value;
  } else {
    volume = "No volume found"
  }

  if (fields[0].minTemp) {
    minTemp = fields[0].minTemp.value;
  } else {
    minTemp = "No minimum temperature found";
  }

  if (fields[0].maxTemp) {
    maxTemp = fields[0].maxTemp.value;
  } else {
    maxTemp = "No maximum temperature found";
  }

  if (fields[0].moyTemp) {
    moyTemp = fields[0].moyTemp.value;
  } else {
    moyTemp = "No mean temperature found";
  }

  if (fields[0].masse) {
    mass = fields[0].masse.value;
  } else {
    mass = "No mass found";
  }

  if (fields[0].surface) {
    surface = fields[0].surface.value;
  } else {
    surface = "No surface area found";
  }

  if (fields[0].gravite) {
    gravity = fields[0].gravite.value;
  } else {
    gravity = "No gravity information found";
  }

  if (fields[0].pression) {
    pression = fields[0].pression.value;
  } else {
    pression = "No pression info found";
  }

  document.getElementById('planet-name').innerHTML = planetName;
  document.getElementById('volume').innerHTML = volume
  document.getElementById('min-temp').innerHTML = minTemp
  document.getElementById('max-temp').innerHTML = maxTemp;
  document.getElementById('moy-temp').innerHTML = moyTemp
  document.getElementById('mass').innerHTML = mass;
  document.getElementById('surface').innerHTML = surface;
  document.getElementById('gravity').innerHTML = gravity;
  document.getElementById('pression').innerHTML = pression;
}

function getPlanetInfo() {
  let planetName = parsePlanetName();
  var baseURL = 'https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
  var queryParams = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';

  //Queries definition
  var generalInfoQuery = `
  SELECT DISTINCT ?label ?volume ?minTemp ?maxTemp ?moyTemp ?masse ?speed ?surface ?gravite ?pression WHERE {
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
    FILTER(strStarts(?label, '${planetName}')).
}
ORDER BY ASC(?minTemp) LIMIT 1
`

  var encodedGeneralInfoQuery = baseURL + encodeURI(generalInfoQuery) + queryParams;

  //Ajax call to DBPedia
  $.ajax({
    url: encodedGeneralInfoQuery,
    success: function(result) {
      if (result.results.bindings.length == 0) {
        console.log("No results found for this planet")
        return 0
      }
      insertGeneralInfoIntoTable(result)
    },
    error: function(error) {
      console.log(error)
    }
  })

  //Update HTML with info
}
