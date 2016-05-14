//Copied from: https://jsfiddle.net/terryyounghk/kpegu/
//related to question: http://stackoverflow.com/questions/16078544/export-to-csv-using-jquery-and-html
$(document).ready(function () {
	function exportTableToCSV($table, filename) {
	    // actual delimiter characters for CSV format
	    var colDelim = '","', rowDelim = '"\r\n"';
	    // Temporary delimiter characters unlikely to be typed by keyboard
	    // This is to avoid accidentally splitting the actual contents
	    var tmpColDelim = String.fromCharCode(11); 
	    // vertical tab character
	    var tmpRowDelim = String.fromCharCode(0); // null character

	    var ms = [];
	    $table.find('th').each(function(i,d){
		    text = $(d).text();
		    ms.push(text.replace(/\"/g, '""'));
		});
	    csv = '\"' + ms.join(tmpColDelim)+tmpRowDelim;

	    var $rows = $table.find('tr:has(td)');		
		
	    // Grab text from table into CSV formatted string
	    csv += '"' + $rows.map(function (i, row) {
		    var $row = $(row),
			$cols = $row.find('td');
		    
		    return $cols.map(function (j, col) {
			    var $col = $(col),
				text = $col.text();
			    
			    return text.replace(/\"/g, '""'); // escape double quotes
			    
			}).get().join(tmpColDelim);
		    
		}).get().join(tmpRowDelim);
	    csv = csv
		.split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"',
		
		// Data URI
		csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
	    
	    $(this)
		.attr({
			'download': filename,
			    'href': csvData,
			    'target': '_blank'
			    });
	}
	
	// This must be a hyperlink
	$(".export").on('click', function (event) {
		alert("some");
		// CSV
		exportTableToCSV.apply(this, [$('#table_view'), 'export.csv']);
		
		// IF CSV, don't do event.preventDefault() or return false
		// We actually need this to be a typical hyperlink
	    });
    });
