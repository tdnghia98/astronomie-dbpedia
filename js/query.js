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
  let planetName = "";
  let volume = "";
  let minTemp = "";
  let maxTemp = "";
  let moyTemp = "";
  let surface = "";
  let gravity = "";
  let pression = "";

  // [0] => Accept only the first result?
  if (fields[0].name) {
    planetName = fields[0].name.value;
  } else {
    planetName = "No name found"
  }

  if (fields[0].volume) {
    volume = fields[0].volume.value;
  } else {
    volume = "No volume found"
  }

  if (fields[0].minTemperature) {
    minTemp = fields[0].minTemperature.value;
  } else {
    minTemp = "No minimum temperature found";
  }

  if (fields[0].maxTemperature) {
    maxTemp = fields[0].maxTemperature.value;
  } else {
    maxTemp = "No maximum temperature found";
  }

  if (fields[0].moyTemperature) {
    moyTemp = fields[0].moyTemperature.value;
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
  emptyTable();
  getPlanetGeneralInfo();
  getPlanetComposition();
  getThumbnailImage();
  getSatelliteInfo();
}

function getPlanetGeneralInfo() {
  let planetName = parsePlanetName();
  var baseURL = 'https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
  var queryParams = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';

  //Queries definition
  var generalInfoQuery = `
  SELECT DISTINCT ?name ?volume AVG(?minTemp) AS ?minTemperature AVG(?maxTemp) AS ?maxTemperature AVG(?moyTemp) AS ?moyTemperature ?masse ?speed ?surface ?gravite ?pression WHERE {
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
    	?planet foaf:name ?name.
    	FILTER(strStarts(?name, '${planetName}')).
  	}
    FILTER(strStarts(?label, '${planetName}')).
}
`

  var encodedGeneralInfoQuery = baseURL + encodeURI(generalInfoQuery) + queryParams;

  //Ajax call to DBPedia
  $.ajax({
    url: encodedGeneralInfoQuery,
    success: function(result) {
      if (result.results.bindings.length == 0) {
        console.log("No results found for this planet")
      }
      insertGeneralInfoIntoTable(result)
    },
    error: function(error) {
      console.log(error)
    }
  })
}

function getPlanetComposition() {
  let planetName = parsePlanetName();
  var baseURL = 'https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
  var queryParams = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';

  var planetCompositionQuery = `
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

  var encodedPlanetCompositionQuery = baseURL + encodeURI(planetCompositionQuery) + queryParams;

  $.ajax({
    url: encodedPlanetCompositionQuery,
    success: function(result) {
      if (result.results.bindings.length == 0) {
        console.log("No results found for this planet")
      }
      let atmospheres = result.results.bindings;
      console.log(atmospheres)
      let composition = "";
      for (var i = 0; i < atmospheres.length; i++) {
        try { // Try because DBPedia doesn't send consistent data, so type might not be present
          if (atmospheres[i].atmosphere.type === "uri") {
            //Parse value to get gas name
            composition = composition + atmospheres[i].atmosphere.value.split('/').slice(-1).pop() + ", "
          }
        } catch (e) {

        }
      }
      composition = composition.substring(0, composition.length - 2);
      document.getElementById("composition").innerHTML = composition;
    },
    error: function(error) {
      console.log(error)
    }
  })

}

function getThumbnailImage() {
  let planetName = parsePlanetName();
  var baseURL = 'https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
  var queryParams = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';

  var thumbnailQuery = `
  select ?name ?thumbnail where {
  {
    ?planet rdf:type dbo:Planet ;
    dbo:thumbnail ?thumbnail ;
    rdfs:label ?name .
  }
  UNION
  {
    ?planet rdf:type dbo:Star ;
    dbo:thumbnail ?thumbnail ;
    rdfs:label ?name .
  }
  FILTER (langMatches(lang(?name), "EN"))
  FILTER (contains(?name, "${planetName}"))
}`

  var encodedThumbnailQuery = baseURL + encodeURI(thumbnailQuery) + queryParams;
  /*
    //Ajax call to DBPedia
    $.ajax({
      url: encodedThumbnailQuery,
      success: function(result) {
        if (result.results.bindings.length == 0) {
          console.log("No thumbnail found for this planet")
        }
        console.log(result)
      },
      error: function(error) {
        console.log(error)
      }
    })
  */
}

function getSatelliteInfo() {
  let planetName = parsePlanetName();
  var baseURL = 'https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
  var queryParams = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';
  var satelliteQuery;
  if (planetName != "Earth") {
    satelliteQuery = `
    select ?planet ?labelPlanet ?sat ?name
    where {

    ?sat dbp:satelliteOf ?planet .
    ?sat foaf:name ?name .
    ?planet foaf:name ?labelPlanet .

    filter (contains(?labelPlanet,"${planetName}"))

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

  const encodedSatelliteQuery = baseURL + encodeURI(satelliteQuery) + queryParams;

  $.ajax({
    url: encodedSatelliteQuery,
    success: function(result) {
      if (result.results.bindings.length == 0) {
        console.log("No satellites found for this planet")
      }
      //Add data to table
      let results = result.results.bindings;
      if (results.length != 0) {
        let satellites = "";
        satellites = satellites + results[0].name.value
        for (var i = 1; i < results.length; i++) {
          satellites = satellites + ", " + results[i].name.value;
        }
        document.getElementById("satellites").innerHTML = satellites;
      }
    },
    error: function(error) {
      console.log(error)
    }
  })
}

function emptyTable() {
  document.getElementById('planet-name').innerHTML = "";
  document.getElementById('volume').innerHTML = ""
  document.getElementById('min-temp').innerHTML = ""
  document.getElementById('max-temp').innerHTML = "";
  document.getElementById('moy-temp').innerHTML = ""
  document.getElementById('mass').innerHTML = "";
  document.getElementById('surface').innerHTML = "";
  document.getElementById('gravity').innerHTML = "";
  document.getElementById('pression').innerHTML = "";
  document.getElementById("satellites").innerHTML = "";
}
