class DerbyLeaderboard extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		if (this.props.derbyTable == null) {
			return <div className="derby-msg">
				Retrieving scoreboard...
			</div>;
		}
		const rowsDom = [];
		for (const [i, row] of this.props.derbyTable.entries()) {
			const commitStr = row['commit'].slice(0, 6);
			rowsDom.push(<tr
				key={row['name']}
			>
				<td>{i+1}</td>
				<td>{row['name']}</td>
				<td>{commitStr}</td>
				<td>{row['score'].toFixed(2)}x</td>
				<td>{Math.round(row['timeUsed'] / 1000)}s</td>
				<td>{row['inQueue'] ? 'IN QUEUE' : '--'}</td>
			</tr>);
		}
		return (rowsDom.length > 0) ?
			<table className="plain-table">
				<thead>
					<tr>
						<th>No.</th>
						<th>Team</th>
						<th>Commit</th>
						<th>Score</th>
						<th>Priority</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{rowsDom}
				</tbody>
			</table> :
			<div className="derby-msg">
				No submissions yet!
			</div>;
	}
};

export { DerbyLeaderboard };
