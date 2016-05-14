/**Examples for the purpose of demo
 An example generator*/
example_gen = function(etype){
    var data;
    if(etype == "companies"){
	data = {filters:["http://www.w3.org/1999/02/22-rdf-syntax-ns#type:::http://dbpedia.org/ontology/Company","http://dbpedia.org/property/industry:::http://dbpedia.org/resource/Software"], clue:"http://dbpedia.org/ontology/thumbnail", answer:"http://www.w3.org/2000/01/rdf-schema#label"};
    }
    else if(etype == "brain"){
	data = {filters:["http://www.w3.org/1999/02/22-rdf-syntax-ns#type:::http://dbpedia.org/ontology/Brain"], clue:"http://dbpedia.org/ontology/abstract", answer: "http://www.w3.org/2000/01/rdf-schema#label"};
    }
    else if(etype == "mountains"){
	data = {filters:["http://www.w3.org/1999/02/22-rdf-syntax-ns#type:::http://dbpedia.org/ontology/Mountain","http://www.w3.org/1999/02/22-rdf-syntax-ns#type:::http://dbpedia.org/class/yago/SacredMountains"],clue:"http://dbpedia.org/ontology/thumbnail", answer:"http://www.w3.org/2000/01/rdf-schema#label"};    
    }
    else if(etype == "birds-1"){
	data = {filters:["http://purl.org/dc/terms/subject:::http://dbpedia.org/resource/Category:Bird_families"], clue:"http://dbpedia.org/ontology/abstract", answer:"http://www.w3.org/2000/01/rdf-schema#label"};
    }
    else if(etype == "birds-2"){
	data = {filters:["http://purl.org/dc/terms/subject:::http://dbpedia.org/resource/Category:Bird_families"], clue:"http://dbpedia.org/ontology/thumbnail", answer:"http://www.w3.org/2000/01/rdf-schema#label"};
    }
    else if(etype == "flags"){
	data = {filters:["http://www.w3.org/1999/02/22-rdf-syntax-ns#type:::http://dbpedia.org/class/yago/NationalFlags"], clue:"http://dbpedia.org/ontology/thumbnail", answer:"http://www.w3.org/2000/01/rdf-schema#label"};
    }
    else if(etype == "world_heritage_india"){
	data = {filters:["http://www.w3.org/1999/02/22-rdf-syntax-ns#type:::http://dbpedia.org/class/yago/YagoGeoEntity","http://www.w3.org/1999/02/22-rdf-syntax-ns#type:::http://dbpedia.org/class/yago/WorldHeritageSitesInIndia"],clue:"http://dbpedia.org/ontology/thumbnail", answer:"http://www.w3.org/2000/01/rdf-schema#label"};
    }
    
    if(data){
	$("#filters .filter").remove();
	data.filters.map(function(d,i){
		var fs = d.split(':::');
		$("#filters").append('<div class="filter tag" data-text="'+d+'">'+ fs[0] + ' - ' + fs[1] + ' <button class="glyphicon glyphicon-remove remove"></button></div>');
	    });
	var a = data.answer;
	var c = data.clue;
	$("#answers").html("<div class='tag' id='answer' data-text='"+a+"'>Answer -- " + a + " <button class='glyphicon glyphicon-remove remove'></button></div>");
	$("#clues").html("<div class='tag' id='clue' data-text='"+c+"'>Clue -- " + c + "<button class='glyphicon glyphicon-remove remove'></button></div>");
    }
    $("#select_zone").show();
    $(".remove").click(function(){$(this).parent().remove();});
    $("#generate").click();
};

$(".example").click(function(){
	example_gen($(this).attr("data-label"));
    });