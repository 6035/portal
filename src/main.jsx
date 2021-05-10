import produce from 'immer';
import { WebSocketManager } from './ws.js';
import { Login } from './Login.jsx';
import { NavBar } from './NavBar.jsx';
import { Quizzes } from './Quizzes.jsx';
import { TestResults } from './TestResults.jsx';
import { DerbyLeaderboard} from './DerbyLeaderboard.jsx';

import './main.scss';

const SERVER_DOMAIN = '6035-aws.krawthekrow.me';

class Main extends React.Component {
	constructor(props) {
		super(props);

		let navIndex = localStorage.getItem('navIndex');
		if (navIndex == null) {
			navIndex = 1;
		}

		this.state = {
			auth: false,
			isAdmin: false,
			name: null,
			teamName: null,
			allKerbs: [],
			allTeams: [],
			db: {
				'webhooks_log': [],
				'quiz_submissions': [],
				'test_results': [],
			},
			quizFiles: [],
			numMiniquizzes: null,
			testsQueueCurrent: null,
			testsQueuePending: null,
			navIndex: navIndex,
			phase5Enabled: false,
			derbyTable: null,
		};
		this.token = null;
		this.ws = new WebSocketManager(
			SERVER_DOMAIN,
			this.handleWsOpen,
			this.handleWsMessage
		);
		window.main = this;
	}
	handleWsOpen = () => {
		this.ws.send({
			'type': 'login',
			'token': this.token,
		});
	};
	handleWsAuth = (msg) => {
		this.setState(produce((state) => {
			state.auth = true;
			state.isAdmin = msg['isAdmin'];
			state.name = msg['name'];
			state.teamName = msg['team'];
			state.allKerbs = msg['allKerbs'];
			state.allKerbs.sort();
			state.allTeams = msg['allTeams'];
			state.allTeams.sort();
			state.numMiniquizzes = msg['numMq'];
			state.phase5Enabled = msg['phase5'];
		}));
	};
	handleWsDbUpdate = (msg) => {
		this.setState(produce((state) => {
			const table = state.db[msg['table']];
			for (const row of msg['rows']) {
				if (
					table.length == 0 ||
					table[table.length-1]['id'] < row['id']
				) {
					table.push(row);
				}
			}
		}));
	};
	handleWsQuizFiles = (msg) => {
		this.setState(produce((state) => {
			state.quizFiles = msg['files'];
		}));
	};
	handleWsInQueue = (msg) => {
		this.setState(produce((state) => {
			state.testsQueueCurrent = msg['current'];
			state.testsQueuePending = msg['pending'];
		}));
	};
	handleWsDerby = (msg) => {
		this.setState(produce((state) => {
			state.derbyTable = msg['table'];
		}));
	};
	handleWsMessage = (msg) => {
		console.log(msg);
		const handlers = {
			'auth': this.handleWsAuth,
			'dbUpdate': this.handleWsDbUpdate,
			'quizFiles': this.handleWsQuizFiles,
			'inQueue': this.handleWsInQueue,
			'derby': this.handleWsDerby,
		};
		handlers[msg['type']](msg);
	};
	handleLoginSuccess = (token) => {
		this.token = token;
		this.ws.init();
	};
	handleNavClick = (index) => {
		localStorage.setItem('navIndex', index);
		this.setState(produce((state) => {
			state.navIndex = index;
		}));
	}
	render() {
		if (!this.state.auth) {
			return <Login
				serverDomain={SERVER_DOMAIN}
				onLoginSuccess={this.handleLoginSuccess}
			/>;
		}
		const teamAppend = (this.state.teamName == null) ?
			null : <span>, team <b>{this.state.teamName}</b></span>;
		const loggedInMsg = <span>Logged in as <b>{this.state.name}</b>{teamAppend}.</span>;
		return <div className="main">
			<div className="loggedInMessage">
				{ loggedInMsg }
			</div>
			<div className="errorMessage">
				{ this.state.apiError }
			</div>
			<NavBar
				navIndex={this.state.navIndex}
				onNavClick={this.handleNavClick}
				phase5Enabled={this.state.phase5Enabled}
			/>
			{ (this.state.navIndex == 0) ?
				<Quizzes
					serverDomain={SERVER_DOMAIN}
					allKerbs={this.state.allKerbs}
					quizFiles={this.state.quizFiles}
					quizSubmissions={this.state.db.quiz_submissions}
					numMiniquizzes={this.state.numMiniquizzes}
				/> : null
			}
			{ (this.state.navIndex == 1) ?
				<TestResults
					teamName={this.state.teamName}
					allKerbs={this.state.allKerbs}
					allTeams={this.state.allTeams}
					testResults={this.state.db.test_results}
					webhooksLog={this.state.db.webhooks_log}
					testsQueueCurrent={this.state.testsQueueCurrent}
					testsQueuePending={this.state.testsQueuePending}
				/> : null
			}
			{ (this.state.navIndex == 2) ?
				<DerbyLeaderboard
					derbyTable={this.state.derbyTable}
				/> : null
			}
		</div>;
	}
};

const domContainer = document.querySelector("#mainContainer");
ReactDOM.render(<Main />, domContainer);
