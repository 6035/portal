import produce from 'immer';
import { ApiManager } from './httpApi.js';

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.tokenInput = null;
		this.apiManager = new ApiManager(this.props.serverDomain);
		this.state = {
			waitingForServer: false,
			tokenInputValue: '',
			loginError: '',
		};
	}
	componentDidMount() {
		this.focusTokenInput();
		const savedToken = localStorage.getItem('token');
		if (savedToken != null) {
			this.doLogin(savedToken);
		}
	}
	componentDidUpdate() {
		this.focusTokenInput();
	}
	focusTokenInput = () => {
		if (this.tokenInput != null) {
			this.tokenInput.focus();
		}
	};
	doLogin = (token) => {
		this.setState(produce((state) => {
			state.waitingForServer = true;
		}));
		this.apiManager.login(token, () => {
			localStorage.setItem('token', token);
			this.setState(produce((state) => {
				// now we're waiting for higher layer code to do stuff,
				// so don't set waitingForServer to continue showing the message
				state.tokenInputValue = '';
				state.loginError = '';
			}));
			this.props.onLoginSuccess(token);
		}, (msg) => {
			this.setState(produce((state) => {
				state.waitingForServer = false;
				state.tokenInputValue = '';
				state.loginError = msg;
			}));
		});
	};
	handleChangeToken = (e) => {
		this.setState(produce((state) => {
			state.tokenInputValue = e.target.value;
		}));
	}
	handleSubmitToken = (e) => {
		e.preventDefault();
		this.doLogin(this.state.tokenInputValue.trim());
	};
	render() {
		if (this.state.waitingForServer) {
			return <div className="loginContainer">
				Authenticating...
			</div>;
		}
		return <div className="loginContainer">
			<form onSubmit={this.handleSubmitToken}>
				<div style={{
					marginBottom: '10px',
				}}>Enter API token</div>
				<div>
					<input
						onChange={this.handleChangeToken}
						ref={(el) => {this.tokenInput = el;}}
					/>
					<button type="submit">Enter</button>
				</div>
				<div className="errorMessage">
					{ this.state.loginError }
				</div>
			</form>
		</div>;
	}
};

export { Login };
