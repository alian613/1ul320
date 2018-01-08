var FormGlobalData = {
		form_id: null,
		url: null,
		targetAct: null,
		noty: null,
		valid: true,
		isIE: /*@cc_on!@*/false || !!document.documentMode,
		browserLang : navigator.language || navigator.userLanguage,
		addressData: AddressData
	}
var Loading = {
		ON: function() {$.blockUI({ message: $('#loadingUI') })},
		OFF: function() {setTimeout($.unblockUI, 500)}
};

var logLevel = {
		debug: true
}

FormGlobalData.checkConnection = function() {
	var disconnection = false;
	$.ajax({
		type: 'GET',
		url: restapi('/form/connectionAlive'),
		contentType: 'application/json; charset=utf-8',
	    dataType : "json",
	    async:false,
		success: function(response) {
		},
		error: function(response) {
			disconnection = true;
			console.log("%c logout--", "background: #222; color: #bada55");
			if(!!!FormGlobalData.noty) {
				FormGlobalData.noty = noty({
					text : lang.form.re_login,
					type : "error",
					timeout : false,
					buttons : [ {
						addClass : 'btn btn-primary',
						text : lang.ok,
						onClick : function($noty) {
							$noty.close();
							location.reload();
						}
					} ]
				});
			}
		}
	});
	
	return disconnection;
}

FormGlobalData.queryKeyCode = function(masterID) {
	var keyCode = [];
	console.log(restapi('/form/queryKeyCode') + '?gid=' + masterID);
	$.ajax({
		type: 'GET',
		url: restapi('/form/queryKeyCode') + '?gid=' + masterID,
		contentType: 'application/json; charset=utf-8',
	    dataType : "json",
	    async:false,
		success: function(response) {
			keyCode = response;
		},
		error: function(response) {
			console.log("logout--");
			if(!!!FormGlobalData.noty) {
				FormGlobalData.noty = noty({
					text : lang.form.re_login,
					type : "error",
					timeout : false,
					buttons : [ {
						addClass : 'btn btn-primary',
						text : lang.ok,
						onClick : function($noty) {
							$noty.close();
							window.location.replace(window.location.href);
						}
					} ]
				});
			}
		}
	});
	
	return keyCode;
}

$(document).ready(function() {
	Loading.ON();
//	queryAddressCode();
	FormGlobalData.form_id = (window.location.search).substring(4);
	FormGlobalData.url = (window.location.href).split('?')[0];
	if(!!FormGlobalData.form_id)
		formEditInit(FormGlobalData.form_id);
	else
		$(".tip").show();
	
	FormDnD.init();

	$('#todo_option').keydown(function(event){
		if (event.which === 13 && $(this).val() != '') {
			$(this).val($(this).val().replace(/</g, '&lt;').replace(/>/g, '&gt;')); // avoid XSS attack
			$('.option_ul').append("<li>" + $(this).val() + " <a href='#' class='removeli'><span class='glyphicon glyphicon-remove-circle'></span></a></li>");
			$(this).val('');
		}
	});

	$('#form_edit').sortable({
		cancel:'.component-ul, .unsortable'
	});
	$('.group_context').sortable();
	
	$(".customFormIndex").show();
	Loading.OFF();
	console.log($(window).scrollTop());
	$(window).scrollTop( 90);
	console.log($(window).scrollTop());
	
});

$(document).on("click", ".removeli", function() {
	var _li = $(this).parent();
	_li.addClass("remove").stop().delay(100).slideUp("fast", function(){
        _li.remove();
    });
});

$(document).on('click', '.action-button .delete', function() {
	if(FormGlobalData.checkConnection())
		return;
	
	$(this).parent().parent().remove();
	
	if($("#form_edit").children().length == 1)
		$(".tip").show();
});

$(document).on('click', '.action-button .edit', function() {
	if(FormGlobalData.checkConnection())
		return;
	
	templateDetail(this);
});

$(document).on('click', '#list_btn', function() {
	link('/ADS/webconsole/form/');
});

$(document).on('click', '#preview_btn', function() {
	if(FormGlobalData.checkConnection())
		return;
	
	$('#previewModal').modal();
	Preview.init(parserForm());
});

$(document).on('click', '#submit_btn', function() {
	if(FormGlobalData.checkConnection())
		return;
	
	if(!!!$('.form-name').val()){
		noty({
			text : lang.form.plz_input_form_name,
			type : "warning",
			timeout : false,
			buttons : [ {
				addClass : 'btn btn-primary',
				text : lang.ok,
				onClick : function($noty) {
					$noty.close();
				}
			} ]
		});
		return;
	}
	
	Loading.ON();
	postFormtoDB();
});

$(document).on('change', '#key_master', function() {
	todoParser($(this).val());
});

$('#updateEditBtn').on('click', function() {
	if(FormGlobalData.checkConnection())
		return;
	
	if(logLevel.debug)
		console.log("valid : " + FormGlobalData.valid);
	
	if(FormGlobalData.valid) {
		setCompoProp(FormGlobalData.targetAct);
		$('#propModal').modal('hide');
	}
});

FormGlobalData.numberEnForcer = function(el, negative) {
	el.off('keydown');
	el.keydown(function(e) {
	    var charCode = e.keyCode;
	    // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl+A, Command+A
            (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || 
             // Allow: home, end, left, right, down, up
            (e.keyCode >= 35 && e.keyCode <= 40)) {
                 // let it happen, don't do anything
                 return;
        }
        
        // Allow: subtract
        if(negative && (e.keyCode == 109 || e.keyCode == 189))
        	return
        	
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105))
            e.preventDefault();
	});
}

function queryAddressCode() {
	var addressCode = ['A00', 'B00', 'C00'];
	
	for(var i = 0; i < addressCode.length; i++) {
		FormGlobalData.addressData[i] = FormGlobalData.queryKeyCode(addressCode[i]);
	}
}

function postFormtoDB() {
	var sendData = parserForm();
	var api = (!!FormGlobalData.form_id) ? restapi('/form/update') : restapi('/form/new');
	Loading.OFF();
	
	if(logLevel.debug)
		console.log(sendData);
	if(!!!sendData.form) { // this form is empty
		return noty({
			text : lang.form.not_completed,
			type : "warning",
			timeout : false,
			buttons : [ {
				addClass : 'btn btn-primary',
				text : lang.ok,
				onClick : function($noty) {
					$noty.close();
				}
			} ]
		});
	} else if (sendData.error == 'group' || sendData.error == 'key_code') {
		if(sendData.error == 'group') {
			return noty({
				text : lang.form.group_is_empty,
				type : "warning",
				timeout : false,
				buttons : [ {
					addClass : 'btn btn-primary',
					text : lang.ok,
					onClick : function($noty) {
						$noty.close();
					}
				} ]
			});
		} else if(sendData.error == 'key_code') {
			return noty({
				text : lang.form.keycode_cant_null,
				type : "warning",
				timeout : false,
				buttons : [ {
					addClass : 'btn btn-primary',
					text : lang.ok,
					onClick : function($noty) {
						$noty.close();
					}
				} ]
			});
		}
	} else {
		return $.ajax({
			type: 'POST',
			url: api,
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(sendData),
		    dataType: "text",
		    async: false,
			success: function(response, statusText, xhr) {
				response = JSON.parse(response);
				
				setTimeout(function(){
					noty({
						text : lang.success.setting,
						type : "success",
						timeout : false,
						buttons : [ {
							addClass : 'btn btn-primary',
							text : lang.ok,
							onClick : function($noty) {
								link('/ADS/webconsole/form/');
								$noty.close();
							}
						} ]
					});
				}, 600);
			},
			error: function(xhr, statusText, response) {
				Loading.OFF();
				if(!!FormGlobalData.form_id && xhr.status == '403') {
					noty({
						text : lang.form.exist,
						type : "warning",
						timeout : false,
						buttons : [ 
						{
							addClass : 'btn btn-primary', text : lang.btn.yes, onClick :
								function($noty) {
									FormGlobalData.form_id = null;
									postFormtoDB();
									$noty.close();
								}
						}, 
						{
							addClass : 'btn btn-danger', text : lang.btn.no, onClick : 
								function($noty) {
									$noty.close();
								}
						} ]
					});
				}
			}
		});
	}
}

function templateDetail(target) {
	var targetAct = $(target).parent().parent();
	FormGlobalData.targetAct = targetAct;
	var def_element = document.getElementById('default_value');
	var col_type = $(targetAct).attr('value');
	
	def_element.innerHTML = $(targetAct).find('.context').html();
	def_element.setAttribute('value', col_type); // col_type
	//def_element.setAttribute('data-value', $('.edit').index(target)); // sequence index
	$('#default_block input').prop('disabled', false);
	$('#default_block textarea').prop('disabled', false);
	$('#default_block select').prop('disabled', false);

	queryKeyMaster();
	$('.option_ul').empty();
	switch(col_type){
	case '0':
		$('#default_value').find('input[name="compo_label"]').eq(0).val($(targetAct).find('input[name="compo_label"]').val());
		$('#maxlength_text').val($(def_element).find('input[name="compo_label"]').eq(0).attr('maxlength'));
		$('.default_block').show();
		$('.maxlength_block').show();
		$('.required_block').hide();
		$('#check_type').hide();
		$('.display_block').hide();
		$('.option_block').hide();
		$('.range_block').hide();
		$('.address_block').hide();
		$('.hasfromto_block').hide();
		break;
	case '1':
		$('#default_value').find('input[name="compo_text"]').eq(0).val($(targetAct).find('input[name="compo_text"]').val());
		$('#maxlength_text').val($(def_element).find('input[name="compo_text"]').eq(0).attr('maxlength'));
		$('.default_block').show();
		$('.maxlength_block').show();
		$('.required_block').show();
		$('#check_type').hide();
		$('.display_block').hide();
		$('.option_block').hide();
		$('.range_block').hide();
		$('.address_block').hide();
		$('.hasfromto_block').hide();
		break;
	case '2':
		$('#default_value').find('textarea').eq(0).val($(targetAct).find('textarea').val());
		$('#maxlength_text').val($(def_element).find('textarea[name="textarea"]').eq(0).attr('maxlength'));
		$('.default_block').show();
		$('.maxlength_block').show();
		$('.required_block').show();
		$('#check_type').hide();
		$('.display_block').hide();
		$('.option_block').hide();
		$('.range_block').hide();
		$('.address_block').hide();
		$('.hasfromto_block').hide();
		break;
	case '4':
	case '7':
	case '8':
// todoListParser('compo_checkbox');
		$('#key_master').val($(targetAct).find('input[name="compo_checkbox"]').eq(0).val());

		$('.default_block').hide();
		$('.range_block').hide();
		$('.address_block').hide();
		$('.maxlength_block').hide();
		$('.hasfromto_block').hide();

		$('#check_type').show();
		$('#check_type').find('.form-check-label').eq(0).show();
		$('.display_block').show();
		$('.option_block').show();
		$('.required_block').show();

		($('#key_master').val() == '0') ? $('#todo_option').parent().show() : $('#todo_option').parent().hide();
		todoParser($('#key_master').val());
		$('#todo_option').attr('placeholder', lang.form.enter_option);
		break;
	case '5':
	case '6':
// todoListParser('compo_radio');
		$('#key_master').val($(targetAct).find('input[name="compo_radio"]').eq(0).val());

		$('.default_block').hide();
		$('.range_block').hide();
		$('.address_block').hide();
		$('.maxlength_block').hide();
		$('.hasfromto_block').hide();

		$('#check_type').show();
		$('#check_type').find('.form-check-label').eq(0).hide();
		$('.display_block').show();
		$('.option_block').show();
		$('.required_block').show();

		($('#key_master').val() == '0') ? $('#todo_option').parent().show() : $('#todo_option').parent().hide();
		todoParser($('#key_master').val());
		$('#todo_option').attr('placeholder', lang.form.enter_option);
		break;
	case '9':
		$('#default_value').find('input[name="compo_date"]').each(function(idx) {
			$(this).val($(targetAct).find('input[name="compo_date"]').eq(idx).val());
		});
		
		$('.hasfromto_block').show();
		$('.default_block').show();
		$('.required_block').show();

		$('#check_type').hide();
		$('.display_block').hide();
		$('.option_block').hide();
		$('.range_block').hide();
		$('.address_block').hide();
		$('.maxlength_block').hide();
		break;
	case '10':
		$('#default_value').find('input[name="compo_time"]').each(function(idx) {
			$(this).val($(targetAct).find('input[name="compo_time"]').eq(idx).val());
		});
		
		$('.hasfromto_block').show();
		$('.default_block').show();
		$('.required_block').show();

		$('#check_type').hide();
		$('.display_block').hide();
		$('.option_block').hide();
		$('.range_block').hide();
		$('.address_block').hide();
		$('.maxlength_block').hide();
		break;
	case '11':
		var rangeAct = $(targetAct).find('input[name="compo_range"]').eq(0);
		$('#minVal').val(rangeAct.prop('min'));
		$('#maxVal').val(rangeAct.prop('max'));
		$('#stepVal').val(rangeAct.prop('step'));

		$('.default_block').show();
		$('.range_block').show();
		$('.required_block').show();

		$('.display_block').hide();
		$('.option_block').hide();
		$('.maxlength_block').hide();
		$('.address_block').hide();
		$('.hasfromto_block').hide();
		break;
	case '12':
	case '-1':
	case '-2':
		$('.default_block').hide();
		$('.display_block').hide();
		$('.option_block').hide();
		$('.range_block').hide();
		$('.address_block').hide();
		$('.maxlength_block').hide();
		$('.hasfromto_block').hide();
		$('.required_block').hide();
		break;
	case '14':
		var countyCode = FormGlobalData.addressData[0];
		for(var i = 0; i < countyCode.length; i++) {
			var code = countyCode[i];
			var optionTag = '<option value="' + code.key_id + '">' + code.key_name + '</option>';
			$('#countyVal').append(optionTag);
		}
		
		addressParser(targetAct);
		
		$('.address_block').show();
		$('.required_block').show();
		
		$('.default_block').hide();
		$('#check_type').hide();
		$('.display_block').hide();
		$('.option_block').hide();
		$('.range_block').hide();
		$('.maxlength_block').hide();
		$('.hasfromto_block').hide();
		break;
	default:
		$('.default_block').show();
		$('.required_block').show();
		$('#check_type').hide();
		$('.display_block').hide();
		$('.option_block').hide();
		$('.range_block').hide();
		$('.address_block').hide();
		$('.maxlength_block').hide();
		$('.hasfromto_block').hide();
		break;
	}

	// set title
	if(col_type == -1 || col_type == -2){
		$('#col_name').prop("maxlength", 20);
		$('#col_name').val($(targetAct).find('h3').text());
	} else {
		$('#col_name').prop("maxlength", 50);
		$('#col_name').val($(targetAct).find('.title label').text());
	}
	
	if(col_type == '7')
		$('#check_type').find('input[name="check_type"]').eq(0).prop('checked', true);
	else if (col_type == '4' || col_type == '5')
		$('#check_type').find('input[name="check_type"]').eq(1).prop('checked', true);
	else if (col_type == '8' || col_type == '6')
		$('#check_type').find('input[name="check_type"]').eq(2).prop('checked', true);
		
	// set properties
	$('#requiredSwitch').prop('checked',
			($(targetAct).find('.icon_req').is(':visible') == true ) ? true : false);
	$('#readonlySwitch').prop('checked',
			($(targetAct).find('.icon_readonly').is(':visible') == true ) ? true : false);
	$('#hasfromtoSwitch').prop('checked',
			($(targetAct).find('.icon_fromto').is(':visible') == true ) ? true : false);

	$('#propModal').modal();
	
	switch(col_type) {
	case '0':
	case '1':
	case '2':
		ComponentListener.maxlength();
		break;
	case '4':
	case '7':
	case '8':
	case '5':
	case '6':
		break;
	case '9':
		ComponentListener.date();
		ComponentListener.hasFromto(col_type);
		break;
	case '10':
		ComponentListener.time();
		ComponentListener.hasFromto(col_type);
		break;
	case '11':
		ComponentListener.ranger();
		break;
	case '14':
		ComponentListener.address();
		break;
	case '16':
		FormGlobalData.numberEnForcer($('input[name="compo_phone"]'), false);
		break;
	case '17':
		ComponentListener.email();
		break;
	}
	

	var rangeSlider = function() {
		var range = $(def_element).find('.range-slider-range').eq(0), 
			value = $(def_element).find('.range-slider-value').eq(0);
		
		value.each(function() {
			var value = $(this).prev().attr('value');
			$(this).html(value);
		});
		
		range.on('input', function() {
			$(this).next(value).html(this.value);
			range.attr('value',$(this).val());
		});
	};
//	rangeSlider();
	
	$('#rangeValidaLabel').text('');
	$('#defaultValidaLabel').text('');
	
	function todoListParser(whatkind) {
		var current_value = [];
		$('input[name="check_type"]').eq($(targetAct).find('input[name="' + whatkind + '_val"]').val()).prop('checked', true);

		if($(targetAct).find('input[name="' + whatkind + '"]').eq(0).val() != ""){
			current_value = $.map(JSON.parse($(targetAct).find('input[name="' + whatkind + '"]').eq(0).val()),
					function(el) {
						return el.value;
					});
		}

		$('#todo_option').val('');
		$('.option_ul').empty();
		current_value.forEach(function(val){
			$('.option_ul').append("<li>" + val + " <a href='#' class='removeli'><span class='glyphicon glyphicon-remove-circle'></span></a></li>");
		});

		$('#check_type').show();
		$('#optino_list').show();
	}
	
	function addressParser(targetAct) {
		if(!!$(targetAct).find('input[name="compo_county"]').eq(0).val()) {
			$('#countyVal').val($(targetAct).find('input[name="compo_county"]').eq(0).attr('value'));
			FormGlobalData.processAddressComp('#countyVal', '#areaVal');
			$('#areaVal').val($(targetAct).find('input[name="compo_area"]').eq(0).attr('value'));
			FormGlobalData.processAddressComp('#areaVal', '#villageVal');
			$('#villageVal').val($(targetAct).find('input[name="compo_village"]').eq(0).attr('value'));
			$('#addressVal').val($(targetAct).find('input[name="compo_address"]').eq(0).attr('value'));
		} else {
			FormGlobalData.processAddressComp('#countyVal', '#areaVal');
			FormGlobalData.processAddressComp('#areaVal', '#villageVal');
		}
	}

	function queryKeyMaster() {
		return $.ajax({
			type: 'GET',
			url: restapi('/form/queryKeyMaster'),
			contentType: 'application/json; charset=utf-8',
		    dataType : "json",
		    async:false,
			success: function(response) {
				$('#key_master').empty();
				$('#key_master').append('<option value="' + 0 + '" >'+lang.form.custom+'</option>');

				var keyMaster = response;

				for(var i = 0; i < keyMaster.length; i++) {
					var m = keyMaster[i];
					var optionTag = '<option value="' + m.g_id + '">' + m.g_name + '</option>';
					$('#key_master').append(optionTag);
				}

			},
			error: function(response) {
				if(response.status == 200 && response.responseText =="") {
					$('#key_master').empty();
					$('#key_master').append('<option value="' + 0 + '" >'+lang.form.custom+'</option>');
				}
			}
		});
	}
}

function todoParser(master) {
	if(master == '0') {
		$('#option_list .option_ul').empty();
		$('#todo_option').parent().show();
	} else {
		$('#todo_option').parent().hide();
		$('#option_list .option_ul').empty();
		var keyCode = FormGlobalData.queryKeyCode(master);
		
//		keyCode.forEach(function(k) {
//			$('.option_ul').append("<li>" +  k.key_name + "</li>");
//		});
		
		for(var i = 0; i < keyCode.length; i++) {
			var k = keyCode[i];
			k.key_name = k.key_name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			$('.option_ul').append("<li>" +  k.key_name + "</li>");
		}
	}
}

function clickWDay(wday) {
	if($(wday).parent().parent().parent().parent().prop('id') != 'default_value')
		return false; //only edit mode can modify this component.
	
	if (wday.parentElement.getAttribute('class').includes('active') > 0){
		wday.parentElement.classList.remove('active');
	}
	else{
		wday.parentElement.className += " active";
	}
}

FormGlobalData.processAddressComp = function (selfID, subID) {
	var code;
	if(selfID == '#countyVal') {
		code = FormGlobalData.addressData[1];
	} else {
		code = FormGlobalData.addressData[2];
	}
	
	$(subID).empty();
	var g_id = $(selfID + ' option:selected').val();
	for(var i = 1; i < code.length; i++) {
		if(parseInt(code[i].g_id2) == parseInt(g_id)) {
			var optionTag = '<option value="' + code[i].key_id + '">' + code[i].key_name + '</option>';
			$(subID).append(optionTag);
		}
	}
}

function setCompoProp(targetActivity){
	var col_type = $('#default_value').attr('value');
	var dragAct = $('.draggable-activity');
	var def_elem = document.getElementById('default_value');
	
	var child_index = 0;
//	def_elem.childNodes.forEach(function(v, idx) {
//		if(v.nodeType == 1)
//			child_index = idx;
//	});
	
	for(var idx = 0; idx < def_elem.childNodes.length; idx++) {
		var v = def_elem.childNodes[idx];
		if(v.nodeType == 1)
			child_index = idx;
	}
	
	var target_compo = def_elem.childNodes[child_index];

	var whatkind;
	if(col_type == '4' || col_type == '5' || col_type == '6' || col_type == '7' || col_type == '8') {
		target_compo.value = "";
		var oplist = [];

		if($('#key_master option:selected').val() == '0') {
			$('.option_ul > li').each(function(index){
				var opitem = {};
				opitem.value = $(this).text();
				oplist.push(opitem);
			});

			target_compo.value = setKeyCode(oplist, $('#col_name').val());
		} else {
			target_compo.value = $('#key_master').val();
		}

		switch(col_type) {
		case '4':
		case '7':
		case '8':
			whatkind = 'compo_checkbox';
			break;
		case '5':
		case '6':
			whatkind = 'compo_radio';
			break;
		}
	} else if(col_type == '11') {
		target_compo.setAttribute('min', parseFloat($('#minVal').val()));
		target_compo.setAttribute('max', parseFloat($('#maxVal').val()));
		target_compo.setAttribute('step', parseFloat($('#stepVal').val()));
	} else if(col_type == '14') {
		def_elem.childNodes[0].value = parseInt($('#countyVal option:selected').val());
		def_elem.childNodes[1].value = parseInt($('#areaVal option:selected').val());
		def_elem.childNodes[2].value = parseInt($('#villageVal option:selected').val());
		def_elem.childNodes[3].text = $('#countyVal option:selected').text();
	} else if(col_type == '1' || col_type == '2') {
		target_compo.setAttribute('maxlength', $('#maxlength_text').val());
	}

	if(target_compo.value == 'undefined') {
		console.error('target_compo.value is undefined');
		return;
	}

	// reset component
	if(col_type != '-1' && col_type != '-2') {
		if($(def_elem).children().length == 2) { // date or time or range
			if(col_type == '11') {
				targetActivity.find('.range-slider-range').replaceWith(
						$(target_compo).parent().find('.range-slider-range'));
				targetActivity.find('.context').children().eq(1).replaceWith(
						$(target_compo).parent().find('.range-slider-value'));
			} else { // date or time
				$(def_elem).children().eq(0).prop('disabled', true);
				$(def_elem).children().eq(1).prop('disabled', true);
				targetActivity.find('.context').empty();
				targetActivity.find('.context').append(def_elem.childNodes);
			}
		} else if($(def_elem).children().length == 3){
			if(col_type == '4' || col_type == '7' || col_type == '8' || col_type == '5' || col_type == '6') {
					targetActivity.find('.context').empty();
					$(def_elem).children().eq(0).attr('value', target_compo.value);
					$(def_elem).children().eq(0).attr('disabled', true);
					targetActivity.find('.context').append($(def_elem).children());
			}
		} else if($(def_elem).children().length == 4){
			if(col_type == '14') {
				var childActivity = targetActivity.find('.context')
				childActivity.find('input[name="compo_county"]').val($('#countyVal option:selected').text());
				childActivity.find('input[name="compo_area"]').val($('#areaVal option:selected').text());
				childActivity.find('input[name="compo_village"]').val($('#villageVal option:selected').text());
				childActivity.find('input[name="compo_address"]').val($('#addressVal').val());
				childActivity.find('input[name="compo_county"]').attr('value', $('#countyVal option:selected').val());
				childActivity.find('input[name="compo_area"]').attr('value', $('#areaVal option:selected').val());
				childActivity.find('input[name="compo_village"]').attr('value', $('#villageVal option:selected').val());
			}
		}
		else {
			if(col_type == '11') {
				targetActivity.find('.context').children().eq(1).replaceWith(
						$(target_compo));
			}
			
			targetActivity.find('.context').empty();
			targetActivity.find('.context').append(target_compo);
		}
	}

	if(col_type == '-1' || col_type == '-2')
		targetActivity.find('h3').text($('#col_name').val());
	else {
		targetActivity.find('.title label').text($('#col_name').val());
		target_compo.setAttribute('disabled', true);
	}

	// switch button function
	if($('#requiredSwitch').is(':checked'))
		targetActivity.find('.icon_req').show();
	else
		targetActivity.find('.icon_req').hide();

	if($('#readonlySwitch').is(':checked'))
		targetActivity.find('.icon_readonly').show();
	else
		targetActivity.find('.icon_readonly').hide();

	if($('#hasfromtoSwitch').is(':checked'))
		targetActivity.find('.icon_fromto').show();
	else
		targetActivity.find('.icon_fromto').hide();

	// maybe change language file -> lang.x[]
	if($('#display_block').is(':visible')) {
		switch($("input[name='check_type']:checked").val()) {
		case '0':
			targetActivity.find('.context').find('.form-label').text(lang.form.vertical);
			targetActivity.attr('value', '7');
			break;
		case '1':
			targetActivity.find('.context').find('.form-label').text(lang.form.horizontal);
			targetActivity.attr('value',  (whatkind == 'compo_checkbox') ? '4' : '5');
			break;
		case '2':
			targetActivity.find('.context').find('.form-label').text(lang.form.dropdownlist);
			targetActivity.attr('value', (whatkind == 'compo_checkbox') ? '8' : '6');
			break;
		}
	}

	if(!!target_compo.value)
		$('#propModal').modal('hide');

	function setKeyCode(oplist, keyname) {
		console.log('%c in?', 'background: #222; color:#bada55');
		if(oplist.length == 0) {
			console.log('%c is zero', 'background:#222; color:#bada55');
			noty({
				text : lang.form.custom_cant_null,
				type : "warning",
				timeout : false,
				buttons : [ {
					addClass : 'btn btn-primary',
					text : lang.ok,
					onClick : function($noty) {
						$noty.close();
						
						//retry
						templateDetail($(FormGlobalData.targetAct).find('.edit').eq(0));
						$('#propModal').modal();
					}
				} ]
			});
			return undefined;
		}
		
		console.log('%c key name = ' + keyname, 'background: #222; color:#bada55');
		return $.ajax({
			type: 'POST',
			url: restapi('/form/insertKeyCode/' + keyname),
			contentType: 'application/json; charset=utf-8',
			data : JSON.stringify(oplist),
		    dataType : "json",
		    async: false
		}).responseText;
	}

}

function addNewItem() {
	var newItem = document.querySelector('.input').value;
	if (newItem != '') {
		document.querySelector('.input').value = '';
		var li = document.createElement('li');
		var attr = document.createAttribute('draggable-component');
		var ul = document.querySelector('ul');
		li.className = 'draggable';
		attr.value = 'true';
		li.setAttributeNode(attr);
		li.appendChild(document.createTextNode(newItem));
		ul.appendChild(li);
		addEventsDragAndDrop(li);
	}
}

function parserForm() {
	var formJSON = [];
	var formData = {};
	var groupId = 0;
	var rowId = 0;
	var idx = 0;

	formData.id = FormGlobalData.form_id;
	formData.name = $('.form-name').val();
	
	if($('#form_edit').children().length == 1) { //form is empty
		return formData;
	}
	
	$('#form_edit').children().each(function(act, actSrc) {
		if(act < 1)
			return; // skip tip element
		
		var activityJSON = {};
		activityJSON.col_type = ($(actSrc).attr('value') != '0') ? ""+$(actSrc).attr('value') : '1';
		activityJSON.col_name = $(actSrc).find('.title label').text();
		activityJSON.hasfromto = $(actSrc).find('.icon_fromto').is(':visible') ? 'Y' : 'N';
		if($(actSrc).find('input[name="compo_range"]')) {
			activityJSON.minval = $(actSrc).find('input[name="compo_range"]').attr('min');
			activityJSON.maxval = $(actSrc).find('input[name="compo_range"]').attr('max');
			activityJSON.intval = $(actSrc).find('input[name="compo_range"]').attr('step');
		}
		if(activityJSON.col_type == 1) 
			activityJSON.maxlength = $(actSrc).find('input[name="compo_text"]').eq(0).attr('maxlength');
		if(activityJSON.col_type == 2)
			activityJSON.maxlength = $(actSrc).find('textarea[name="textarea"]').eq(0).attr('maxlength');
		activityJSON.enableother = 'N';
		activityJSON.showselectedonly = 'N';
		activityJSON.addseq = 'N';
		activityJSON.hassub = 'N';

		if(activityJSON.col_type == '-1') {
			groupId++;

			if($(actSrc).find('.group_context').children().length == 0) 
				formData.error = 'group';
			
			$(actSrc).find('.group_context').children().each(function(gidx, groupSrc) {
				if(!!$(groupSrc).find('.row_context').length) {
					
					if($(groupSrc).find('.row_context').children() == 0)
						formData.error = 'group';
					
					$(groupSrc).find('.row_context').children().each(function(ridx, rowSrc) {
						idx++;
						var rowJSON = {};
						rowJSON.col_type = ($(rowSrc).attr('value') != '0') ? ""+$(rowSrc).attr('value') : '1';
						rowJSON.col_name = $(rowSrc).find('.title label').text();
						rowJSON.col_id = ""+idx;
						rowJSON.required = ($(rowSrc).find('.icon_req').is(':visible') ? 'Y' : 'N');
						rowJSON.editable = ($(rowSrc).find('.icon_readonly').is(':visible') ? 'N' : 'Y');
						rowJSON.hasfromto = ($(rowSrc).find('.icon_fromto').is(':visible') ? 'Y' : 'N');
						if($(rowSrc).find('input[name="compo_range"]')) {
							rowJSON.minval = $(rowSrc).find('input[name="compo_range"]').attr('min');
							rowJSON.maxval = $(rowSrc).find('input[name="compo_range"]').attr('max');
							rowJSON.intval = $(rowSrc).find('input[name="compo_range"]').attr('step');
						}
						if(rowJSON.col_type == 1) 
							rowJSON.maxlength = $(rowSrc).find('input[name="compo_text"]').eq(0).attr('maxlength');
						if(rowJSON.col_type == 2)
							rowJSON.maxlength = $(rowSrc).find('textarea[name="textarea"]').eq(0).attr('maxlength');
						
						switch(rowJSON.col_type) {
						case '4':
						case '7':
						case '8':
						case '5':
						case '6':
							rowJSON.key_code = parserContextValue(rowJSON.col_type, rowSrc);
							rowJSON.def_value = '';
							if(rowJSON.key_code == '0')
								formData.error = 'key_code';
							break;
						default:
							rowJSON.def_value = parserContextValue(rowJSON.col_type, rowSrc);
							break;
						}
						
						rowJSON.row_id = ""+rowId;
						rowJSON.group_id = ""+groupId;
						rowJSON.group_name = $(actSrc).find('.group_title h3').text();

						formJSON.push(rowJSON);
					});
				} else {
					idx++;
					var groupJSON = {};
					groupJSON.col_type = ($(groupSrc).attr('value') != '0') ? ""+$(groupSrc).attr('value') : '1';
					groupJSON.col_name = $(groupSrc).find('.title label').text();
					groupJSON.col_id = ""+idx;
					groupJSON.group_id = ""+groupId;
					groupJSON.group_name = $(actSrc).find('.group_title h3').text();
					groupJSON.required = ($(groupSrc).find('.icon_req').is(':visible') ? 'Y' : 'N');
					groupJSON.editable = ($(groupSrc).find('.icon_readonly').is(':visible') ? 'N' : 'Y');
					groupJSON.hasfromto = ($(groupSrc).find('.icon_fromto').is(':visible') ? 'Y' : 'N');
					groupJSON.enableother = 'N';
					groupJSON.showselectedonly = 'N';
					groupJSON.addseq = 'N';
					groupJSON.hassub = 'N';
					if($(groupSrc).find('input[name="compo_range"]')) {
						groupJSON.minval = $(groupSrc).find('input[name="compo_range"]').attr('min');
						groupJSON.maxval = $(groupSrc).find('input[name="compo_range"]').attr('max');
						groupJSON.intval = $(groupSrc).find('input[name="compo_range"]').attr('step');
					}
					if(groupJSON.col_type == 1) 
						groupJSON.maxlength = $(groupSrc).find('input[name="compo_text"]').eq(0).attr('maxlength');
					if(groupJSON.col_type == 2)
						groupJSON.maxlength = $(groupSrc).find('textarea[name="textarea"]').eq(0).attr('maxlength');
					
					switch(groupJSON.col_type) {
					case '4':
					case '7':
					case '8':
					case '5':
					case '6':
						groupJSON.key_code = parserContextValue(groupJSON.col_type, groupSrc);
						groupJSON.def_value = '';
						if(groupJSON.key_code == '0')
							formData.error = 'key_code';
						break;
					default:
						groupJSON.def_value = parserContextValue(groupJSON.col_type, groupSrc);
						break;
					}
					
					formJSON.push(groupJSON);
				}
			});

		} else if(activityJSON.col_type == '-2'){
			rowId++;
			
			if($(actSrc).find('.row_context').children().length == 0)
				formData.error = 'group';
			
			$(actSrc).find('.row_context').children().each(function(ridx, rowSrc) {
				idx++;
				var rowJSON = {};
				rowJSON.col_type = ($(rowSrc).attr('value') != '0') ? ""+$(rowSrc).attr('value') : '1';
				rowJSON.col_name = $(rowSrc).find('.title label').text();
				rowJSON.col_id = ""+idx;
				rowJSON.required = ($(rowSrc).find('.icon_req').is(':visible') ? 'Y' : 'N');
				rowJSON.editable = ($(rowSrc).find('.icon_readonly').is(':visible') ? 'N' : 'Y');
				rowJSON.hasfromto = ($(rowSrc).find('.icon_fromto').is(':visible') ? 'Y' : 'N');
				if($(rowSrc).find('input[name="compo_range"]')) {
					rowJSON.minval = $(rowSrc).find('input[name="compo_range"]').attr('min');
					rowJSON.maxval = $(rowSrc).find('input[name="compo_range"]').attr('max');
					rowJSON.intval = $(rowSrc).find('input[name="compo_range"]').attr('step');
				}
				if(rowJSON.col_type == 1) 
					rowJSON.maxlength = $(rowSrc).find('input[name="compo_text"]').eq(0).attr('maxlength');
				if(rowJSON.col_type == 2)
					rowJSON.maxlength = $(rowSrc).find('textarea[name="textarea"]').eq(0).attr('maxlength');
				
				switch(rowJSON.col_type) {
				case '4':
				case '7':
				case '8':
				case '5':
				case '6':
					rowJSON.key_code = parserContextValue(rowJSON.col_type, rowSrc);
					rowJSON.def_value = '';
					if(rowJSON.key_code == '0')
						formData.error = 'key_code';
					break;
				default:
					rowJSON.def_value = parserContextValue(rowJSON.col_type, rowSrc);
					break;
				}
				
				rowJSON.row_id = ""+rowId;

				formJSON.push(rowJSON);
			});
		} else {
			idx++;
			var coltype = ""+$(actSrc).attr('value');
			switch(coltype) {
			case '4':
			case '7':
			case '8':
			case '5':
			case '6':
				activityJSON.key_code = parserContextValue(coltype, actSrc);
				activityJSON.def_value = '';
				if(activityJSON.key_code == '0')
					formData.error = 'key_code';
				break;
			default:
				activityJSON.def_value = parserContextValue(coltype, actSrc);
				break;
			}
			
			activityJSON.col_id = ""+idx;
			activityJSON.required = ($(actSrc).find('.icon_req').is(':visible') ? 'Y' : 'N');
			activityJSON.editable = ($(actSrc).find('.icon_readonly').is(':visible') ? 'N' : 'Y');
			activityJSON.hasfromto = ($(actSrc).find('.icon_fromto').is(':visible') ? 'Y' : 'N');
			if($(actSrc).find('input[name="compo_range"]')) {
				activityJSON.minval = $(actSrc).find('input[name="compo_range"]').attr('min');
				activityJSON.maxval = $(actSrc).find('input[name="compo_range"]').attr('max');
				activityJSON.intval = $(actSrc).find('input[name="compo_range"]').attr('step');
			}
			if(activityJSON.col_type == 1) 
				activityJSON.maxlength = $(actSrc).find('input[name="compo_text"]').eq(0).attr('maxlength');
			if(activityJSON.col_type == 2)
				activityJSON.maxlength = $(actSrc).find('textarea[name="textarea"]').eq(0).attr('maxlength');
			formJSON.push(activityJSON);
		}
	});

	var btn1JSON = {};
	btn1JSON.row_id = ""+(++rowId);
	btn1JSON.col_id = ""+(++idx);
	btn1JSON.col_name = lang.send;
	btn1JSON.col_type = "12";
	btn1JSON.def_value = "";
	btn1JSON.enableother = "N";
	btn1JSON.editable = "N";
	btn1JSON.required = "N";
	btn1JSON.showselectedonly = "N";
	btn1JSON.addseq = "N";
	btn1JSON.hassub = "N";
	btn1JSON.hasfromto = "N";
	btn1JSON.url = "/form/updateFormValue/" + jdata.company_id;
	formJSON.push(btn1JSON);
	
	var btn2JSON = {};
	btn2JSON.row_id = ""+rowId;
	btn2JSON.col_id = ""+(++idx);
	btn2JSON.col_name = lang.btn.clean;
	btn2JSON.col_type = "13";
	btn2JSON.def_value = "";
	btn2JSON.enableother = "N";
	btn2JSON.editable = "N";
	btn2JSON.required = "N";
	btn2JSON.showselectedonly = "N";
	btn2JSON.addseq = "N";
	btn2JSON.hassub = "N";
	btn2JSON.hasfromto = "N";
	formJSON.push(btn2JSON);
	
	formData.form = formJSON;
	console.log("form storage --");
	if(logLevel.debug)
		console.log(formData);
	return formData;

	function parserContextValue(col_type, targetActivity) {
		var parserValue = '';
		switch(col_type) {
		case '2':
			parserValue = $(targetActivity).find('textarea').val();
			break;
		case '3':
			$(targetActivity).find('.active').each(function(index) {
				if(parserValue != '')
					parserValue += ',';
				parserValue += $(this).val();
			});
			break;
		case '4':
		case '7':
		case '8':
			parserValue = $(targetActivity).find('input[name="compo_checkbox"]').eq(0).val();
			break;
		case '5':
		case '6':
			parserValue = $(targetActivity).find('input[name="compo_radio"]').eq(0).val();
			break;
		case '9':
			$(targetActivity).find('input[name="compo_date"]').each(function() {
				if(parserValue != '')
					parserValue += ',';
				parserValue += $(this).val();
			});
			break;
		case '10':
			$(targetActivity).find('input[name="compo_time"]').each(function() {
				if(parserValue != '')
					parserValue += ',';
				parserValue += $(this).val();
			});
			break;
		case '14':
			var inputName = ['compo_county', 'compo_area', 'compo_village'];
			for(var i = 0; i < inputName.length; i++) {
				parserValue += (!!$(targetActivity).find('input[name="'+inputName[i]+'"]').eq(0).attr('value') ? 
								$(targetActivity).find('input[name="'+inputName[i]+'"]').eq(0).attr('value') : "") + ",";
			}
			parserValue += $(targetActivity).find('input[name="compo_address"]').eq(0).val();
			break;
		case '0':
		case '1':
		case '11':
		case '16':
		case '17':
			parserValue = $(targetActivity).find('input').eq(0).val();
			break;
		default :
			break;
		}

		return parserValue;
	}
}

function formEditInit(id) {
	return $.ajax({
		type: 'GET',
		url: restapi('/form/queryFormBody') + "?id=" + id,
		contentType: 'application/json; charset=utf-8',
	    dataType : "json",
	    async:false,
	    success: function(response) {
	    	buildForm(response);
	    	
	    },
	    error: function(response) {
	    	link('/ADS/webconsole/form/');
	    }
	});
}

function buildForm(response) {
	var main = document.getElementById("form_edit");
	var data = JSON.parse(response.form);
	
	$('.form-name').val(response.name);
	$('.tip').hide();
	var temp = {
			group_id: null,
			row_id: null,
			idx: null,
			targetG: null,
			targetR: null
	}

	for(var i = 0; i < (data.length-2); i++) {
		var comp = data[i];
		var element;
		
		if(comp.col_type == '1' && comp.editable == 'N') {
			comp.col_type = '0';
		}
		
		if(!!comp.group_id) {
			if(temp.group_id != comp.group_id) {
				temp.targetG = FormDnD.formAppend('-1');
				element = temp.targetG;
				$(element).find('.group_title h3').eq(0).text(comp.group_name);
			}

			if(!!comp.row_id) {
				if(temp.row_id != comp.row_id) {
					temp.targetR = FormDnD.groupAppend('-2', temp.targetG.childNodes[3]);
					$(temp.targetR).find('.row_context').sortable();
					element = temp.targetR;
					initComp(element, comp);
				}
				element = FormDnD.rowAppend(comp.col_type, temp.targetR.childNodes[3]);
				initComp(element, comp);
				temp.idx = i;
				temp.row_id	= comp.row_id;

			} else {
				element = FormDnD.groupAppend(comp.col_type, temp.targetG.childNodes[3]);
				initComp(element, comp);
			}
			
			temp.idx = i;
			temp.group_id = comp.group_id;
		} else if(!!comp.row_id) {
			if(temp.row_id != comp.row_id)
				temp.targetR = FormDnD.formAppend('-2');
			element = FormDnD.rowAppend(comp.col_type, temp.targetR.childNodes[3]);
			initComp(element, comp);
			temp.idx = i;
			temp.row_id	= comp.row_id;
		} else {
			element = FormDnD.formAppend(comp.col_type);
			initComp(element, comp);
		}
	}
	
	function initComp(element, comp) {
		$(element).find('.form-label').eq(0).text(comp.col_name);
		
		switch(comp.col_type) {
		case '0':
			$(element).find('input[name="compo_label"]').eq(0).val(comp.def_value);
			$(element).find('input[name="compo_label"]').eq(0).attr('maxlength',comp.maxlength);
			break;
		case '1':
			$(element).find('input[name="compo_text"]').eq(0).val(comp.def_value);
			$(element).find('input[name="compo_text"]').eq(0).attr('maxlength',comp.maxlength);
			break;
		case '2':
			$(element).find('textarea[name="textarea"]').eq(0).val(comp.def_value);
			$(element).find('textarea[name="textarea"]').eq(0).attr('maxlength',comp.maxlength);
			break;
		case '3':
				$(element).find('li').each(function(){$(this).removeClass('active');});
				var weekDay = comp.def_value.split(',');
//				weekDay.forEach(function(v) {
//					$(element).find('li').each(function(idx) {
//						if($(this).val() == v) {
//							$(this).addClass('active');
//							return false;
//						}
//					});
//				});
				
				for(var i = 0; i < weekDay.length; i++) {
					var v = weekDay[i];
					$(element).find('li').each(function(idx) {
						if($(this).val() == v) {
							$(this).addClass('active');
							return false;
						}
					});
				}
			break;
		case '7':
			$(element).find('.form-label').eq(1).text(lang.form.vertical);
			$(element).find('input[name="compo_checkbox"]').eq(0).val(comp.key_code);
			break;
		case '4':
			$(element).find('.form-label').eq(1).text(lang.form.horizontal);
			$(element).find('input[name="compo_checkbox"]').eq(0).val(comp.key_code);
			break;
		case '8':
			$(element).find('.form-label').eq(1).text(lang.form.dropdownlist);
			$(element).find('input[name="compo_checkbox"]').eq(0).val(comp.key_code);
			break;
		case '5':
			$(element).find('.form-label').eq(1).text(lang.form.horizontal);
			$(element).find('input[name="compo_radio"]').eq(0).val(comp.key_code);
			break;
		case '6':
			$(element).find('.form-label').eq(1).text(lang.form.dropdownlist);
			$(element).find('input[name="compo_radio"]').eq(0).val(comp.key_code);
			break;
		case '9':
			var seDate = comp.def_value.split(',');
			if(comp.hasfromto == 'Y') {
				$(element).find('.context').append('<input class="form-control" type="date" name="compo_date">');
				$(element).find('input[name="compo_date"]').each(function(idx){
					$(this).prop('style', 'width:49%; display:inline');
					$(this).prop('disabled', true);
					if(seDate.length == 2) {
						$(this).val(seDate[idx]);
						$(this).attr('style', 'width:49%; display:inline');
					}

				});
				$(element).find('.icon_fromto').show();
			} else {
				$(element).find('input[name="compo_date"]').eq(0).val(comp.def_value);
			}
			break;
		case '10':
			var seTime = comp.def_value.split(',');
			if(comp.hasfromto == 'Y') {
				$(element).find('.context').append('<input class="form-control" type="time" name="compo_time">');
				$(element).find('input[name="compo_time"]').each(function(idx){
					$(this).prop('style', 'width:49%; display:inline');
					$(this).prop('disabled', true);
					if(seTime.length == 2) {
						$(this).val(seTime[idx]);
						$(this).attr('style', 'width:49%; display:inline');
					}
				});
				$(element).find('.icon_fromto').show();
			} else {
				$(element).find('input[name="compo_time"]').eq(0).val(comp.def_value);
			}
			break;
		case '11':
			$(element).find('input[name="compo_range"]').eq(0).attr('min', comp.minval);
			$(element).find('input[name="compo_range"]').eq(0).attr('max', comp.maxval);
			$(element).find('input[name="compo_range"]').eq(0).attr('step', comp.intval);
			$(element).find('input[name="compo_range"]').eq(0).attr('value', comp.def_value);
//			$(element).find('input[name="compo_range"]').eq(0).attr('value', (comp.def_value != '')? comp.def_value : comp.minval);
//			$(element).find('.range-slider-value').text((comp.def_value != '')? comp.def_value : comp.minval);
			break;
		case '14':
			var address = comp.def_value.split(',');
			var elName = ['compo_county', 'compo_area', 'compo_village'];
			
			for(var i = 0; i < FormGlobalData.addressData.length; i++) {
				var codes = FormGlobalData.addressData[i];
				for(var j = 0; j < codes.length; j++) {
					if(address[i] == codes[j].key_id) {
						$(element).find('input[name="'+elName[i]+'"]').eq(0).attr('value', codes[j].key_id);
						$(element).find('input[name="'+elName[i]+'"]').eq(0).val(codes[j].key_name);
					}
				}
			}
			
			$(element).find('input[name="compo_address"]').val(address[3]);
			break;
		case '16':
			$(element).find('input[name="compo_phone"]').eq(0).attr('value', comp.def_value);
			break;
		case '17':
			$(element).find('input[name="compo_email"]').eq(0).attr('value', comp.def_value);
			break;
		}
		
		if(comp.required == 'Y')
			$(element).find('.icon_req').show();
	}
}
