$(document).ready(function(){
  let slider = document.getElementById("myRange");
  let output = document.getElementById("dateOutput");
  output.value = slider.value;
  autoComplete();

  slider.oninput = function() {
    output.value = this.value;
    autoComplete();
  };

  output.onchange = function() {
    slider.value = output.value;
  };
});


function autoComplete() {
  const baseURL = 'http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
  let slider = document.getElementById("myRange");

  const autoCompleteQuery = `
  SELECT DISTINCT ?planet ?label
  WHERE {
  ?planet a dbo:Planet.
  ?planet foaf:name ?label.
  ?planet dbo:discovered ?date.
  FILTER (?date < "`+slider.value+`-01-01"^^xsd:date)
  }
  LIMIT 3000
  `;
  const queryParams = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';
  const encodedAutoCompleteQuery = baseURL + encodeURI(autoCompleteQuery) + queryParams;

  $.ajax({
    dataType: "jsonp",
    url: encodedAutoCompleteQuery,
    success: function(result) {
      let planets = result.results.bindings;
      var planetNames = [];
      for (let i = 0; i < planets.length; i++) {
        planetNames.push(planets[i].label.value)
      }

      planetNames.sort(function(a, b) {
        if (a < b) { return -1; }
        if (a > b) { return 1; }
        return 0;
      });

      document.getElementById("planetNames").innerHTML = ""; // remove previous planets/children

      for (let i = 0; i < planetNames.length; i++) {
        var node = document.createElement("OPTION");
        var textnode = document.createTextNode(planetNames[i]);
        node.appendChild(textnode);
        document.getElementById("planetNames").appendChild(node);
      }

      document.getElementById('nbObject').innerHTML = planets.length;
    },
    error: function(error) {
      console.log("Error during autoComplete: ")
      console.log(error)
    }
  })
}
