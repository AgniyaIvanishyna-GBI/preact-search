import { h, Component } from 'preact';
import Search from './search';

export default class App extends Component {
	render() {
		return (
			<div id="app">
				<Search />
			</div>
		);
	}
}
