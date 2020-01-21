function autoComplete() {
  var baseURL = 'https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';

  var autoCompleteQuery = `
  SELECT DISTINCT ?planet ?label
  WHERE {
  ?planet a dbo:Planet.
  ?planet foaf:name ?label.
  }
  LIMIT 1000
  `;
  var queryParams = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';
  var autoCompleteQuery = baseURL + encodeURI(autoCompleteQuery) + queryParams;

  $.ajax({
    dataType: "jsonp",
    url: autoCompleteQuery,
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
      })

      for (let i = 0; i < planetNames.length; i++) {
        var node = document.createElement("OPTION");
        var textnode = document.createTextNode(planetNames[i]);
        node.appendChild(textnode);
        document.getElementById("planetNames").appendChild(node);
      }
    },
    error: function(error) {
      console.log("Error during autoComplete")
      console.log(error)
    }
  })
}
