import produce from 'immer';

class Quizzes extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			shownFiles: [],
		};
	}
	getQuizFilesTable() {
		const table = [];
		for (const kerb of this.props.allKerbs) {
			const row = [];
			for (let i = 0; i < this.props.numMiniquizzes; i++) {
				row.push([]);
			}
			table.push(row);
		}
		for (const fileSpec of this.props.quizFiles) {
			const quizName = fileSpec[1].split('.')[0];
			const quizNum = parseInt(quizName.slice(2));
			const rowIndex = this.props.allKerbs.indexOf(fileSpec[0]);
			table[rowIndex][quizNum].push(fileSpec);
		}
		return table;
	}
	handleKerbClick(kerb) {
		const quizFilesTable = this.getQuizFilesTable();
		this.setState(produce((state) => {
			state.shownFiles = [];
			const rowIndex = this.props.allKerbs.indexOf(kerb);
			for (const cell of quizFilesTable[rowIndex]) {
				state.shownFiles.push(...cell);
			}
		}));
	}
	handleCellClick(kerb, quizNum) {
		const quizFilesTable = this.getQuizFilesTable();
		this.setState(produce((state) => {
			const rowIndex = this.props.allKerbs.indexOf(kerb);
			state.shownFiles = quizFilesTable[rowIndex][quizNum];
		}));
	}
	handleQuizNumClick(quizNum) {
		const quizFilesTable = this.getQuizFilesTable();
		this.setState(produce((state) => {
			state.shownFiles = [];
			for (const [i, row] of quizFilesTable.entries()) {
				state.shownFiles.push(...row[quizNum]);
			}
		}));
	}
	render() {
		const quizFilesTable = this.getQuizFilesTable();

		const tableDom = [];
		for (const [i, row] of quizFilesTable.entries()) {
			const kerb = this.props.allKerbs[i];
			const rowDom = [];
			for (const [quizNum, cell] of row.entries()) {
				const cellClass = (cell.length > 0) ?
					'submitted' : 'not-submitted';
				rowDom.push(
					<td
						key={quizNum}
						className={cellClass}
						onClick={() => {this.handleCellClick(kerb, quizNum);}}
					></td>
				);
			}
			tableDom.push(
				<tr key={kerb}>
					<td
						onClick={() => {this.handleKerbClick(kerb);}}
						className="kerb-select"
					>{kerb}</td>
					{rowDom}
					<td>
						<a href={`https://github.com/6035/${kerb}-quizzes`}>Repo</a>
					</td>
				</tr>
			);
		}
		const headerDom = [
			<th key={-1}></th>
		];
		for (let i = 0; i < this.props.numMiniquizzes; i++) {
			headerDom.push(
				<th
					key={i}
					className="quiz-select"
					onClick={() => {this.handleQuizNumClick(i);}}
				>{i.toString().padStart(2, '0')}</th>
			);
		}

		const quizFilesDom = [];
		const imageExts = [
			'jpeg', 'jpg', 'bmp', 'png', 'gif', 'svg', 'tif', 'tiff', 'webp'
		];
		for (const fileSpec of this.state.shownFiles) {
			const fileName = `${fileSpec[0]}/${fileSpec[1]}`;
			const url = `https://${this.props.serverDomain}/quiz/${fileName}`; 
			const ext = fileSpec[1].split('.').pop();
			let quizFileDom = null;
			if (imageExts.includes(ext)) {
				quizFileDom = <img className="w-100" src={url} crossOrigin="use-credentials" />;
			}
			else if (ext == 'pdf') {
				quizFileDom = <object className="w-100" height="800" data={url} crossOrigin="use-credentials" type="application/pdf" />;
			}
			else {
				quizFileDom = <embed className="w-100" src={url} crossOrigin="use-credentials" />;
			}
			quizFilesDom.push(<div key={fileName}>
				<div>{ fileName }</div>
				{ quizFileDom }
			</div>);
		}

		return <div>
			<table className="submissions-table">
				<thead>
					<tr>
						{headerDom}
					</tr>
				</thead>
				<tbody>
					{tableDom}
				</tbody>
			</table>
			<div>
				{quizFilesDom}
			</div>
		</div>;
	}
};

export { Quizzes };
