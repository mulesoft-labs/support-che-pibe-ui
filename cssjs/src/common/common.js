
export function isDue(str) {
	var rightnow = new Date((new Date()).getTime());
	var strDate = str.replace(/\//g,":").replace(/-/g,":").replace(/ /g,":").split(":");
	var updatedue = new Date(strDate[2], strDate[0], strDate[2], strDate[3], strDate[4], strDate[5]) ; 
	if (strDate[5]==='PM') {
	   updatedue = new Date(strDate[2], strDate[0]-1, strDate[1], strDate[3] - 0 + 12, strDate[4]) ; 
	} else {
	   updatedue = new Date(strDate[2], strDate[0]-1, strDate[1], strDate[3], strDate[4]) ; 
	}

	return (rightnow>updatedue)
}

export function daysToDueDate(str) {
	const rightnow = new Date((new Date()).getTime());
	const strDate = str.replace(/\//g,":").replace(/-/g,":").replace(/ /g,":").split(":");
	/// new Date(year, month, day, hours, minutes, seconds, milliseconds)
	let updatedue = new Date(strDate[2], strDate[0]-1, strDate[1], 0, 0, 0) ; 
	const timeDiff = updatedue.getTime() - rightnow.getTime();
	const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	return (diffDays)
}

const severitiesWeight = {
	"S1": 21,
	"S2": 13,
	"S3": 8,
	"S4": 5,
}

export function calculateCaseBurnout(severity, isEscalated, isAIR, dueDate, isDispatchComplete) {
	let b = 0
	if (severitiesWeight[severity]) {
		b = severitiesWeight[severity]
		if (isDispatchComplete) {
			if (isEscalated) {
				b = b + 5
			}
			if (isDue(dueDate)) {
				b = b + 3
			} else if (daysToDueDate(dueDate) <= 0) {
				b = b + 1
			}
			if (isAIR) {
				b = b - Math.floor(severitiesWeight[severity]/2)
			}
		} else {
			b = b - severitiesWeight[severity] + 2
			if (isDue(dueDate)) {
				b = b + 3
			} else if (daysToDueDate(dueDate) <= 0) {
				b = b + 1
			}
		}
	}
	return b
}

export function calculateBurnout(s1s, s2s, s3s, s4s, escalatedCnt, airCnt, dueCnt, closeDueCnt) {
	return (s1s*21 + s2s*13 + s3s*8 + s4s*5) + escalatedCnt*5 + dueCnt*2 + closeDueCnt - airCnt*8
}