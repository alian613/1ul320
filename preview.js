var Preview = {
		Main: null,
		HTML: {}
};

!function(){
	Preview.init = function(json) {
		$('[data-toggle="tooltip"]').tooltip();
		$('.frame-phone-screen').empty();
		var formData = json;
		Preview.Main = $('.frame-phone-screen');
		var temp_g = -1;
		for(var i = 0; i < formData.form.length; i++) {
			var col = formData.form[i];
			
			var row = generateRow(col);
			$('.frame-phone-screen').append(row);
		}
		
		function generateRow(col) {
			var exampleDiv = document.createElement('div');
			exampleDiv.setAttribute('class', 'form-group row');
			
			if(!!col.group_id) {
				if(temp_g != col.group_id) {
					$(exampleDiv).append(Preview.HTML.Group(col.group_name));
					temp_g = col.group_id;
				}
			} else {
				if(temp_g != -1) {
					temp_g = -1;
					$(exampleDiv).append('<hr class="example-group-end">');
				}
			}
			
			switch(col.col_type) {
			case '1':
			case '3':
			case '16':
			case '17':
				$(exampleDiv).append(Preview.HTML.Label(col.col_name));
				$(exampleDiv).append(Preview.HTML.Text(col.def_value));
				break;
			case '14':
				var address = col.def_value.split(',');
				var addr_value = "";
				for(var i = 0; i < FormGlobalData.addressData.length; i++) {
					var adata = FormGlobalData.addressData[i];
					for(var j = 0; j < adata.length; j++) {
						if(address[i] == adata[j].key_id) {
							addr_value += adata[j].key_name;
						}
					}
				}
				addr_value += address[3];
				$(exampleDiv).append(Preview.HTML.Label(col.col_name));
				$(exampleDiv).append(Preview.HTML.Text(addr_value));
				break;
			case '9':
			case '10':
				$(exampleDiv).append(Preview.HTML.Label(col.col_name));
				if(col.hasfromto == 'Y')
					$(exampleDiv).append(Preview.HTML.Text2(col.def_value.split(',')));
				else
					$(exampleDiv).append(Preview.HTML.Text(col.def_value));
				break;
			case '2':
				$(exampleDiv).append(Preview.HTML.Label(col.col_name));
				$(exampleDiv).append(Preview.HTML.TextArea(col.def_value));
				break;
			case '7':
				var keyCode = FormGlobalData.queryKeyCode(col.key_code);
				$(exampleDiv).append(Preview.HTML.Label(col.col_name));
				$(exampleDiv).append(Preview.HTML.CheckBox(keyCode, "vertical"));
				break;
			case '4':
				var keyCode = FormGlobalData.queryKeyCode(col.key_code);
				$(exampleDiv).append(Preview.HTML.Label(col.col_name));
				$(exampleDiv).append(Preview.HTML.CheckBox(keyCode, "horizontal"));
				break;
			case '8':
				var keyCode = FormGlobalData.queryKeyCode(col.key_code);
				$(exampleDiv).append(Preview.HTML.Label(col.col_name));
				$(exampleDiv).append(Preview.HTML.DropDownListCheck(keyCode));
				break;
			case '5':
				var keyCode = FormGlobalData.queryKeyCode(col.key_code);
				$(exampleDiv).append(Preview.HTML.Label(col.col_name));
				$(exampleDiv).append(Preview.HTML.Radio(keyCode, "horizontal"));
				break;
			case '6':
				var keyCode = FormGlobalData.queryKeyCode(col.key_code);
				$(exampleDiv).append(Preview.HTML.Label(col.col_name));
				$(exampleDiv).append(Preview.HTML.DropDownList(keyCode));
				break;
			case '11':
				var keyCode = [{key_name: col.def_value}];
				$(exampleDiv).append(Preview.HTML.Label(col.col_name));
				$(exampleDiv).append(Preview.HTML.DropDownList(keyCode));
				break;
			case '12': //12 & 13
				$(exampleDiv).append(Preview.HTML.Button());
				break;
			default:
				if(FormGlobalData.isIE) //avoid button being covered
					$(exampleDiv).append('<hr>');
				break;
			}
			return exampleDiv;
		}
	};
	
	Preview.HTML.Button = function() {
		var doc = '<div class="col-md-12 example-div">' + 
						'<input class="btn btn-danger example-btn col-sm-4 col-sm-offset-1" type="button" value=" ' + lang.send + '">' + 
						'<input class="btn btn-success col-sm-4 col-sm-offset-1" type="button" value=" ' + lang.btn.clean + '">' + 
				  '</div>';
		
		return doc;
	}
	
	Preview.HTML.Label = function(label) {
		return '<label class="col-md-4 col-form-label example-label">' + label + '</label>';
	}
	
	Preview.HTML.Text = function(value) {
		value = value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
		var doc = '<div class="col-md-8 example-div">' + 
							'<input class="form-control example-text" type="text" value="'+ value +'" ' + 
								'data-toggle="tooltip" data-placement="bottom" title="'+value+'" readonly>' + 
				  '</div>';
		
		return doc;
	}
	
	Preview.HTML.Text = function(value) {
		value = value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
		var doc = '<div class="col-md-8 example-div">' + 
							'<input class="form-control example-text" type="text" value="'+ value +'" ' + 
								'data-toggle="tooltip" data-placement="bottom" title="'+value+'" readonly>' + 
				  '</div>';
		
		return doc;
	}
	
	Preview.HTML.Text2 = function(value) {
		var doc = '<div class="col-md-8 example-div">' + 
							'<input class="form-control example-text" type="text" value=" ' + value[0] + '" readonly>' + 
							'<input class="form-control example-text" type="text" value=" ' + ((value[1] != undefined)? value[1] : "") + '" readonly>' + 
				  '</div>';
		
		return doc;
	}
	
	Preview.HTML.TextArea = function(value) {
		value = value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
		var doc = '<div class="col-md-8 example-div">' + 
						'<textarea class="form-control example-textarea" name="textarea" style="vertical-align: middle;" ' + 
							'data-toggle="tooltip" data-placement="bottom" title="' + value + '" readonly> ' + value + '</textarea>'+ 
				  '</div>';
		
		return doc;
	}
	
	Preview.HTML.CheckBox = function(keyCode, type) {
		var doc = '<div class="col-md-8 example-div">';
		keyCode.forEach(function(k) {
			k.key_name = k.key_name.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
			doc += '<input class="example-checkbox" type="checkbox" value="' + k.key_name + '" style="cursor:default" disabled>' + k.key_name;
			
			if(type == 'vertical')
				doc += '<br>';
		});
		doc += '</div>';
		
		return doc;
	}
	
	Preview.HTML.Radio = function(keyCode, type) {
		var doc = '<div class="col-md-8 example-div">';
		keyCode.forEach(function(k) {
			k.key_name = k.key_name.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
			doc += '<input class="example-checkbox" type="radio" value="' + k.key_name + '" style="cursor:default" disabled>' + k.key_name;
		});
		doc += '</div>';
		
		return doc;
	}
	
	Preview.HTML.DropDownList = function(keyCode) {
		var doc = '<div class="col-md-8 example-div">';
		doc += '<select class="form-control example-select" style="cursor:default" disabled>';
		keyCode.forEach(function(k) {
			k.key_name = k.key_name.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
			doc += '<option>' + k.key_name + '</option>';
		});
		doc += '</select><span class="caret" style="position: absolute; top: 15px; right: 25px;"></span>';
		doc += '</div>';
		
		return doc;
	}
	
	Preview.HTML.DropDownListCheck = function(keyCode) {
		keyCode[0].key_name = keyCode[0].key_name.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
		var doc = '<div class="col-md-8 example-div">';
		doc += '<button class="form-control example-select dropdown-toggle" type="button" data-toggle="dropdown" style="cursor:default; text-align:left" disabled>';
		doc += '<input type="checkbox" style="cursor:default" disabled> ' + keyCode[0].key_name + '<span class="caret" style="position: absolute; top: 15px; right: 25px;"></span></button>'
		doc += '</button>';
		doc += '</div>';
		
		return doc;
	}
	
	Preview.HTML.Group = function(title) {
		var doc = '<h3 class="example-group">' + title +'</h3>';
		return doc;
	}
	
}();