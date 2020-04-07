function zoomGraphX(minDate, maxDate) {
	g.updateOptions({
	  dateWindow: [minDate, maxDate]
	});
	showXDimensions(minDate, maxDate);
}


function get(url) {
	
	// Return a new promise.
	return new Promise(function(resolve, reject) {
		// Do the usual XHR stuff
		var req = new XMLHttpRequest();
		req.open('GET', url);
		req.onload = function() {
		  // This is called even on 404 etc
		  // so check the status
			if (req.status == 200) {
				// Resolve the promise with the response text
				EnergyData = Papa.parse(req.response ,{
					header: false,
					dynamicTyping: true
					}
					);
					
				EnergyData.data.splice(0,1);
				
				for (i=0;i<EnergyData.data.length;i++) {
					EnergyData.data[i][0]=new Date(EnergyData.data[i][0]);
				}
				resolve(EnergyData.data);
			
				//resolve(req.response);
			} else {
				// Otherwise reject with the status text
				// which will hopefully be a meaningful error
				reject(Error(req.statusText));
			}
		};

		// Handle network errors
		req.onerror = function() {
			reject(Error("Network Error"));
		};
		// Make the request
		req.send();
  });
}

function histogram(data, size) {
    var length = data.length;
    var min = Math.min.apply(null,data);
    var max = Math.max.apply(null,data);
    var bins = Math.ceil((max - min + 1) / size);
    var histogram = [];
	
    for (var i = 0; i < bins; i++) {
		histogram[i] = [];
		histogram[i][0] = min+i*size;
		histogram[i][1] = 0;
	}
    for (var i = 0; i < length; i++) {
        histogram[Math.floor((data[i] - min) / size)][1]++;
	}
    return histogram;
}

function sumFun(total, num) {
  return total + num;
}

function sumFun2(total,num) {
	
	
}

function sanitize(string) {
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		"/": '&#x2F;',
		//"`": '&grave;',
	};
	const reg = /[&<>"'/]/ig;
	return string.replace(reg, (match)=>(map[match]));
}

function downsample(data,num) {
	
	var i,j,k;
	var res=[]; // result
	var L=data.length;
	var L2=data[0].length;
	var tot=Math.ceil(L/num);
	
	if (L2>1) {
		
		for (i=0;i<L;i++) {
			if (i%num==0) {
				j=i/num;
				res[j]=[];
				res[j][0]=data[i][0]; // keep the first date
				for (let k=1;k<L2;k++) {
					res[j][k]=0;
				}
			}
			for (let k=1;k<L2;k++) {
				res[j][k]+=data[i][k]/num;
			}
		}
	
	} else {
		
		for (j=0;j<tot;j++) {
			res[j]=data.splice(0,num).reduce(sumFun);
		}
	}
	
	return res;
	
}