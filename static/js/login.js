/**
 * Valida el formulario de login antes de proceder a su
 * envío. En caso de error, se muestra una alerta indicando
 * los campos que no son válidos.
 *
 * NOTA: Primera versión de la validación vía JS.
 */
function validateLogin() {
	var form = document.forms["login"];
	var retorno = true;

	if (form["email"].value.trim() == "") {
		alert("Email is required")
		form["email"].focus()
		retorno = false;
	}
	else if (form["passwd"].value.trim() == "") {
		alert("Password is required")
		form["passwd"].focus()
		retorno = false;
	}

	return (retorno);
}

/**
 * Valida el formulario de login antes de proceder a su
 * envío. En caso de error, los mensajes de error se
 * muestran integrados en el documento.
 *
 * NOTA: Versión de la validación vía JS tras estudiar
 * DHTML.
 */
function validateLoginDHTML() {
	var form = document.forms["login"];
	var errores = "";
	var retorno = true;

	form["email"].className = "inpust"
	form["passwd"].className = "inpust"

	if (form["email"].value.trim() == "") {
		errores += "<li class=required><b class=required>Email</b> es requerido"
		form["email"].className = "inputError"
		form["email"].focus()
		retorno = false;
	}

	if (form["passwd"].value.trim() == "") {
		errores += "<li class=required><b class=required>Password</b> es requerido"
		form["passwd"].className = "inputError"

		if (retorno) form["passwd"].focus()
		retorno = false;
	}

	if (!retorno) {
		document.getElementById("errores_login").innerHTML = errores
		document.getElementById("errores_login").style.display = "block"
	}

	return (retorno);
}