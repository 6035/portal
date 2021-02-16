class ApiManager {
	constructor(serverDomain) {
		this.endpoint = `https://${serverDomain}`;
	}
	doApiCall(method, path, data, onresp, onerr) {
		const xhr = new XMLHttpRequest();
		if (!xhr) {
			onerr('xhr unsupported, please use a modern browser');
			return;
		}
		xhr.onreadystatechange = () => {
			if (xhr.readyState != XMLHttpRequest.DONE) {
				return;
			}
			if (xhr.responseText == '') {
				onerr('server not responding, please try again in a few minutes');
				return;
			}
			const msg = JSON.parse(xhr.responseText)['m'];
			if (xhr.status == 200) {
				onresp(msg);
			}
			else {
				onerr(msg);
			}
		};
		xhr.open(method, `${this.endpoint}${path}`, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.withCredentials = true;
		xhr.send(JSON.stringify(data));
	}
	login(token, onresp, onerr) {
		this.doApiCall('POST', '/login', {
			'token': token,
		}, onresp, onerr);
	}
};

export { ApiManager };
