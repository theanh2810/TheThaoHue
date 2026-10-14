$(document).ready(function(){
	'use strict';
	//Login Register Validation
	if($("form.form-horizontal").attr("novalidate")!=undefined){
		$("input,select,textarea").not("[type=submit]").jqBootstrapValidation();
	}

	// Remember checkbox
	if($('.chk-remember').length){
		$('.chk-remember').iCheck({
			checkboxClass: 'icheckbox_square-blue',
			radioClass: 'iradio_square-blue',
		});
	}

	$('#showHidePassword').on('click', function () {
		let typeInput = $('#user-password').attr('type')
		if (typeInput === 'password') {
			$('#user-password').attr('type', 'text')
			$(this).removeClass('icon_fluent_eye_off_filled')
			$(this).addClass('icon_fluent_eye_filled')
		} else {
			$('#user-password').attr('type', 'password')
			$(this).removeClass('icon_fluent_eye_filled')
			$(this).addClass('icon_fluent_eye_off_filled')
		}
	});
});
