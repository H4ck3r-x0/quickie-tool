import React, { Component } from "react";
import moment from "moment";
import firebase from "../firebase";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			url: "",
			urls: []
		};
	}

	componentDidMount() {
		this.setState({ loading: true });
		const db = firebase.firestore();
		db.collection("urls").onSnapshot(snapshot => {
			const data = [];
			snapshot.forEach(doc => {
				data.push(doc.data());
				this.setState({ urls: data });
			});
			this.setState({ loading: false });
		});
	}

	updateInput = event => {
		this.setState({
			url: event.target.value
		});
	};
	shareURL = event => {
		event.preventDefault();
		const db = firebase.firestore();

		const userRef = db.collection("urls").add({
			url: this.state.url,
			created_at: new Date().getTime()
		});
		this.setState({
			url: ""
		});
	};
	renderList() {
		if (!this.state.loading) {
			return (
				<ul>
					{this.state.urls.map((item, key) => (
						<li
							key={key}
							className="flex flex-col text-sm bg-gray-200 px-4 py-1 mb-3 border-l-2 border-red-400 rounded-lg shadow-md "
						>
							<span className="flex flex-row justify-between items-center font-bold text-red-400">
								<span> Someone just shared a link</span>
								<span className="flex text-xs font-bold text-gray-500 ">
									{moment(item.created_at).format(
										"YYYY-MM-DD, hh:mm:ss A"
									)}
								</span>
							</span>
							<span className="text-xs text-blue-600 pl-3 mt-1">
								<i className="fas fa-hand-point-right text-gray-700 mr-2"></i>

								<p
									dangerouslySetInnerHTML={replaceURLWithHTMLLinks(
										item.url
									)}
								></p>
							</span>
						</li>
					))}
				</ul>
			);
		} else {
			return (
				<div className="flex items-center justify-center">
					<Loader
						type="Puff"
						color="#f234"
						height={100}
						width={100}
						timeout={3000} //3 secs
					/>
				</div>
			);
		}
	}
	render() {
		return (
			<div>
				<div className="container mx-auto w-full p-6">
					<div className="mb-10">
						<form onSubmit={this.shareURL}>
							<input
								name="url"
								type="text"
								className="flex w-full px-4 py-3 border-b-3 border-gray-300 focus:outline-none shadow"
								placeholder="Share a url with your friends"
								onChange={this.updateInput}
								value={this.state.url}
							/>
						</form>
					</div>
					<div className="url-list">{this.renderList()}</div>
				</div>
			</div>
		);
	}
}

function replaceURLWithHTMLLinks(text) {
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
	return { __html: text.replace(exp, "<a target='blank' href='$1'>$1</a>") };
}

export default App;
