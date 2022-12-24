/**
 * Valida el formulario de signup y el e edición de perfil antes de proceder a su envío.
 * En caso de error, se muestra una alerta indicando los campos que no son válidos.
 *
 * NOTA: Primera versión de la validación vía JS.
 */
function validateProfile(form) {
	var retorno = true;
	var form = document.forms["signup"];
	if (form["nickname"].value.trim() == "") {
		alert("Nickname is required")
		form["nickname"].focus()
		retorno = false;
	}
	else if (form["surname"].value.trim() == "") {
		alert("surname is required")
		form["surname"].focus()
		retorno = false;
	}

	else if (form["email"].value.trim() == "") {
		alert("Email is required")
		form["email"].focus()
		retorno = false;
	}
	else if (form["passwd"].value.trim() == "") {
		alert("Password is required")
		form["passwd"].focus()
		retorno = false;
	}
	else if (form["passwd"].value != form["confirm"].value) {
		alert("Password and Repeat Password are not equal")
		form["passwd"].focus()
		retorno = false;
	}

	return (retorno);
}

/**
 * Valida el formulario de signup el e edición de perfil antes de proceder a su envío.
 * En caso de error, los mensajes de error se muestran integrados en el documento.
 *
 * NOTA: Versión de la validación vía JS tras estudiar DHTML.
 */
function validateProfileDHTML(form) {
	var form = document.forms["signup"];
	var retorno = true;
	var errores = "";

	form["nickname"].className = ""
	form["surname"].className = ""
	form["email"].className = ""
	form["passwd"].className = ""
	form["confirm"].className = ""


	if (form["nickname"].value.trim() == "") {
		errores += "<li><b>Nickname</b> is required"
		form["nickname"].className = "inputError"
		if (retorno) form["nickname"].focus()
		retorno = false;
	}
	if (form["surname"].value.trim() == "") {
		errores += "<li><b>Surname</b> is required"
		form["surname"].className = "inputError"
		if (retorno) form["surname"].focus()
		retorno = false;
	}

	if (form["email"].value.trim() == "") {
		errores += "<li><b>Email</b> is required"
		form["email"].className = "inputError"
		if (retorno) form["email"].focus()
		retorno = false;
	}

	if (form["passwd"].value.trim() == "") {
		errores += "<li><b>Password</b> is required"
		form["passwd"].className = "inputError"
		if (retorno) form["passwd"].focus()
		retorno = false;
	}
	if (form["confirm"].value.trim() == "") {
		errores += "<li><b>confirm</b> is required"
		form["confirm"].className = "inputError"
		if (retorno) form["confirm"].focus()
		retorno = false;
	}

	if (form["passwd"].value != form["confirm"].value) {
		errores += "<li><b>Password and Repeat Password</b> are not equal"
		form["passwd"].className = "inputError"
		form["confirm"].className = "inputError"
		if (retorno) form["passwd"].focus()
		retorno = false;
	}

	if (!retorno) {
		document.getElementById("errores_profile").innerHTML = errores
		document.getElementById("errores_profile").style.display = "block"
	}

	return (retorno);
}