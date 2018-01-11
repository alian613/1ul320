var ComponentListener = {
	
};

!function(){
	ComponentListener.maxlength = function() {
		function validFunc() {
			var maxlengthEl = document.getElementById('maxlength_text');
			if(!maxlengthEl.checkValidity()) {
				FormGlobalData.valid = false;
//				$(maxlengthEl).attr('data-tip', maxlengthEl.validationMessage);
//				if($('.data-tip').length == 0)
//					$('<label class="data-tip" style="color: red; position: absolute;">' + maxlengthEl.validationMessage + '</label>').insertAfter($(maxlengthEl));
				
				$(maxlengthEl).attr('data-tip', 'length must be 1 ~ 50');
				if($('.data-tip').length == 0)
					$('<label class="data-tip" style="color: red; position: absolute;">' + lang.form.maxlength_err_msg + '</label>').insertAfter($(maxlengthEl));
			} else {
				FormGlobalData.valid = true;
				$(maxlengthEl).removeAttr('data-tip');
				$('.data-tip').remove();
				$('#default_value').find('.form-control').attr('maxlength', $(maxlengthEl).val());
			}
		}
		
		$('#maxlength_text').off('focusout');
		$('#maxlength_text').focusout(function() {
			validFunc();
		});
		
		FormGlobalData.numberEnForcer($('#maxlength_text'), false);
		validFunc();
	};
	
	ComponentListener.date = function() {
		var valid = [true, true];
		
		$('#default_value input[name="compo_date"]').each(function() {
			if ($(this).prop('type') != 'date') {
				$(this).datetimepicker({
					format : 'YYYY-MM-DD'
				});
			}
		});
		
		if(FormGlobalData.isIE)
			return false;
		
		function validAll(pel) {
			function validFunc(el) {
				var idx = el.parent().find('input').index(el);
				var elV;
				if(idx == 0) {
					elV = document.getElementById('default_value').childNodes[idx+1];
				}
				else{
					if(document.getElementById('default_value').childNodes.length > 4){
						elV = document.getElementById('default_value').childNodes[idx+3];
					}
					else {
						elV = document.getElementById('default_value').childNodes[idx+2];
					}
				}
				
				if(!elV.checkValidity()) {
					valid[idx] = false;
					el.attr('data-tip', 'illegal value');
					if(idx == 0) {
						if(!el.parent().children().eq(1).hasClass('data-tip')) {
							$('<label class="data-tip" style="color: red; position: absolute; top: 35px; left: 0px; width:220px">'
									+ 'illegal value' + '</label>').insertAfter(el);
						}
					} else {
						if(!el.parent().children().eq(3).hasClass('data-tip')) {
							$('<label class="data-tip" style="color: red; position: absolute; top: 35px; left: 220px; width:220px">' 
									+ 'illegal value' + '</label>').insertAfter(el);
						}
					}
				} else {
					valid[idx] = true;
					el.removeAttr('data-tip');
					$('.data-tip').eq(idx).remove();
				}
			}
			
			if($('#default_value input[name="compo_date"]').length > 1) {
				$('#default_value input[name="compo_date"]').each(function() {
					validFunc($(this));
				});
			} else {
				validFunc(pel);
			}
			
			if($('#default_value input[name="compo_date"]').length == 1) {
				FormGlobalData.valid = valid[0];
			} else {
				if(valid[0] == true && valid[1] == true)
					FormGlobalData.valid = true;
				else
					FormGlobalData.valid = false;
			}
		}
		
		$('#default_value input[name="compo_date"]').off('focusout');
		$('#default_value input[name="compo_date"]').focusout(function() {
			validAll($(this));
		});
		
		$('#default_value input[name="compo_date"]').each(function() {
			validAll($(this));
		});
	};
	
	ComponentListener.hasFromto = function(col_type) {
		var def_element = document.getElementById('default_value');
		$('#hasfromtoSwitch').off('click');
		$('#hasfromtoSwitch').click(function() {
			var dateORtime;
			if(col_type == 9)
				dateORtime = 'date';
			else if(col_type == 10)
				dateORtime = 'time';
			if($('#hasfromtoSwitch').is(':checked')) {
				$(def_element).append('<input class="form-control" type="'+dateORtime+'" name="compo_'+dateORtime+'">');
				$(def_element).find('input[name="compo_'+dateORtime+'"]').each(function(){
					$(this).attr('style', 'width:49%; display:inline');
				});
			} else {
				$(def_element).find('input[name="compo_'+dateORtime+'"]').eq(1).remove();
				$(def_element).find('input[name="compo_'+dateORtime+'"]').eq(0).attr('style', 'width:100%');
			}
			
			if(dateORtime == 'date')
				ComponentListener.date();
			else
				ComponentListener.ranger();
		});
	};
	
	ComponentListener.time = function() {
		var valid = [true, true];
		
		$('#default_value input[name="compo_time"]').each(function() {
			if ($(this).prop('type') != 'time') {
				$(this).datetimepicker({
					format : 'HH:mm'
				});
			}
		});
		
		if(FormGlobalData.isIE) //IE didn't check, because datetimepicker will do it.
			return false;
		
		function validAll(pel) {
			function validFunc(el) {
				var idx = el.parent().find('input').index(el);
				var elV;
				if(idx == 0) {
					elV = document.getElementById('default_value').childNodes[idx+1];
				}
				else{
					if(document.getElementById('default_value').childNodes.length > 4)
						elV = document.getElementById('default_value').childNodes[idx+3];
					else
						elV = document.getElementById('default_value').childNodes[idx+2];
				}
				
				if(!elV.checkValidity()) {
					valid[idx] = false;
					el.attr('data-tip', 'illegal value');
					if(idx == 0) {
						if(!el.parent().children().eq(1).hasClass('data-tip')) {
							$('<label class="data-tip" style="color: red; position: absolute; top: 35px; left: 0px; width:220px">'
									+ 'illegal value' + '</label>').insertAfter(el);
						}
					} else {
						if(!el.parent().children().eq(3).hasClass('data-tip')) {
							$('<label class="data-tip" style="color: red; position: absolute; top: 35px; left: 220px; width:220px">' 
									+ 'illegal value' + '</label>').insertAfter(el);
						}
					}
				} else {
					valid[idx] = true;
					el.removeAttr('data-tip');
					$('.data-tip').eq(idx).remove();
				}
			}
			
			
			if($('#default_value input[name="compo_time"]').length > 1) {
				$('#default_value input[name="compo_time"]').each(function() {
					validFunc($(this));
				});
			} else {
				validFunc(pel);
			}
			
			if($('#default_value input[name="compo_time"]').length == 1) {
				FormGlobalData.valid = valid[0];
			} else {
				if(valid[0] == true && valid[1] == true)
					FormGlobalData.valid = true;
				else
					FormGlobalData.valid = false;
			}
		}
		
		$('#default_value input[name="compo_time"]').off('focusout');
		$('#default_value input[name="compo_time"]').focusout(function() {
			validAll($(this));
		});
		
		$('#default_value input[name="compo_time"]').each(function() {
			validAll($(this));
		})
	
	};
	
	ComponentListener.ranger = function() {
		var def_element = document.getElementById('default_value');
		function validRangeFunc() {
			var maxVal = document.getElementById('maxVal');
			var minVal = document.getElementById('minVal');
			var stepVal = document.getElementById('stepVal');
			var rangeTuple = [maxVal, minVal, stepVal];
			
			var valid = true;
			
			for(var idx = 0; idx < rangeTuple.length; idx++) {
				var el = rangeTuple[idx];
				if(idx < 2 && !el.checkValidity()) {
					valid = false;
					
					var errMsg;
					if(el.validity.rangeOverflow)
						errMsg = $(el).parent().text().split(');')[1] + lang.form.rangeOverflow + $(el).attr('max');
					else if(el.validity.rangeUnderflow)
						errMsg = $(el).parent().text().split(');')[1] + lang.form.rangeUnderflow + $(el).attr('min');
					else if(el.validity.valueMissing)
						errMsg = lang.form.request_head + $(el).parent().text().split(');')[1];
					
					$('#rangeValidaLabel').text(lang.form.range_setting + " - " + errMsg);
					if(!!el.value.split('.')[1] && el.value.split('.')[1].length > 1) // Value only allow to 1st decimal place
						$('#rangeValidaLabel').text(lang.form.range_setting + " - " + lang.form.decimal_one);
					return;
				}
				
				if(idx == 2 && !el.checkValidity()) {
					valid = false
					if(rangeTuple[idx].value == '')
						$('#rangeValidaLabel').text(lang.form.range_setting + ' - ' + lang.form.interval_cant_null);
					else if(rangeTuple[idx].value == '0')
						$('#rangeValidaLabel').text(lang.form.range_setting + '-' + lang.form.interval_cant_zero);
					else if(parseInt(rangeTuple[idx].value) < 0)
						$('#rangeValidaLabel').text(lang.form.range_setting + '-' + lang.form.interval_cant_negative);
					else if(el.value.split('.')[1].length > 1) // Value only allow to 1st decimal place
						$('#rangeValidaLabel').text(lang.form.range_setting + " - " + lang.form.decimal_one);
					else
						$('#rangeValidaLabel').text(lang.form.range_setting + "-" + lang.form.setting_error);
					return;
				}
				
//				if(parseFloat(maxVal.value) < parseFloat(minVal.value) || ((idx == 2) && ((maxVal.value - minVal.value) < el.value))) {
//					valid = false;
//					$('#rangeValidaLabel').text(lang.form.range_setting + " - " + lang.form.setting_error);
//					return;
//				}
				
				if(parseFloat(maxVal.value) <= parseFloat(minVal.value)) {
					valid = false;
					$('#rangeValidaLabel').text(lang.form.range_setting + " - " + lang.form.min_greaterthan_max_err);
					return;
				} else if((idx == 2) && (parseFloat(new Number(parseFloat(maxVal.value) - parseFloat(minVal.value)).toFixed(1)) < parseFloat(el.value))) {
					//idx = 0
					valid = false;
					$('#rangeValidaLabel').text(lang.form.range_setting + " - " + lang.form.interval_err);
					return;
				} else {
					$('#rangeValidaLabel').text(lang.form.range_setting + " - " + lang.form.setting_error);
				}
			}
			
			var defValue = parseFloat($(def_element).find('input[name="compo_range"]').eq(0).val()) 
				|| parseFloat($(def_element).find('input[name="compo_range"]').eq(0).attr('value'));
			if(defValue > parseFloat(maxVal.value) || defValue < parseFloat(minVal.value)) {
				$('#rangeValidaLabel').text(lang.form.range_setting + " - " + lang.form.setting_error);
			}
			
			if(valid) {
				$('#rangeValidaLabel').text('');
				$(def_element).find('input[name="compo_range"]').eq(0).attr('min', parseFloat($('#minVal').val()));
				$(def_element).find('input[name="compo_range"]').eq(0).attr('max', parseFloat($('#maxVal').val()));
				$(def_element).find('input[name="compo_range"]').eq(0).attr('step', parseFloat($('#stepVal').val()));
//				$(def_element).find('input[name="compo_range"]').eq(0).prop('value', $('#minVal').val());
//				$(def_element).find('input[name="compo_range"]').eq(0).attr('value', $('#minVal').val());
//				$(def_element).find('input[name="compo_range"').eq(0).text($('#minVal').val()); //range silder text.
			}
			
			return valid;
		}
		
		function validDefFunc() {
			var valid = true;
			var el = (document.getElementById('default_value').childNodes.length > 1) ? 
					document.getElementById('default_value').childNodes[1] : document.getElementById('default_value').childNodes[0];
			if(!el.checkValidity()) {
				valid = false;
				$('#defaultValidaLabel').text(lang.form.def + " - " + lang.form.setting_error);
			} else {
				$('#defaultValidaLabel').text('');
			}
			
			if(valid)
				$(def_element).find('input[name="compo_range"]').eq(0).prop('value', parseFloat($('#default_value input[name="compo_range"]').val()));
			
			return valid;
		}
		
		function validAllFunc() {
			if(validRange && validDef) 
				FormGlobalData.valid = true;
			else
				FormGlobalData.valid = false;
		}
		
		
		var validRange = validRangeFunc();
		var validDef = validDefFunc();
		$('#range_block').off('focusout');
		$('#range_block input').focusout(function() {
			validRange = validRangeFunc();
			validDef = validDefFunc();
			validAllFunc();
		});
		
		
		$('#default_value input[name="compo_range"]').off('focusout');
		$('#default_value input[name="compo_range"]').focusout(function() {
			$('#default_value input[name="compo_range"]').attr('value', 
					$('#default_value input[name="compo_range"]').prop('value'));
			validRange = validRangeFunc();
			validDef = validDefFunc();
			validAllFunc();
		});
		
		FormGlobalData.numberEnForcer($('#minVal'), true);
		FormGlobalData.numberEnForcer($('#maxVal'), true);
		FormGlobalData.numberEnForcer($('#stepVal'), true);
		FormGlobalData.numberEnForcer($('#default_value input[name="compo_range"]'), true);
		validAllFunc();
	
	};
	
	ComponentListener.address = function() {
		$('#countyVal').change(function() {
			FormGlobalData.processAddressComp('#countyVal', '#areaVal');
			FormGlobalData.processAddressComp('#areaVal', '#villageVal');
		});
		$('#areaVal').change(function() {
			FormGlobalData.processAddressComp('#areaVal', '#villageVal');
		});
	}
	
	ComponentListener.email = function() {
		function validFunc(el) {
			var emailEl = document.getElementById('default_value').childNodes[1];
			console.log(emailEl);
			console.log(emailEl.checkValidity());
			if(!emailEl.checkValidity()) {
				$(emailEl).attr('data-tip', emailEl.validationMessage);
				if($('.data-tip').length == 0)
					$('<label class="data-tip" style="color: red; position: absolute;">' + emailEl.validationMessage + '</label>').insertAfter($(emailEl));
			} else {
				FormGlobalData.valid = true;
				$(emailEl).removeAttr('data-tip');
				$('.data-tip').remove();
			}
		}
		
		$('#default_value input[name="compo_email"]').off('focusout');
		$('#default_value input[name="compo_email"]').focusout(function() {
			console.log('.....');
			validFunc($(this));
		});
		
		$('#default_value input[name="compo_email"]').each(function() {
			validFunc($(this));
		})
	}

}();

//function rangerListener() {
//$('#setRangeBtn').off('click');
//$('#rangeValidaLabel').text("");
//$('#setRangeBtn').click(function() {
//	var maxVal = document.getElementById('maxVal');
//	var minVal = document.getElementById('minVal');
//	var stepVal = document.getElementById('stepVal');
//	var rangeTuple = [maxVal, minVal, stepVal];
//	
//	var valid = true;
////	rangeTuple.forEach(function(el, idx) {
////		if(idx < 2 && !el.checkValidity()) {
////			valid = false;
////			$('#rangeValidaLabel').text(el.getAttribute('data-value') + el.validationMessage);
////		}
////		
////		if(parseInt(maxVal.value) < parseInt(minVal.value) || ((idx == 2) && ((maxVal.value - minVal.value) < el.value))) {
////			valid = false;
////			$('#rangeValidaLabel').text(lang.form.setting_error);
////		}
////	});
//	
//	for(var idx = 0; idx < rangeTuple.length; idx++) {
//		var el = rangeTuple[idx];
//		if(idx < 2 && !el.checkValidity()) {
//			valid = false;
//			$('#rangeValidaLabel').text(el.getAttribute('data-value') + el.validationMessage);
//		}
//		
//		if(parseFloat(maxVal.value) < parseFloat(minVal.value) || ((idx == 2) && ((maxVal.value - minVal.value) < el.value))) {
//			valid = false;
//			$('#rangeValidaLabel').text(lang.form.setting_error);
//		}
//	}
//	
//	if(valid) {
//		$('#rangeValidaLabel').text('');
//		$(def_element).find('.range-slider-range').eq(0).attr('min', $('#minVal').val());
//		$(def_element).find('.range-slider-range').eq(0).attr('max', $('#maxVal').val());
//		$(def_element).find('.range-slider-range').eq(0).attr('step', $('#stepVal').val());
//		$(def_element).find('.range-slider-range').eq(0).prop('value', $('#minVal').val());
//		$(def_element).find('.range-slider-range').eq(0).attr('value', $('#minVal').val());
//		$(def_element).find('.range-slider-value').eq(0).text($('#minVal').val());
//	}
//});
//}
//rangerListener();
