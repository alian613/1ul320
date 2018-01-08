var Component = {
//		Text: '<div class="draggable-component activity" draggable="true" value="0"><input type="text" value="1"></div>',
//		TextArea: '<div class="draggable-component activity" draggable="true value="1"><input type="text" value="2"></div>',
//		Radio: '<div class="draggable-component activity" draggable="true" value="2"><input type="text" value="3"></div>',
//		CheckBox: '<div class="draggable-component activity" draggable="true" value="3"><input type="text" value="4"></div>'
		Label: $('#compo_label_html').html(),
		Text: $('#compo_text_html').html(),
		TextArea: $('#compo_textarea_html').html(),
		WeekDay: $('#compo_weekday_html').html(),
		CheckBox: $('#compo_checkbox_html').html(),
		Radio: $('#compo_radio_html').html(),
		Date: $('#compo_date_html').html(),
		Time: $('#compo_time_html').html(),
		Range: $('#compo_range_html').html(),
		Address: $('#compo_address_html').html(),
		Phone: $('#compo_phone_html').html(),
		Email: $('#compo_email_html').html(),
		Button: $('#compo_button_html').html(),
		Group: $('#compo_group_html').html(),
		Row: $('#compo_row_html').html()
};

!function(){
	Component.get = function (col_type) {
		switch(parseInt(col_type)) {
		case 0:
			return this.Label.replace('<script>dw(lang.form.label);</script>', '');
		case 1:
			return this.Text.replace('<script>dw(lang.form.text);</script>', '');
		case 2:
			return this.TextArea.replace('<script>dw(lang.form.textarea);</script>', '');
		case 3:
			return this.WeekDay.replace('<script>dw(lang.form.week);</script>', '');
		case 4:
		case 7:
		case 8:
			this.CheckBox = this.CheckBox.split('<script>dw(lang.form.checkbox);</script>').join('')
			return this.CheckBox.replace('<script>dw(lang.form.vertical);</script>', '');
		case 5:
		case 6:
			this.Radio = this.Radio.split('<script>dw(lang.form.radio);</script>').join('');
			return this.Radio.replace('<script>dw(lang.form.horizontal);</script>', '');
		case 9:
			return this.Date.replace('<script>dw(lang.form.date);</script>', '');
		case 10:
			return this.Time.replace('<script>dw(lang.form.time);</script>', '');	
		case 11:
			return this.Range.replace('<script>dw(lang.form.range);</script>', '');
		case 12:
			return this.Button.replace('<script>dw(lang.form.button);</script>', '');
		case 14:
			return this.Address.replace('<script>dw(lang.form.address);</script>', '');
		case 16:
			return this.Phone.replace('<script>dw(lang.form.phone);</script>', '');
		case 17:
			return this.Email.replace('<script>dw(lang.form.email);</script>', '');
		case -1:
			return this.Group.replace('<script>dw(lang.form.group);</script>', '');
		case -2:
			return this.Row.replace('<script>dw(lang.form.row);</script>', '');
		}
	}
}();