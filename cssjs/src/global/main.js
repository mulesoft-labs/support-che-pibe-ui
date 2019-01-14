"use strict";

import './main.css';
import {latamNextUpdate} from '../latam/region.js';
import {emeaNextUpdate} from '../emea/region.js';
import {apacNextUpdate} from '../apac/region.js';
import {naNextUpdate} from '../na/region.js';
import {isDue, daysToDueDate} from '../common/common.js';

function reviewNextUpdate(){
	let caseBody = getCaseBody();
	let reportBody = getReportBody();
	if (caseBody) {
		markInternalComments(caseBody)		
		showCaseLog(caseBody)
		showCsat(caseBody)
		createRelatedFilesLinks(caseBody)
		enhanceCaseTitle(caseBody)
	}

	if (reportBody) {
		updateSupportActiveQueue(reportBody)		
	}

	hightlightPastDueDates()
	hightlightStatus()
	numberLists()

	// Region functions
	if(require('../latam/region.js')) {
		latamNextUpdate(caseBody, reportBody)
	}
	if(require('../emea/region.js')) {
		emeaNextUpdate(caseBody, reportBody)
	}
	if(require('../apac/region.js')) {
		apacNextUpdate(caseBody, reportBody)
	}
	if(require('../na/region.js')) {
		naNextUpdate(caseBody, reportBody)
	}
}

function numberLists() {
	Array.from(document.getElementsByClassName("x-grid3-td-checkbox")).forEach(
		function(element, index, array) {
			element.style.width = "50px"
			var innerDiv = element.children[0]
			if (innerDiv.className.indexOf("x-grid3-col-checkbox") > 0) {
				if (innerDiv.children.length > 1) {
					var posLabel = innerDiv.children[1]
					posLabel.innerHTML = `
							<span style="display: inline-block; width: 20px; color: #85144B; background-color: #FFFFFF; border-radius: 3px; margin-left: 5px; text-align: center;">
								${index}
							</span>`
				} else {
					var posLabel = document.createElement("SPAN");
					posLabel.innerHTML = `
							<span style="display: inline-block; width: 20px; color: #85144B; background-color: #FFFFFF; border-radius: 3px; margin-left: 5px; text-align: center;">
								${index}
							</span>`
							innerDiv.appendChild(posLabel)
				}    			
			}
		}
)
}

function createRelatedFilesLinks(caseBody) {
	if (! caseBody.hasAttribute('data-downloadlinks')) {
		const caseId = caseBody.querySelector(".efhpFixed.efhpLeftCollapsed.efhpRightCollapsed.efhpHighlightPanel.efhCompact.efhpConsoleStyle").id.replace("highlight_panel_","");
		const relatedFilesContainer = caseBody.querySelector(`[id='${caseId}_RelatedFileList']`);
		let relatedFiles = relatedFilesContainer.querySelectorAll('.dataRow');
		let files = {}
		for (let i = relatedFiles.length - 1; i >= 0; i--) {
			let relatedFile = relatedFiles[i];
			const downloadAnchor = relatedFile.querySelector('.actionColumn').querySelector(`[title^='Download - ']`);
			const filename = relatedFile.querySelector('.cellCol1').innerText;
			const fileDate = relatedFile.querySelector('.cellCol2').innerText;
			const fileUsername = relatedFile.querySelector('.cellCol3').innerText;
			files[`${fileUsername} (${fileDate}) ${filename}`] = downloadAnchor.href;
		}
		const relatedCommentsContainer = caseBody.querySelector(`[id='${caseId}_RelatedCommentsList']`);
		let comments = relatedCommentsContainer.querySelectorAll('.dataCell.cellCol2');
		for (let i = comments.length - 1; i >= 0; i--) {
			let commentNode = comments[i];
			let commentText = commentNode.innerText;
			let nameAndDate = commentText.slice(12,commentText.indexOf("\n"));
			const regex = /has attached file "(.*)" to the case. Please review.$/gm;
			let isComment = regex.exec(commentText)
			if (isComment) {
				const filename = isComment[1];
				const filenameWithoutExt = filename.split('.').slice(0, -1).join('.')
				// const filenameWithoutExt = filename.slice(0, filename.length - 4)
				let link = files[`${nameAndDate} ${filenameWithoutExt}`];
				if (link) {
					let downloadNode = document.createElement("DIV");
					downloadNode.innerHTML = `<a class="downloadLink" target="_blank" href="${link}">Download</a><strong>${filename}</strong>`
					commentNode.insertBefore(downloadNode, commentNode.querySelector('b'));
					commentNode.classList.add('is-upload-comment')
				} else {
					console.error(`link missed ${filename} | ${nameAndDate}`, files);
				}
			}
		}
		caseBody.setAttribute("data-downloadlinks", "");
	}
}

function hightlightStatus() {
	Array.from(document.getElementsByClassName("x-grid3-td-CASES_STATUS")).forEach(
		function(element, index, array) {
			const status = element.children[0].textContent.replace(/ /g, "-").toLowerCase()
			element.classList.forEach(
			  function(value, key, listObj) {
			  	if (value.startsWith("case-status-")) element.classList.remove(value)
			  }
			);
			element.classList.add(`case-status-${status}`)
		}
	);
}

function convertToDDHHMM(minutes) {
	const dd = Math.floor( minutes / 60 /24 )
    const hh = Math.floor( (minutes / 60) - (dd * 24) );    
    const mm = minutes % 60 < 10 ? '0' + minutes % 60 : minutes % 60;
    return dd > 0 ?  `${dd}d ${hh}:${mm} ` : `${hh}:${mm}`
}

function showCsat(caseBody) {
	if (caseBody && ! caseBody.hasAttribute('data-casecsat')) {
		var caseId = caseBody.querySelector(".efhpFixed.efhpLeftCollapsed.efhpRightCollapsed.efhpHighlightPanel.efhCompact.efhpConsoleStyle").id.replace("highlight_panel_","")
		var csatNode = caseBody.querySelector(`#csat_${caseId}`)
		if (! csatNode) {
			var efdRelatedLists = caseBody.querySelector(".efdRelatedLists")
			csatNode = document.createElement("DIV");
			csatNode.innerHTML = `
				<div class="bRelatedList csat-container" id="csat_${caseId}">
					<div class="listRelatedObject caseBlock">
						<div class="bPageBlock brandSecondaryBrd secondaryPalette">
							<div class="csat-container__body" id="Csat_body_${caseId}">
								<span class="noRowsHeader">No CSAT records to display</span>
							</div>
						</div>
					</div>
				</div>
			`

			var reqOpts = {
				headers: {
					'client_id': '65b41104c0a64616b6c91ce06b456763', 
					'client_secret': '9B433365Dfa8409A9291FE16f686Cda4'
				}
			}
			fetch(`https://support-control-panel-api.cloudhub.io/api/csat/${caseId}`, reqOpts)
				.then(function(response) {
					if(response.ok) {
						response.json().then(function(data) {
							if (data.q1) {
								var caseLogBody = csatNode.querySelector(`#Csat_body_${caseId}`)
								var caseLogBodyHTML = `
									<div class="csat-container__body__score">
										<div class="score score--${data.q1}">${data.q1 * 20}%</div>
										<div class="comments">${data.q5}</div>
									</div>
									<hr/>
									<ul class="csat-container__body__questions">
										<li>
										<div class="csat-container__body__question"><div class="score score--${data.q1}">${data.q1}</div><div class="title">Q1) Overall, how satisfied were you with the support you received for this case?</div></div>
										</li>
										<li>
									<div class="csat-container__body__question"><div class="score score--${data.q2}">${data.q2}</div><div class="title">Q2) Did MuleSoft Support make it easy for you to handle your issue?</div></div>
										</li>
										<li>
									<div class="csat-container__body__question"><div class="score score--${data.q3}">${data.q3}</div><div class="title">Q3) Did the Support Engineer handling your case demonstrate a detailed, thorough understanding of the issue you reported (5=thorough understanding, 1=no understanding)?</div></div>
										</li>
										<li>
									<div class="csat-container__body__question"><div class="score score--${data.q4}">${data.q4}</div><div class="title">Q4) Did the MuleSoft Support Engineer keep you updated on the status of your case, and provide timely responses?</div></div>
										</li>
									</ul>
									`
							    console.log(data);
								caseLogBody.innerHTML = caseLogBodyHTML
							}
					    });

					} else {
						console.log('Respuesta de red OK.');
					}
				})
				.catch(function(error) {
				  console.log('Hubo un problema con la petición Fetch:' + error.message);
				});
			efdRelatedLists.insertBefore(csatNode, efdRelatedLists.childNodes[0])
			caseBody.setAttribute('data-casecsat','');
		}
	}	
}

function showCaseLog(caseBody) {
	if (caseBody && ! caseBody.hasAttribute('data-caselog')) {
		const caseId = caseBody.querySelector(".efhpFixed.efhpLeftCollapsed.efhpRightCollapsed.efhpHighlightPanel.efhCompact.efhpConsoleStyle").id.replace("highlight_panel_","")
		let caseLogNode = caseBody.querySelector(`#caseLog_${caseId}`)
		if (! caseLogNode) {
			let efdRelatedLists = caseBody.querySelector(".efdRelatedLists")
			caseLogNode = document.createElement("DIV");
			caseLogNode.innerHTML = `
				<div class="bRelatedList" id="caseLog_${caseId}">
					<div class="listRelatedObject caseBlock">
						<div class="bPageBlock brandSecondaryBrd secondaryPalette">
							<div class="pbHeader">
								<table border="0" cellpadding="0" cellspacing="0">
									<tbody>
										<tr>
											<td class="pbTitle" style="height: 36px;"><h3>Case Log</h3></td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="pbBody" id="CaseLog_body_${caseId}">
								<table class="list" border="0" cellspacing="0" cellpadding="0">
									<tbody>
										<tr class="headerRow"><th scope="col" class="noRowsHeader">No records to display</th></tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			`

			var reqOpts = {
				headers: {
					'client_id': '65b41104c0a64616b6c91ce06b456763', 
					'client_secret': '9B433365Dfa8409A9291FE16f686Cda4'
				}
			}
			fetch(`https://support-control-panel-api.cloudhub.io/api/case-log/${caseId}`, reqOpts)
				.then(function(response) {
					if(response.ok) {
						response.json().then(function(data) {
							let caseLogBody = caseLogNode.querySelector(`#CaseLog_body_${caseId}`)
							let caseLogBodyHTML = `
								<p style="padding: 0 10px;">Number of interactions <strong>${data.interactions.length}</strong></p>
								<p style="padding: 0 10px;">Total time <strong>${data.phases.totalTime}</strong></p>
								<table class="list caseLog" border="0" cellspacing="0" cellpadding="0">
								  <tbody>
								    <tr class="headerRow">
								      <th scope="col" class="zen-deemphasize">User</th>
								      <th scope="col" class="zen-deemphasize"></th>
								      <th scope="col" class="zen-deemphasize">Total Time (min)</th>
								      <th scope="col" class="zen-deemphasize">Total Iteration</th>
								      <th scope="col" class="zen-deemphasize">DISPATCH Total Time (min)</th>
								      <th scope="col" class="zen-deemphasize">DISPATCH Total Iteration</th>
								      <th scope="col" class="zen-deemphasize">WORK Total Time (min)</th>
								      <th scope="col" class="zen-deemphasize">WORK Total Iteration</th>
								    </tr>`
						    console.log(data);
							for (let i = 0; i < data.users.metrics.length; i++) {
								let metric = data.users.metrics[i]
								caseLogBodyHTML += `
									<tr class="dataRow ${metric.isMulesoft ? 'team-support' : 'team-customer'}">
									<td class="dataCell">${metric.name}</td>
									<td class="dataCell">${metric.isMulesoft ? 'SUPPORT' : 'CUSTOMER'}</td>
									<td class="dataCell align-right">${convertToDDHHMM(metric.totalTime)}</td>
									<td class="dataCell align-right">${metric.totalCount}</td>
									<td class="dataCell align-right">${convertToDDHHMM(metric.totalTime_DISPATCH)}</td>
									<td class="dataCell align-right">${metric.totalCount_DISPATCH}</td>
									<td class="dataCell align-right">${convertToDDHHMM(metric.totalTime_WORK)}</td>
									<td class="dataCell align-right">${metric.totalCount_WORK}</td>
									</tr>`
							}
							caseLogBodyHTML += "</tbody></table>"
							caseLogBody.innerHTML = caseLogBodyHTML
							let caseHistoryNode = caseBody.querySelector('[id$=_RelatedEntityHistoryList]');
							if (caseHistoryNode) {
								efdRelatedLists.insertBefore(caseLogNode, caseHistoryNode)
							}
					    });
					} else {
						console.log('Respuesta de red OK.');
					}
				})
				.catch(function(error) {
				  console.log('Hubo un problema con la petición Fetch:' + error.message);
				});
			caseBody.setAttribute('data-caselog','');
		}
	}	
}

function enhanceCaseTitle(caseBody) {
	if (! caseBody.hasAttribute('data-casetitle')) {
		var titleNode = caseBody.querySelector(".efhpTitle")
		if (titleNode.children.length == 0) {
			var severity = caseBody.querySelector("#cas8_ileinner").textContent
			titleNode.innerHTML = `<img src="https://support-che-pibe-ui.us-w1.cloudhub.io/static/${severity}_16_16.png" style="height: 25px;margin-right: 5px;">${titleNode.textContent}`
			titleNode.style = "display: flex;align-items: center; font-size: 2em;"
		}
		caseBody.setAttribute('data-casetitle','');
	}
}

function getCaseBody() {
	var activeTab = document.querySelector(".x-tab-strip-active")
	if (activeTab) {
		if (activeTab.className.indexOf("caseTab")>=0) {
			return document.querySelector("#" + activeTab.id.replace("navigatortab__", "")).querySelectorAll('iframe')[0].contentWindow.document.body
		}
	}
	return null
}

function hightlightPastDueDates() {
	try {
		Array.from(document.getElementsByClassName("x-grid3-col-00N34000005a4bZ")).forEach(
	       function(element, index, array) {
				if (isDue(element.innerText)) {
				    element.style.backgroundColor="#FF4136";
				    element.style.color="#FFFFFF";
				} else if (daysToDueDate(element.innerText) <= 0) {
				    element.style.backgroundColor="#c93";
				    element.style.color="#FFFFFF";
			    }
	       }
	   );
		var caseTabDueDate = document.getElementById("00N34000005a4bZ_ilecell")
		if (caseTabDueDate) {
			var dateTxt = caseTabDueDate.children[0].innerText
			if (isDue(dateTxt)) {
				caseTabDueDate.style.backgroundColor="#FF4136";
				caseTabDueDate.style.color="#FFFFFF";	
			} else if (daysToDueDate(dateTxt) <= 0) {
			    caseTabDueDate.style.backgroundColor="#c93";
			    caseTabDueDate.style.color="#FFFFFF";
		    }
		}
	} catch (err) {

	}
}

function markInternalComments(caseBody) {
	if (caseBody && ! caseBody.hasAttribute('data-intcommts')) {
		const caseId = caseBody.querySelector(".efhpFixed.efhpLeftCollapsed.efhpRightCollapsed.efhpHighlightPanel.efhCompact.efhpConsoleStyle").id.replace("highlight_panel_","");
		const relatedCommentsContainer = caseBody.querySelector(`[id='${caseId}_RelatedCommentsList']`);
		if (relatedCommentsContainer) {
			let comments = relatedCommentsContainer.querySelectorAll('.dataRow')
			for (let i = comments.length - 1; i >= 0; i--) {
				let checkerImg = comments[i].querySelector('.checkImg')
				if (checkerImg.title === 'Not Checked') {
					comments[i].classList.add('private-comment')
				}
			}
		}
		caseBody.setAttribute('data-intcommts','');
	}
}

function getReportBody() {
	var activeTab = document.querySelector(".x-tab-strip-active")
	if (activeTab) {
		if (activeTab.className.indexOf("reportTab")>=0) {
			return document.querySelector("#" + activeTab.id.replace("navigatortab__", "")).querySelectorAll('iframe')[0].contentWindow.document.body
		}
	}
	return null
}

function updateSupportActiveQueue(reportBody) {
	try {
		if (reportBody) {
			let titleNode = reportBody.querySelector(".noSecondHeader.pageType")
			if (titleNode.innerText === "Support Active Queue") {
				let tabla = reportBody.querySelector(".reportTable.tabularReportTable")
				let resumen = []
				if (tabla) {
					let filas = tabla.getElementsByTagName("tr")
					let currentHeaderNode = null
					let currentName = ""
					let currentRole = ""
					let currentCaseCounts = { escalado: 0, undispatched: 0, overdue: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 }
					for (let i = 0; i < filas.length; i++) {
						var fila = filas[i]
						if (fila.className === "breakRowClass0 breakRowClass0Top") {
							currentRole = fila.getElementsByClassName("groupvalue")[0].textContent
						} else if (fila.className === "breakRowClass1 breakRowClass1Top") {
							if (currentHeaderNode) {
								resumen.push(currentCaseCounts)
							}
							currentName = fila.getElementsByClassName("groupvalue")[0].textContent
							currentHeaderNode = fila.children[1]
							currentCaseCounts = { name: currentName, role: currentRole, escalado: 0, undispatched: 0, overdue: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 }
						} else if (fila.className === "grandTotal grandTotalTop" || fila.className === "grandTotal" ) {
							if (currentHeaderNode) {
								resumen.push(currentCaseCounts)
							}
							currentHeaderNode = null
						} else if (fila.className === "even" || fila.className === "odd") {
							currentCaseCounts.total ++
							var severity = fila.children[2].textContent
							currentCaseCounts[severity] ++
							if (fila.children[3] && fila.children[3].children[0] && fila.children[3].children[0].title === "Checked" ) {
								currentCaseCounts.escalado ++
							}
							if (fila.children[4] && fila.children[4].children[0] && fila.children[4].children[0].title === "Not Checked" ) {
								currentCaseCounts.undispatched ++
							}
							var nextUpdateDue = fila.children[7].textContent
							if (isDue(nextUpdateDue)) {
				               currentCaseCounts.overdue ++
						    }
						}
					}
					console.log(resumen)
				}
				let platformQueue = resumen
					.filter (item => item.name === "Platform Support")
					.reduce (sumAllCaseValues, { people: 0, escalado: 0, undispatched: 0, overdue: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 })
				let supportQueue = resumen
					.filter (item => item.name === "Support")
					.reduce (sumAllCaseValues, { people: 0, escalado: 0, undispatched: 0, overdue: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 })
				let latamQueue = resumen
					.filter (item => item.role.startsWith("LATAM "))
					.reduce (sumAllCaseValues, { people: 0, escalado: 0, undispatched: 0, overdue: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 })
				let naQueue = resumen
					.filter (item => item.role.startsWith("NA "))
					.reduce (sumAllCaseValues, { people: 0, escalado: 0, undispatched: 0, overdue: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 })
				let emeaQueue = resumen
					.filter (item => item.role.startsWith("EMEA "))
					.reduce (sumAllCaseValues, { people: 0, escalado: 0, undispatched: 0, overdue: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 })
				let apacQueue = resumen
					.filter (item => item.role.startsWith("APAC "))
					.reduce (sumAllCaseValues, { people: 0, escalado: 0, undispatched: 0, overdue: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 })
				let partnersQueue = resumen
					.filter (item => ! item.role.startsWith("LATAM ") && ! item.role.startsWith("NA ") && ! item.role.startsWith("EMEA ") && ! item.role.startsWith("APAC ") && item.name !== "Platform Support" && item.name !== "Support" )
					.reduce (sumAllCaseValues, { people: 0, escalado: 0, undispatched: 0, overdue: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 })
				let totalQueue = resumen
					.reduce (sumAllCaseValues, { people: 0, escalado: 0, undispatched: 0, overdue: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 })
				console.log("supportQueue ", supportQueue)
				console.log("LATAM", latamQueue)
				console.log("NA", naQueue)
				console.log("EMEA", emeaQueue)
				console.log("APAC", apacQueue)
				console.log("PARTNER", partnersQueue)
				let resumenNode = reportBody.querySelector(".progressIndicator")
				const resumenNodeInnerHTML = `
									<div class="support-summary-container">
									<table class="list" border="0" cellspacing="0" cellpadding="0">
										<tbody>
											<tr class="headerRow">
												<th scope="col" class="zen-deemphasize">Region</th>
												<th scope="col" class="zen-deemphasize">Total</th>
												<th scope="col" class="zen-deemphasize">People</th>
												<th scope="col" class="zen-deemphasize">Load</th>
												<th scope="col" class="zen-deemphasize">Red Alert</th>
												<th scope="col" class="zen-deemphasize">Overdue</th>
												<th scope="col" class="zen-deemphasize">Undispatched</th>
												<th scope="col" class="zen-deemphasize">S1</th>
												<th scope="col" class="zen-deemphasize">S2</th>
												<th scope="col" class="zen-deemphasize">S3</th>
												<th scope="col" class="zen-deemphasize">S4</th>
											</tr>
											<tr class="dataRow">
												<td class=" dataCell ">Global Support Queue</td>
												<td class=" dataCell booleanColumn">${supportQueue.total}</td>
												<td class=" dataCell booleanColumn">-</td>
												<td class=" dataCell booleanColumn">-</td>
												<td class=" dataCell booleanColumn">${supportQueue.escalado}</td>
												<td class=" dataCell booleanColumn">${supportQueue.undispatched}</td>
												<td class=" dataCell booleanColumn">${supportQueue.overdue}</td>
												<td class=" dataCell booleanColumn">${supportQueue.S1}</td>
												<td class=" dataCell booleanColumn">${supportQueue.S2}</td>
												<td class=" dataCell booleanColumn">${supportQueue.S3}</td>
												<td class=" dataCell booleanColumn">${supportQueue.S4}</td>
											</tr>
											<tr class="dataRow">
												<td class=" dataCell ">Global Platform Queue</td>
												<td class=" dataCell booleanColumn">${platformQueue.total}</td>
												<td class=" dataCell booleanColumn">-</td>
												<td class=" dataCell booleanColumn">-</td>
												<td class=" dataCell booleanColumn">${platformQueue.escalado}</td>
												<td class=" dataCell booleanColumn">${platformQueue.undispatched}</td>
												<td class=" dataCell booleanColumn">${platformQueue.overdue}</td>
												<td class=" dataCell booleanColumn">${platformQueue.S1}</td>
												<td class=" dataCell booleanColumn">${platformQueue.S2}</td>
												<td class=" dataCell booleanColumn">${platformQueue.S3}</td>
												<td class=" dataCell booleanColumn">${platformQueue.S4}</td>
											</tr>
											<tr class="dataRow">
												<td class=" dataCell ">NA</td>
												<td class=" dataCell booleanColumn">${naQueue.total}</td>
												<td class=" dataCell booleanColumn">${naQueue.people}</td>
												<td class=" dataCell booleanColumn">${Math.round(naQueue.total / naQueue.people,2)}</td>
												<td class=" dataCell booleanColumn">${naQueue.escalado}</td>
												<td class=" dataCell booleanColumn">${naQueue.undispatched}</td>
												<td class=" dataCell booleanColumn">${naQueue.overdue}</td>
												<td class=" dataCell booleanColumn">${naQueue.S1}</td>
												<td class=" dataCell booleanColumn">${naQueue.S2}</td>
												<td class=" dataCell booleanColumn">${naQueue.S3}</td>
												<td class=" dataCell booleanColumn">${naQueue.S4}</td>
											</tr>
											<tr class="dataRow">
												<td class=" dataCell ">LATAM</td>
												<td class=" dataCell booleanColumn">${latamQueue.total}</td>
												<td class=" dataCell booleanColumn">${latamQueue.people}</td>
												<td class=" dataCell booleanColumn">${Math.round(latamQueue.total / latamQueue.people, 2)}</td>
												<td class=" dataCell booleanColumn">${latamQueue.escalado}</td>
												<td class=" dataCell booleanColumn">${latamQueue.undispatched}</td>
												<td class=" dataCell booleanColumn">${latamQueue.overdue}</td>
												<td class=" dataCell booleanColumn">${latamQueue.S1}</td>
												<td class=" dataCell booleanColumn">${latamQueue.S2}</td>
												<td class=" dataCell booleanColumn">${latamQueue.S3}</td>
												<td class=" dataCell booleanColumn">${latamQueue.S4}</td>
											</tr>
											<tr class="dataRow">
												<td class=" dataCell ">EMEA</td>
												<td class=" dataCell booleanColumn">${emeaQueue.total}</td>
												<td class=" dataCell booleanColumn">${emeaQueue.people}</td>
												<td class=" dataCell booleanColumn">${Math.round(emeaQueue.total / emeaQueue.people, 2)}</td>
												<td class=" dataCell booleanColumn">${emeaQueue.escalado}</td>
												<td class=" dataCell booleanColumn">${emeaQueue.undispatched}</td>
												<td class=" dataCell booleanColumn">${emeaQueue.overdue}</td>
												<td class=" dataCell booleanColumn">${emeaQueue.S1}</td>
												<td class=" dataCell booleanColumn">${emeaQueue.S2}</td>
												<td class=" dataCell booleanColumn">${emeaQueue.S3}</td>
												<td class=" dataCell booleanColumn">${emeaQueue.S4}</td>
											</tr>							
											<tr class="dataRow">
												<td class=" dataCell ">APAC</td>
												<td class=" dataCell booleanColumn">${apacQueue.total}</td>
												<td class=" dataCell booleanColumn">${apacQueue.people}</td>
												<td class=" dataCell booleanColumn">${Math.round(apacQueue.total / apacQueue.people, 2)}</td>
												<td class=" dataCell booleanColumn">${apacQueue.escalado}</td>
												<td class=" dataCell booleanColumn">${apacQueue.undispatched}</td>
												<td class=" dataCell booleanColumn">${apacQueue.overdue}</td>
												<td class=" dataCell booleanColumn">${apacQueue.S1}</td>
												<td class=" dataCell booleanColumn">${apacQueue.S2}</td>
												<td class=" dataCell booleanColumn">${apacQueue.S3}</td>
												<td class=" dataCell booleanColumn">${apacQueue.S4}</td>
											</tr>
											<tr class="dataRow">
												<td class=" dataCell ">Partners</td>
												<td class=" dataCell booleanColumn">${partnersQueue.total}</td>
												<td class=" dataCell booleanColumn">${partnersQueue.people}</td>
												<td class=" dataCell booleanColumn">${Math.round(partnersQueue.total / partnersQueue.people,2)}</td>
												<td class=" dataCell booleanColumn">${partnersQueue.escalado}</td>
												<td class=" dataCell booleanColumn">${partnersQueue.undispatched}</td>
												<td class=" dataCell booleanColumn">${partnersQueue.overdue}</td>
												<td class=" dataCell booleanColumn">${partnersQueue.S1}</td>
												<td class=" dataCell booleanColumn">${partnersQueue.S2}</td>
												<td class=" dataCell booleanColumn">${partnersQueue.S3}</td>
												<td class=" dataCell booleanColumn">${partnersQueue.S4}</td>
											</tr>
											<tr class="dataRow" style="font-weight: 900;">
												<td class=" dataCell ">TOTAL</td>
												<td class=" dataCell booleanColumn">${totalQueue.total}</td>
												<td class=" dataCell booleanColumn">${totalQueue.people - 2}</td>
												<td class=" dataCell booleanColumn">${Math.round(totalQueue.total / (totalQueue.people - 2),2)}</td>
												<td class=" dataCell booleanColumn">${totalQueue.escalado}</td>
												<td class=" dataCell booleanColumn">${totalQueue.undispatched}</td>
												<td class=" dataCell booleanColumn">${totalQueue.overdue}</td>
												<td class=" dataCell booleanColumn">${totalQueue.S1}</td>
												<td class=" dataCell booleanColumn">${totalQueue.S2}</td>
												<td class=" dataCell booleanColumn">${totalQueue.S3}</td>
												<td class=" dataCell booleanColumn">${totalQueue.S4}</td>
											</tr>
										</tbody>
									</table>
								</div>`
				resumenNode.innerHTML = resumenNodeInnerHTML
				titleNode.textContent = "Support Active Queue (ʘ‿ʘ)"
			}
		}
	} catch (err) {
		console.error(err)
	}
}

function sumAllCaseValues(aggr, ni) {
	return {
		people: aggr.people + 1,
		escalado: aggr.escalado + ni.escalado, 
		undispatched: aggr.undispatched + ni.undispatched, 
		overdue: aggr.overdue + ni.overdue, 
		S1: aggr.S1 + ni.S1, 
		S2: aggr.S2 + ni.S2, 
		S3: aggr.S3 + ni.S3, 
		S4: aggr.S4 + ni.S4, 
		total: aggr.total + ni.total
	}
}

function removeNodesByClass(classname) {
	var reportHeaders = document.getElementsByClassName(classname)
	for (var i = reportHeaders.length - 1; i >= 0; i--) {
		reportHeaders[i].parentNode.removeChild(reportHeaders[i]);
	}	
}

function recurrentUpdate() {
	reviewNextUpdate();
	setTimeout(recurrentUpdate, 10000);
}

recurrentUpdate();

/**
 * DISPATCHER TIMER -- START
 */

function getDispatchTimer(parentElement, caseId) {
	var timerDispatcherContainer = parentElement.querySelector(`[id='timerDispatcher_container_${caseId}']`)
	if (! timerDispatcherContainer) {
		timerDispatcherContainer = document.createElement("DIV");
		timerDispatcherContainer.id = `timerDispatcher_container_${caseId}`
		timerDispatcherContainer.style = "position: fixed; width: 155px; top: 3px; text-align: center; color: #FFFFFF; right: -155px; font-size: 1.7em; background-color: #85144B; transition: right 0.5s ease-out; padding: 5px 10px 5px 5px; border-radius: 5px; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);"
		var timerText = document.createElement("SPAN");
		timerText.id = `timerDispatcher_text_${caseId}`
		timerText.innerText = "10'"
		timerDispatcherContainer.appendChild(timerText)
		if (parentElement) {
			parentElement.appendChild(timerDispatcherContainer)
		} else {
			console.error("PARENT NULL")
		}
	}
	return timerDispatcherContainer
}

function showDispatchTimer(parentElement, caseId) {
	var timerDispatcherContainer = parentElement.querySelector(`[id='timerDispatcher_container_${caseId}']`)
	if (timerDispatcherContainer) {
		timerDispatcherContainer.style.right = "-5px"
	}
}

function hideDispatchTimer(parentElement, caseId) {
	var timerDispatcherContainer = parentElement.querySelector(`[id='timerDispatcher_container_${caseId}']`)
	if (timerDispatcherContainer) {
		timerDispatcherContainer.style.right = "-200px"
	}
}

function runDispatchTimer() {
	var activeTab = document.querySelector(".x-tab-strip-active")
	if (activeTab) {
		if (activeTab.className.indexOf("caseTab")>=0) {
			try {
				var caseBody = document.querySelector("#" + activeTab.id.replace("navigatortab__", "")).querySelectorAll('iframe')[0].contentWindow.document.body
				var status = caseBody.querySelector("#cas7_ilecell").textContent
				var caseId = caseBody.querySelector(".efhpFixed.efhpLeftCollapsed.efhpRightCollapsed.efhpHighlightPanel.efhCompact.efhpConsoleStyle").id.replace("highlight_panel_","")
				var timerContainer = getDispatchTimer(caseBody, caseId);
				if (status === "Work in Progress") {
					var dispatched = caseBody.querySelector("[id='00N34000005gheR_chkbox']").title === "Checked"
					var pBodies = caseBody.getElementsByClassName("pbBody")
					var caseHistoryRows = caseBody.querySelector(`[id='${caseId}_RelatedEntityHistoryList_body']`).querySelectorAll(".dataRow")
					var wipFecha = "";
					for (var j = 0; j < caseHistoryRows.length; j++) {
						var row = caseHistoryRows[j]
						if (row.children.length>=3) {
							if (row.children[0].innerText.trim() !== "") {
								wipFecha = row.children[0].innerText;
							}
							var texto = row.children[2].innerText;
							if (texto.startsWith("Changed Status from ") && texto.endsWith("Work in Progress.")) {
								break
							}
						}
					}
					if (wipFecha !== "") {
						var strDate = wipFecha.replace(/\//g,":").replace(/-/g,":").replace(/ /g,":").split(":");
						var rightnow = new Date()
						var wipFechaDate = rightnow
						if (strDate[5]==='PM' && strDate[3] != 12) {
						   wipFechaDate = new Date(strDate[2], strDate[0]-1, strDate[1], strDate[3] - 0 + 12, strDate[4]) ; 
						} else {
						   wipFechaDate = new Date(strDate[2], strDate[0]-1, strDate[1], strDate[3], strDate[4]) ; 
						}
						
						//["7", "19", "2018", "11", "19", "AM"]
						var millis = (rightnow.getTime() - wipFechaDate.getTime())
						var hours = Math.trunc(millis/1000/60/60)
						var minutes = Math.trunc((millis/1000/60) - hours*60)
						timerContainer.innerHTML = `<span>${hours} Hrs ${minutes} Min</span>`
						showDispatchTimer(caseBody, caseId)
					}
				} else {
					hideDispatchTimer(caseBody, caseId)
				}
			} catch(err) {
				console.error(err)
			}
		}
	}
}

function updateDispatchTimer() {
	runDispatchTimer();
	setTimeout(updateDispatchTimer, 10000);	
}

updateDispatchTimer()

/**
 * DISPATCHER TIMER -- END
 */

