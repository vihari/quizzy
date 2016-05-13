$.ajaxSetup({
	error: function(xhr, status, error) {
	    console.log("An AJAX error occured: " + status + "\nError: " + error);
	}
    });

append_class_dbpedia = function(item){
    /**
       The only programmatic difference I see between dbo -- clases and dbr resources is that, the former is untyped has zero numbert of classes.
       I don't know how far this can generalize but is the only option now.
    */
   
    if (!item.uri)
	return item.label;
    var uri = item.uri;
    var id = uri.substring(uri.lastIndexOf('/')+1,uri.length);
    var name = uri.substring(uri.lastIndexOf('/')+1,uri.length);
    var dbpedia_name;
    if(item.classes.length == 0)
	dbpedia_name = "dbo:"+name;
    else
	dbpedia_name = "dbr:"+name;
    return dbpedia_name;
};

/**Routine to handle the response from Wiki's api.php*/
function format_result (item) {
    var markup = "Searching...";
    if(item.label){
	var dbpedia_name = append_class_dbpedia(item);
	markup = "<div class='select2-result-repository__id'>" + dbpedia_name + "</div>";
	
	m = item.uri.match
	if (item.description) {
	    var d = item.description;
	    var sd = d.substr(0,d.indexOf('. ')+1);
	    markup += "<div class='select2-result-repository__description'>" + sd + "</div>";
	}
    }    
    return markup;
}

function format_result_selection (item) {
    if(!item.label)
	return item.text;
    else{
	var dbpedia_name = append_class_dbpedia(item);
	return dbpedia_name;
    }
}
    
var SEARCH_API_ENDPOINT = 'http://lookup.dbpedia.org/api/search.asmx/PrefixSearch';//'https://www.wikidata.org/w/api.php';
var LANGUAGE = 'en';
SPARQL_ENDPOINT = "http://dbpedia.org/sparql";//"https://query.wikidata.org/sparql";

var SEARCH_ENTITIES = {
    MaxHits: 5
}

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
    q = "SELECT DISTINCT ?c ?a ?x WHERE{\n";
    for(var key in filters){
	if(!key || !filters[key])
	    continue;
	val = filters[key];
	//Special handling of "instanceOf" type (a) -- a hack!
	if (key != 'a')
	    q += "?x dbo:"+key+" "+val+" .\n";
	else
	    q += "?x "+key+" "+val+" .\n";
    }
    if (answer.indexOf(':') == -1)
	q += "?x "+answer+" ?a .\n";
    else
	//typically, such a property is language related description of some sort; such as rdfs:label
	q += "?x "+answer+" ?a filter (lang(?a) = 'en') .\n";
    
    if(clue.indexOf(':') == -1)
	q += "?x dbo:"+clue+" ?c .\n";
    else
	q += "?x "+clue+" ?c filter (lang(?c) = 'en') .\n";
    q += "}\n";
    q += "LIMIT 200";
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
	    if(aclue.type=="uri" && aclue.value.match(/.*(jpg|bmp|jpeg|png)[\?$]/i))
		toggle_view("image");
	    else
		toggle_view("table");
	}else{
	    $("#table_view").html("No hits found");
	    $("#grid_view").html("No hits found");
	    toggle_view("table");
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
	$.ajax({
		url: SPARQL_ENDPOINT,
		data: {
		    query: q,
		    format: 'application/sparql-results+json'
		},
		dataType: 'json'
	 }).success(function(data, status){
		 pick_and_display_view(data);
	 });

    });

/**
   Renders the table of an instance properties and objects which is used to set the filters, clue and answer (user input)
*/
render_input_table = function(data){
    if(!data || !data.results || !data.results.bindings){
	console.warn("Cannot generate the input table since the data passed is faulty!!");
	return;
    }
    var html = "<thead><tr><th>Select</th><th>Property</th><th>Value</th></tr></thead>";
    html += "<tbody>";
    $.each(data.results.bindings, function(i,item){
	    var basicType = false;
	    //basic types are of the form: http://www.w3.org/2001/XMLSchema#integer -- filter types based on presence of '#'
	    if(item.o.type == 'typed-literal')
		basicType = true;
	    html += "<tr data-literal='" + basicType + "'>";
	    html += "<td><input type='checkbox'/></td>";
	    html += "<td>"+item.p.value+"</td>";
	    html += "<td title='"+item.o.value+"'>"+item.o.value+"</td>";
	    html += "</tr>";
	});
    html += "</tbody>";
    $("#select_zone #table").html(html);
    $("#select_zone").css("display","block");
    init();
}

get_and_render_properties = function(){
    var inst = $("#instance").val();
    var sparql_query = "SELECT ?p ?o {"+inst+" ?p ?o.\n FILTER (regex(?o, 'http://') || (LANG(?o) = 'en')).}";
    alert(sparql_query);
    $.ajax({
	    url: SPARQL_ENDPOINT,
		data:{
		query: sparql_query,
		    format: 'application/sparql-results+json'
		    },
		dataType: 'json'
		}).success(function(data,status){
			render_input_table(data);
		    });
};

initialize_select2 = function(){
    qsels = ["select[data-select2!='done'][data-type='prop']","select[data-select2!='done'][data-type='obj']"];
    qsels.map(function(qsel, qi){
	    if(qi == 0){
		$(qsel).select2({
			placeholder: 'Predicate',
			    data: [],//dboprops,
			    allowClear: true
		    });
	    }
	    else{
		$(qsel).select2({
			placeholder: 'Object',
			    allowClear: true,
			    ajax: {
			    headers: {
				'Accept': 'application/json'
				    },
				url: SEARCH_API_ENDPOINT,
				dataType: 'json',
				delay: 250,
				data: function(params){
				var query = JSON.parse(JSON.stringify(SEARCH_ENTITIES));
				
				query.QueryString = params.term;
				return query; 
			    },
				processResults: function (data, params) {
				params.page = params.page || 1;
				var results = [];
				$.each(data.results, function(i,v){
					var o = v;
					o.id = append_class_dbpedia(v);
					results.push(o);
				    });
				return {
				    results: results,
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
	    }
	});
};

$(document).ready(function(){
	initialize_select2();
    });

add_item = function(item_type){
    var tuples = [];

    //Not checking the type of the object, i.e. if it is typed-literal or dbo since the button is expected to be disabled if such a row is selected
    $("#select_zone tr").each(function(i,d){
	    var tds = $(d).children();
	    if($($(tds[0]).find("input")).is(":checked")){
		
		var prop = $(tds[1]).html();
		var obj = $(tds[2]).html();
		tuples.push([prop,obj]);
	    }
	});
    if(tuples.length == 0)
	return;
    if (item_type == 'filter'){
	tuples.map(function(d,i){
		$("#filters").append("<div class='filter tag' data-text='" + d[0] + ":::" + d[1] + "'>" + d[0] + " - " + d[1] + " <button class='glyphicon glyphicon-remove remove'></button>"+ "</div>");
	    });
    }
    else if(item_type == 'answer'){
	if(tuples.length > 1)
	    console.warn("Multiple select for an answer!!");
	
	var answer = tuples[0];
	$("#answer").attr("data-text",answer[0]);
	$("#answer").html("Answer -- "+answer[0]+" <button class='glyphicon glyphicon-remove remove'></button>");
    }
    else if(item_type == 'clue'){
	if(tuples.length > 1){
	    console.warn("Multiple select for a clue!!");
	}
	var clue = tuples[0];
	$("#clue").attr('data-text',clue[0]);
	$("#clue").html("Clue -- " + clue[0] + " <button class='glyphicon glyphicon-remove remove'></button>");
    }
    
    $(".remove").click(function(){$(this).parent().remove();});
};

init = function(){
    $("#select_zone table").change(function(){
	    var num_checked = 0;
	    $("#select_zone input[type='checkbox']").each(function(i,d){
		    if($(d).is(":checked"))
			num_checked++;
		});

	    var marked = [];
	    var valid_filters = 0;
	    $("#select_zone input[type='checkbox']").each(function(i,d){
		    if($(d).is(":checked")){
			marked.push(i+1);
			var tr = $(d).closest("tr");
			if($(tr).attr("data-literal")=='false')
			    valid_filters++;
		    }
		});
	    $("#select_zone #add_filter").attr("class","btn btn-primary");
	    $("#select_zone #add_clue").attr("class","btn btn-primary");
	    $("#select_zone #add_answer").attr("class","btn btn-primary");

	    if (num_checked > 1 || num_checked==0){
		$("#select_zone #add_clue").addClass("disabled");
		$("#select_zone #add_answer").addClass("disabled");
	    }
	    if(num_checked != valid_filters || valid_filters==0){
		$("#select_zone #add_filter").addClass("disabled");
	    }
	    
	    if(num_checked == 0)
		$("#select_zone #unselect_all").removeClass("glyphicon-minus").addClass("glyphicon-unchecked");
	    else
		$("#select_zone #unselect_all").removeClass("glyphicon-unchecked").addClass("glyphicon-minus");    
	});
    $("body *[title]").tooltip();   

    $("#add_filter").click(function(){add_item('filter')});
    $("#add_answer").click(function(){add_item('answer')});
    $("#add_clue").click(function(){add_item('clue')});
    $("#unselect_all").click(function(){
	    if($(this).hasClass('glyphicon-minus')){
		$("#select_zone input[type='checkbox']").each(function(i,d){
			$(d).attr('checked',false);
		    });
		$(this).removeClass('glyphicon-minus').addClass('glyphicon-unchecked');
		//disable all add buttons
		var sels = ["#add_filter","#add_clue","#add_answer"];
		sels.map(function(d){$(d).addClass('disabled');});
	    }
	});
};