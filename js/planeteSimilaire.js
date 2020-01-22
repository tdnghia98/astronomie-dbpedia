let sliderFunction = function(sliderID, sliderValueInputID) {
  sliderValue = $(`#${sliderID}`).val() + '%';
  $(`#${sliderValueInputID}`).html(sliderValue);
  $(`#${sliderID}`).on('change input', function() {
    sliderValue = $(`#${sliderID}`).val() + '%';
    $(`#${sliderValueInputID}`).html(sliderValue);
  });

}

$(function() {
  sliderFunction('volumeSlider', 'volumeValue');
  sliderFunction('temperatureSlider', 'temperatureValue');
  sliderFunction('vitesseSlider', 'vitesseValue');

  $('#searchSimilaireBouton').on('click', construireRequete);
});


let construireRequete = function() {
  let volumeSliderValue = $('#volumeSlider').val() / 100;
  let temperatureSliderValue = $('#temperatureSlider').val() / 100;
  let speedSliderValue = $('#vitesseSlider').val() / 100;

  let neptuneVolume = 57.74;
  let neptuneTemperature = 55.0;
  let neptuneSpeed = 5.43;
  let filter = `FILTER(LANGMATCHES(LANG(?planetName), "EN")`;
  let predicates = ``;


  if ($('#volumeCheckbox').is(":checked")) {
    predicates += `?planet dbo:volume ?planetVolume.`;
    filter += ` && (ABS(?planetVolume - ${neptuneVolume})/${neptuneVolume}) < ${volumeSliderValue}`;
  }

  if ($('#temperatureCheckbox').is(":checked")) {

    predicates += `?planet dbo:meanTemperature ?planetTemp.`;
    filter +=
      ` && (ABS(?planetTemp - ${neptuneTemperature})/${neptuneTemperature}) < ${temperatureSliderValue}`;
  }

  if ($('#vitesseCheckbox').is(":checked")) {
    predicates += `?planet dboPlanet:averageSpeed ?planetSpeed.`;
    filter += ` && (ABS(xsd:double(?planetSpeed) - ${neptuneSpeed})/${neptuneSpeed}) < ${speedSliderValue}`;
  }

  // Terminer les predicats
  filter += `).`
  let requete = `SELECT DISTINCT * WHERE {
        ?planet rdf:type dbo:Planet;
        rdfs:label ?planetName;
        ${predicates}
        ${filter}
        }`;
  requete = '';
}
