/**Examples for the purpose of demo
 An example generator*/
example_gen = function(etype){
    var data;
    if(etype == "companies"){
	data = {filters:["http://www.w3.org/1999/02/22-rdf-syntax-ns#type:::http://dbpedia.org/ontology/Company","http://dbpedia.org/property/industry:::http://dbpedia.org/resource/Software"], clue:"http://dbpedia.org/ontology/thumbnail", answer:"http://www.w3.org/2000/01/rdf-schema#label"};
    }
    if(data){
	data.filters.map(function(d,i){
		var fs = d.split(':::');
		$("#filters").append('<div class="filter tag" data-text="'+d+'">'+ fs[0] + ' - ' + fs[1] + ' <button class="glyphicon glyphicon-remove remove"></button></div>');
	    });
	var a = data.answer;
	var c = data.clue;
	$("#answer").attr('data-text',a);$("#answer").html(a + " <button class='glyphicon glyphicon-remove remove'></button>");
	$("#clue").attr('data-text',c);$("#clue").html(c + "<button class='glyphicon glyphicon-remove remove'></button>");
    }
    $("#select_zone").show();
};

$(".example").click(function(){
	example_gen($(this).attr("data-label"));
    });