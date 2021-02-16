const NAV_NAMES = [
	'Quizzes',
	'Tests',
	'Derby',
];

class NavBar extends React.Component {
	constructor(props) {
		super(props);
	}
	getHandleClick = (index) => {
		return (e) => {
			e.preventDefault();
			this.props.onNavClick(index);
		};
	};
	render() {
		const linksDom = [];
		for (const [i, navName] of NAV_NAMES.entries()) {
			if (i == 2 && !this.props.phase5Enabled) {
				continue;
			}
			const isCurrent = this.props.navIndex == i;
			linksDom.push(<a
				href="#"
				key={i}
				onClick={this.getHandleClick(i)}
			>
				{isCurrent ? '[' : null}{navName}{isCurrent ? ']' : null}
			</a>)
		}
		return <nav className="main-nav">
			{linksDom}
		</nav>;
	}
};

export { NavBar };
