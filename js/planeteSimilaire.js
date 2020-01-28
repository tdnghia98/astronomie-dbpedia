let sliderFunction = function(sliderID, sliderValueInputID) {
    sliderValue = $(`#${sliderID}`).val() + '%';
    $(`#${sliderValueInputID}`).html(sliderValue);
    $(`#${sliderID}`).on('change input', function() {
        sliderValue = $(`#${sliderID}`).val() + '%';
        $(`#${sliderValueInputID}`).html(sliderValue);
    });
};

function getPlaneteSimilaire() {
    emptySimilarPlanetTab();
    $('#resultatPlaneteSimilaire').show();
    let query = construireRequete();
    if (query) {
        const encodedPlaneteSimilaireQuery = buildUrlWithQuery(query);
        var results;
        $.ajax({
            url: encodedPlaneteSimilaireQuery,
            success: result => {
                emptySimilarPlanetTab();
                if (result.results.bindings.length == 0) {
                    console.log('No similar planets found for this criteria');
                }
                results = result.results.bindings;
                completerTablePlaneteSimilaire(results);
            },
            error: err => console.log(err)
        });
        return results;
    }
}

$(function() {
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
        if (!planetName.includes($('#planet-name').text())) {
            var newSimilarPlanet = $('<tr><td>' + planetName + '</td></tr>');
            newSimilarPlanet.click(function() {
                console.log('Redirection vers ' + planetName);
                $('#select2-planet-names').val(planetName);
                $('#select2-planet-names').trigger('change');
                getPlanetInfo();
                window.scrollTo(0, 0);
            });
            console.log(newSimilarPlanet);
            $('#similar-planet-tbody').append(newSimilarPlanet);
        }
    }
}

let construireRequete = function() {
    let volumeSliderValue = $('#volumeSlider').val() / 100;
    let temperatureSliderValue = $('#temperatureSlider').val() / 100;
    let vitesseSliderValue = $('#vitesseSlider').val() / 100;

    let planeteVolume = $('#volume').text();
    let planeteTemperature = $('#moy-temp').text();
    let planeteVitess = $('#speed').text();
    let select = `?planetName`;
    let filter = `FILTER(LANGMATCHES(LANG(?planetName), "EN")).`;
    let predicates = ``;

    if ($('#volumeCheckbox').is(':checked')) {
        if (planeteVolume && !planeteVolume.includes('No')) {
            planeteVolume = planeteVolume.split(' ')[0];
            select += `?planetVolume 
            `;
            predicates += `
        ?planet dbo:volume ?planetVolume.`;
            filter += ` 
        FILTER(ABS((?planetVolume - ${planeteVolume})/${planeteVolume}) < ${volumeSliderValue}).`;
        } else {
            console.log('Null Volume');
        }
    }

    if ($('#temperatureCheckbox').is(':checked')) {
        if (planeteTemperature && !planeteTemperature.includes('No')) {
            planeteTemperature = planeteTemperature.split(' ')[0];
            select += `(AVG(?planetTemp) as ?temp)
            `;
            predicates += `
        ?planet dbo:meanTemperature ?planetTemp.`;
            filter += ` 
        FILTER(ABS((?planetTemp - ${planeteTemperature})/${planeteTemperature}) < ${temperatureSliderValue}).`;
        } else {
            console.log('Null temp');
        }
    }

    if ($('#vitesseCheckbox').is(':checked')) {
        if (planeteVitess && !planeteVitess.includes('No')) {
            planeteVitess = planeteVitess.split(' ')[0];
            select += `?planetVitesse
            `;
            predicates += `
            ?planet dbo:averageSpeed ?planetVitesse.`;
            filter += ` 
            FILTER(ABS((xsd:double(?planetVitesse) - ${planeteVitess})/${planeteVitess}) < ${vitesseSliderValue}).`;
        } else {
            console.log('Null vitess');
        }
    }

    if (predicates) {
        let requete = `
            PREFIX dboPlanet: <http://dbpedia.org/ontology/Planet/>
          
            SELECT 
            ${select}
            WHERE {
            ?planet rdf:type dbo:Planet;
            rdfs:label ?planetName.
            ${predicates}
            ${filter}}`;
        return requete;
    } else {
        console.log('No predicate');
        return null;
    }
};

let preloadSimilarPlanetsCoeff = function(planeteInfos) {
    let runResearch = false;

    if (planeteInfos[0].volume) {
        let planeteVolume = planeteInfos[0].volume.value;

        if (planeteVolume) {
            $('#volumeCheckbox').removeAttr('disabled');
            $('#volumeSlider').removeAttr('disabled');

            $('#volumeCheckbox').prop('checked', true);

            runResearch = true;
        }
    }

    if (planeteInfos[0].moyTemperature) {
        let planeteTemperature = planeteInfos[0].moyTemperature.value;

        if (planeteTemperature) {
            console.log('Enabling temperature criteria');
            $('#temperatureCheckbox').removeAttr('disabled');
            $('#temperatureSlider').removeAttr('disabled');

            $('#temperatureCheckbox').prop('checked', true);

            runResearch = true;
        }
    }

    if (planeteInfos[0].speed) {
        let planeteVitess = planeteInfos[0].speed.value;

        if (planeteVitess) {
            $('#vitesseCheckbox').removeAttr('disabled');
            $('#vitesseSlider').removeAttr('disabled');

            $('#vitesseCheckbox').prop('checked', true);

            runResearch = true;
        }
    }

    if (runResearch) {
        onChercherPlaneteSimilaire();
    }
};

function disableSimilarPlanetInterface() {
    $('.similarCb').attr('disabled', true);
    $('.similarSlider').attr('disabled', true);
}

function resetSimilarPlanetInterface() {
    $('#resultatPlaneteSimilaire').hide();
    emptySimilarPlanetTab();
    $('.similarCb').prop('checked', false);
    $('.similarSlider').val(50);
    $('.sliderValue').html('50%');
}

function emptySimilarPlanetTab() {
    $('#similar-planet-tbody').html('');
}
