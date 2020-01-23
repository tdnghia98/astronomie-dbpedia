let sliderFunction = function (sliderID, sliderValueInputID) {
    sliderValue = $(`#${sliderID}`).val() + '%';
    $(`#${sliderValueInputID}`).html(sliderValue);
    $(`#${sliderID}`).on('change input', function () {
        sliderValue = $(`#${sliderID}`).val() + '%';
        $(`#${sliderValueInputID}`).html(sliderValue);
    });
};


function getPlaneteSimilaire() {
    let query = construireRequete();
    const encodedPlaneteSimilaireQuery = buildUrlWithQuery(query);
    var results;
    $.ajax({
        url: encodedPlaneteSimilaireQuery,
        success: result => {
            if (result.results.bindings.length == 0) {
                console.log('No satellites found for this planet');
            }
            results = result.results.bindings;
            completerTablePlaneteSimilaire(results);
        },
        error: err => console.log(err)
    });
    return results;
}

$(function () {
    sliderFunction('volumeSlider', 'volumeValue');
    sliderFunction('temperatureSlider', 'temperatureValue');
    sliderFunction('vitesseSlider', 'vitesseValue');

    $('#searchSimilaireBouton').on('click', onChercherPlaneteSimilaire);
});

let onChercherPlaneteSimilaire = () => {
    $('#table-planete-similaire>thead').show();
    getPlaneteSimilaire();

};

function completerTablePlaneteSimilaire(results) {
    console.log(results);
    for (let planet of results) {
        const planetName = planet.planetName.value;
        console.log(planetName);
        $('#planete-similaire-table-headrow').append(`<th>${planetName}</th>`);

    }
}

let construireRequete = function () {
    let volumeSliderValue = $('#volumeSlider').val() / 100;
    let temperatureSliderValue = $('#temperatureSlider').val() / 100;
    let speedSliderValue = $('#vitesseSlider').val() / 100;

    let neptuneVolume = 57.74;
    let neptuneTemperature = 55.0;
    let neptuneSpeed = 5.43;
    let filter = `FILTER(LANGMATCHES(LANG(?planetName), "EN")).`;
    let predicates = ``;

    if ($('#volumeCheckbox').is(':checked')) {
        predicates += `
    ?planet dbo:volume ?planetVolume.`;
        filter += ` 
    FILTER(ABS((?planetVolume - ${neptuneVolume})/${neptuneVolume}) < ${volumeSliderValue}).`;
    }

    if ($('#temperatureCheckbox').is(':checked')) {
        predicates += `
    ?planet dbo:meanTemperature ?planetTemp.`;
        filter += ` 
      FILTER(ABS((?planetTemp - ${neptuneTemperature})/${neptuneTemperature}) < ${temperatureSliderValue}).`;
    }

    if ($('#vitesseCheckbox').is(':checked')) {
        predicates += `
    ?planet dboPlanet:averageSpeed ?planetSpeed.`;
        filter += ` 
        FILTER(ABS((xsd:double(?planetSpeed) - ${neptuneSpeed})/${neptuneSpeed}) < ${speedSliderValue}).`;
    }
    // Terminer les predicats
    let requete = `
        PREFIX dboPlanet: <http://dbpedia.org/ontology/Planet/>
      
        SELECT 
        ?planetName 
        ?planetVolume 
        ?planetSpeed 
        (AVG(?planetTemp) as ?temp)
        WHERE {
        ?planet rdf:type dbo:Planet;
        rdfs:label ?planetName.
        ${predicates}
        ${filter}}`;
    return requete;
};