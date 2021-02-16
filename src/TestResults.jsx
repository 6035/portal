import produce from 'immer';

const PHASE1_TEST_NAMES = [
	'scanner',
	'parser',
];
const TEAM_TEST_NAMES = [
	'semantics',
	'codegen',
	'optimizer',
	'derby',
];

function formatScorePercent(score) {
	if (score == null) {
		return '--';
	}
	return `${(score * 100).toFixed(1)}%`;
}

function formatScore(testset, score) {
	if (score == null) {
		return '--';
	}
	return (testset == 'derby') ?
		`${score.toFixed(2)}x` :
		formatScorePercent(score);
}

function formatTimestamp(timestamp) {
	return new Date(timestamp * 1000).toLocaleString();
}

class TestResults extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const studentsTable = [];
		for (const kerb of this.props.allKerbs) {
			const row = [];
			for (let i = 0; i < PHASE1_TEST_NAMES.length; i++) {
				row.push(null);
			}
			studentsTable.push(row);
		}
		const teamsTable = [];
		for (const team of this.props.allTeams) {
			const row = [];
			for (let i = 0; i < TEAM_TEST_NAMES.length; i++) {
				row.push(null);
			}
			teamsTable.push(row);
		}

		const phase1Repos = this.props.allKerbs.map((kerb) =>
			`${kerb}-phase1`
		);
		for (const row of this.props.testResults) {
			const repoName = row['repo_name'];
			const studentIndex = phase1Repos.indexOf(repoName);
			if (studentIndex != -1) {
				const testIndex = PHASE1_TEST_NAMES.indexOf(row['testset']);
				studentsTable[studentIndex][testIndex] = row['score'];
				continue;
			}
			const teamIndex = this.props.allTeams.indexOf(repoName);
			if (teamIndex != -1) {
				const testIndex = TEAM_TEST_NAMES.indexOf(row['testset']);
				teamsTable[teamIndex][testIndex] = row['score'];
			}
		}

		const phase1HeaderDom = [<th
			key=""
		></th>];
		for (const testName of PHASE1_TEST_NAMES) {
			phase1HeaderDom.push(<th
				key={testName}
				className="test-name"
			>{testName}</th>);
		}
		const teamsHeaderDom = [<th
			key=""
		></th>];
		for (const testName of TEAM_TEST_NAMES) {
			teamsHeaderDom.push(<th
				key={testName}
				className="test-name"
			>{testName}</th>);
		}

		const phase1Dom = [];
		for (const [i, row] of studentsTable.entries()) {
			const kerb = this.props.allKerbs[i];
			const rowDom = [];
			for (const [testNum, score] of row.entries()) {
				const cellText = formatScorePercent(score);
				rowDom.push(
					<td
						key={testNum}
						className="score"
					>{cellText}</td>
				);
			}
			phase1Dom.push(
				<tr key={kerb}>
					<td
						className="row-label"
					>{kerb}</td>
					{rowDom}
					<td>
						<a href={`https://github.com/6035/${kerb}-phase1`}>Repo</a>
					</td>
				</tr>
			);
		}
		const teamsDom = [];
		for (const [i, row] of teamsTable.entries()) {
			const team = this.props.allTeams[i];
			const rowDom = [];
			for (const [testNum, score] of row.entries()) {
				const cellText = formatScore(TEAM_TEST_NAMES[testNum], score);
				rowDom.push(
					<td
						key={testNum}
						className="score"
					>{cellText}</td>
				);
			}
			teamsDom.push(
				<tr key={team}>
					<td
						className="row-label"
					>{team}</td>
					{rowDom}
					<td>
						<a href={`https://github.com/6035/${team}`}>Repo</a>
					</td>
				</tr>
			);
		}

		const phase1TableDom =
			<table className="plain-table">
				<thead>
					<tr>
						{phase1HeaderDom}
					</tr>
				</thead>
				<tbody>
					{phase1Dom}
				</tbody>
			</table>;
		const teamsTableDom =
			(teamsDom.length == 0) ? null :
			<table className="plain-table">
				<thead>
					<tr>
						{teamsHeaderDom}
					</tr>
				</thead>
				<tbody>
					{teamsDom}
				</tbody>
			</table>;

		const dbDom = [];
		for (const row of this.props.testResults) {
			const scoreText = formatScore(row['testset'], row['score']);
			dbDom.push(<tr
				key={row['id']}
			>
				<td>{row['repo_name']}</td>
				<td>{row['testset']}</td>
				<td>{scoreText}</td>
				<td>{formatTimestamp(row['time_processed'])}</td>
				<td>{row['message']}</td>
			</tr>);
		}
		dbDom.reverse();

		const dbTableDom =
			(dbDom.length == 0) ? null :
			<table className="plain-table">
				<thead>
					<tr>
						<th>Repo</th>
						<th>Testset</th>
						<th>Score</th>
						<th>Time processed</th>
						<th>Message</th>
					</tr>
				</thead>
				<tbody>
					{dbDom}
				</tbody>
			</table>;

		let teamTimeUsedDom = null;
		if (this.props.teamName != null) {
			let teamTimeUsed = 0;
			for (const row of this.props.webhooksLog) {
				if (row['repo_name'] == this.props.teamName) {
					teamTimeUsed += row['time_used'];
				}
			}
			teamTimeUsedDom = <div>
				Total grader time used by team: <b>{Math.round(teamTimeUsed / 1000)}</b> seconds
			</div>;
		}

		let reposInQueueListDom = <span>None</span>;
		if (this.props.reposInQueue != null && this.props.reposInQueue.length > 0) {
			reposInQueueListDom = [];
			for (let i = 0; i < this.props.reposInQueue.length; i++) {
				if (i != 0) {
					reposInQueueListDom.push(<span
						key={2*i-1}
					>, </span>);
				}
				reposInQueueListDom.push(<b
					key={2*i}
				>{this.props.reposInQueue[i]}</b>);
			}
		}

		return <div>
			{phase1TableDom}
			{teamsTableDom}
			{teamTimeUsedDom}
			<div>
				Repositories in grading queue: {reposInQueueListDom}
			</div>
			{dbTableDom}
		</div>;
	}
};

export { TestResults };
