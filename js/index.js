$.ajaxSetup({
	error: function(xhr, status, error) {
	    console.log("An AJAX error occured: " + status + "\nError: " + error);
	}
    });

/**Routine to handle the response from Wiki's api.php*/
function format_result (item) {
    var markup = "Searching...";
    if(item.id){
	markup = "<div class='select2-result-repository__label'>" + item.label + "</div>";
	
	if (item.description) {
	    markup += "<div class='select2-result-repository__description'>" + item.description + "</div>";
	}
	markup += "<div class='select2-result-repository clearfix'>" +
	    "<div class='select2-result-repository__id'>" + item.id + "</div>";
    }
    
    return markup;
}

function format_result_selection (item) {
    if(!item.id || item.id==-1 || !item.label)
	return item.text;
    else
	return item.label+" ("+item.id+")";
}
    
var API_ENDPOINT = 'https://www.wikidata.org/w/api.php';
var LANGUAGE = 'en';

var SEARCH_ENTITES = {
    action: 'wbsearchentities',
    format: 'json',
    continue: 0,
    language: LANGUAGE,
    uselang: LANGUAGE
};

init=function(){    
    qsels = ["select[data-select2!='done'][data-type='prop']","select[data-select2!='done'][data-type='obj']"];
    qsels.map(function(qsel, qi){
	    if(qi == 0)
		ph = 'Predicate';
	    else
		ph = 'Object';
	    $(qsel).select2({
		    placeholder: ph,
		    allowClear: true,
			ajax: {
			url: "https://www.wikidata.org/w/api.php",
			    dataType: 'jsonp',
			    delay: 250,
			    data: function(params){
			    var query = JSON.parse(JSON.stringify(SEARCH_ENTITES));
			    
			    query.search = params.term;
			    if(qi == 0)
				query.type = 'property';
			    return query; 
			},
			    processResults: function (data, params) {
			    params.page = params.page || 1;
			    return {
				results: data.search,
				    pagination: {
				    more: (params.page * 30) < data.total_count
					}
			    };
			},
			    cache: true
			    },
			escapeMarkup: function (markup) { return markup; }, 
			minimumInputLength: 1,
			templateResult: format_result,
			templateSelection: format_result_selection
			});
	});
}   
 
    init();

$("#filter-add").click(function(){
	//make sure to mark the existing select tags so that we do not re-initiate select2 on them
	$("select").attr("data-select2","done");
	$(".filters").append(
			     '<div class="form-group filter">'+
			     '<select type="text" class="suggestion" data-type="prop" required><option value="-1" selected="selected" disabled="disabled">Predicate</option></select>'+
			     '<select type="text" class="suggestion" data-type="obj"><option value="-1" selected="selected" disabled="disabled">Object</option></select>');
	init();
    });

$(".suggestion").autocomplete({
	appendTo: ".suggest-box",
	    minLength: 2,
	    source: function(request,response){
	    sgsts=[];
	    
	    json=$.get(
		       function(data, status){
			   data.search.map(function(d){sgsts.push(d.label+"\n"+d.description+"\n"+d.id);});
			   response(sgsts);
		       },'jsonp')  
		}
    });

/**
 Generates the SPARQL query for the options selects
 filters - are the list of filters that generate a list of items to work on
 clue - is typically a property of the item shown as a cue to the answer
 answer - is again a property of the item or the label of the item itself that is to be guessed.
*/
SPARQLQueryGenerator = function(clue, answer, filters){
    q = "SELECT ?x ?a ?c WHERE{\n";
    for(var key in filters){
	val = filters[key];    
	q += "?x wdt:"+key+" wd:"+val+" .\n";
    }
    if (answer.indexOf(':') == -1)
	q += "?x wdt:"+answer+" ?a .\n";
    else
	//typically, such a property is language related description of some sort; such as rdfs:label
	q += "?x "+answer+" ?a filter (lang(?a) = 'en') .\n";
    
    if(clue.indexOf(':') == -1)
	q += "?x wdt:"+clue+" ?c .\n";
    else
	q += "?x "+clue+" ?c filter (lang(?c) = 'en') .\n";
    q += "}\n";
    q += "LIMIT 20";
    return q;
};

toggle_view = function(type){
    $("#grid_view").css("display","none");
    $("#table_view").css("display","none");
    if(type == 'image'){
	$("#grid_view").show();
	$('.grid').masonry({
	    // options
	    itemSelector: '.grid-item',
	    columnWidth: 200
	});
    }
    else if(type == 'table')
	$("#table_view").show();
};

render_table = function(data){
    if(!data || !data.results || !data.results.bindings){
	console.warn("Cannot generate table since the data is unexpected!");
	return;
    }
    
    html = "<table class='table table-striped'>"
    results = data["results"]["bindings"];
    html += "<thead><tr><th>ID</th><th>Clue</th><th>Answer</th></thead>";
    html += "<tbody>";
    results.map(function(obj){
	    vals = [obj.x.value, obj.c.value, obj.a.value];
	    html += "<tr>";
	    vals.map(function(val){
		    html += "<td>";
		    if(val.startsWith("http://") || val.startsWith("https://")){
			name = val.substring(val.lastIndexOf('/')+1,val.length);
			name = decodeURI(name);
			html += "<a href='"+val+"' target='_blank'>"+name+"</a>";
		    }
		    else
			html += val;
		    
		    html += "</td>";
		});
	    html += "</tr>";
	});
    html += "</tbody>";
    html += "</table>";
    $("#table_view").html(html);
};

render_image_grid = function(data){
    if(!data || !data.results || !data.results.bindings){
	console.warn("Cannot generate table since the data is unexpected!");
	return;
    }
    results = data["results"]["bindings"];
    var html = "<div class='row'>"; 
    results.map(function(item,i){
	    if(i>0 && i%3==0)
		html += "</div><div class='row'>";
	    var imuri = item.c.value; 
	    var name = decodeURI(imuri.substring(imuri.lastIndexOf('/')+1, imuri.length));
	    html += "<div class='col-sm-4'>";
	    html += "<a href='"+item.c.value+"?width=1000' target='_blank'>";
	    html += "<img src="+item.c.value+"?width=300></img>";
	    html += "</a>";
	    html += "<div>Answer: "+item.a.value+"</div>";
	    html += "<div>Clue: "+name+"</div>";
	    html += "<div><a href='https://www.wikidata.org/wiki/"+ item.x.value +"' target='_blank'>ID: " + item.x.value + "</div>";
	    html += "</div>";
	});
    html += "</div>";
    $("#grid_view").html(html);
};

/**Selects and enables the appropriate view type based on data*/
pick_and_display_view = function(data){
    if(data["results"] && data["results"]["bindings"]){
     	$("#display_panel").show();
	results = data["results"]["bindings"];
	if(results.length>0){
	    render_table(data);
	    render_image_grid(data);
	    var aclue = results[0].c;
	    if(aclue.type=="uri" && aclue.value.match(/.*(jpg|bmp|jpeg|png)$/i))
		toggle_view('image');
	    else
		toggle_view('table');
	}else{
	    $("#table_view").html("No hits found");
	    $("#table_view").show();
	}
    }
}

$("#generate").click(function(){
	filters={};
	$(".filter").each(function(i,d){
		var fs = $(d).find("select");
		var pred = fs[0];
		var obj = fs[1];
		filters[$(pred).val()] = $(obj).val();
	    });
	clue = $("#clue").val();
	answer = $("#answer").val();
	q = SPARQLQueryGenerator(clue, answer, filters);
	console.log("SPARQL Query: "+q);
	alert("SPARQL Query: "+q);
	SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";
	$.ajax({
		url: SPARQL_ENDPOINT,
		data: {
		    query: q,
		    format: 'json'
		},
		dataType: 'json'
	 }).success(function(data, status){
		 pick_and_display_view(data);
	 });

    });