export function naNextUpdate(caseBody, reportBody) {
	highlighRegionalAccountAffinity()
}

function highlighRegionalAccountAffinity() {
	Array.from(document.getElementsByClassName("x-grid3-col-00N34000005giDv")).forEach(
		function(element, index, array) {
			var texto = element.textContent
			if (texto === "NA - Federal" || texto === "NA - West") {
				element.style = "font-weight: bold; color: #B4DCFD; background-color: #001f3f;"
			} else if (texto.indexOf("EMEA")>=0 || (texto.indexOf("APAC")>=0 && texto !== 'APAC - ANZ') ) {
				element.style = "color: #ddd;"
			}
		}
	);
}