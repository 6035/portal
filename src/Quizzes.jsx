import produce from 'immer';

// TODO: make this configurable

const lecturesStart = new Date(2021, 1, 15, 11).getTime() / 1000;
const lectureDates = [
	[0, 2],
	[0, 3],
	[0, 4],
	[2, 0],
	[2, 1],
	[2, 2],
	[2, 3],
	[2, 4],
	[3, 1],
	[3, 2],
	[3, 3],
	[5, 2],
	[5, 3],
	[6, 0],
	[6, 2],
	[8, 0],
	[8, 1],
	[8, 2],
	[8, 3],
	[9, 2],
	[9, 3],
	[9, 4],
	[10, 0],
	[10, 1],
	[10, 2],
	[10, 3],
	[10, 4],
];

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
	getSubmissionStatusTable() {
		const table = [];
		for (const kerb of this.props.allKerbs) {
			const row = [];
			for (let i = 0; i < this.props.numMiniquizzes; i++) {
				row.push(null);
			}
			table.push(row);
		}
		for (const entry of this.props.quizSubmissions) {
			const quizName = entry['quiz_name'];
			const quizNum = parseInt(quizName.slice(2));
			const rowIndex = this.props.allKerbs.indexOf(entry['kerb']);
			if (table[rowIndex][quizNum] == 0) {
				continue;
			}
			if (quizNum >= lectureDates.length) {
				table[rowIndex][quizNum] = -1;
			}
			else {
				table[rowIndex][quizNum] = 0;
				const submissionSeconds =
					entry['time_processed'] - lecturesStart;
				const submissionDays = submissionSeconds / 60 / 60 / 24;
				const lectureDate = lectureDates[quizNum];
				const lectureDays = lectureDate[0] * 7 + lectureDate[1];
				if (quizNum == 14 && submissionDays < lectureDays - 2) {
					table[rowIndex][quizNum] = -1;
				}
				if (quizNum != 14 && submissionDays < lectureDays - 1) {
					table[rowIndex][quizNum] = -1;
				}
				if (submissionDays > lectureDays + 2) {
					table[rowIndex][quizNum] = 1;
				}
			}
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
		const submissionStatusTable = this.getSubmissionStatusTable();

		const tableDom = [];
		for (const [i, row] of quizFilesTable.entries()) {
			const kerb = this.props.allKerbs[i];
			const rowDom = [];
			for (const [quizNum, cell] of row.entries()) {
				const submissionStatus = submissionStatusTable[i][quizNum];
				let cellClass = 'not-submitted';
				if (submissionStatus == -1) {
					cellClass = 'submitted-early';
				}
				if (submissionStatus == 0) {
					cellClass = 'submitted';
				}
				if (submissionStatus == 1) {
					cellClass = 'submitted-late';
				}
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
