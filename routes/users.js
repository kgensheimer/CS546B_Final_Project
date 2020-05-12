const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const data = require("../data");
const users = data.users;

router.get('/', async (req, res) => {
	if (!req.session.user) {
		return res.render('login', {
            title: 'Hangman Login',
            layout: 'navnolinks'
		});
	} else {
		res.redirect('/dashboard');
	}
});


router.post('/login', async (req, res) => {

	let { loginEmail, loginPassword } = req.body;
	
	let user, userFound, match;

	try {
		user = await users.getUserByEmail(loginEmail);
		userFound = true;
		match = await bcrypt.compare(loginPassword, user.hashedPassword);
	} catch (err) {
		console.log(err);
		userFound = false;
	}


	if (!userFound || !match) {
		res.status(401).render('login', {
			title: 'Login',
			loginError: 'Invalid username and/or password.',
			layout: 'navnolinks'
		});
		return;
	}

	let userInfo = {
		_id: user._id,
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		city: user.city,
		state: user.state,
		gamesWon: user.gamesWon,
		gamesLost: user.gamesLost
	}
	
	req.session.user = userInfo;
	res.redirect('/dashboard');
});

router.post('/signup', async (req, res) => {
	let { signupEmail, signupPassword, signupFirstName, signupLastName, signupCity, signupState } = req.body;

	let hashedPassword = await bcrypt.hash(signupPassword, 16);

	try {
		const user = await users.addUser(signupEmail, hashedPassword, signupFirstName, signupLastName, signupCity, signupState);
	} catch (err) {
		// Email already exists
		let signupInfo = {
			email: signupEmail,
			password: signupPassword,
			firstName: signupFirstName,
			lastName: signupLastName,
			city: signupCity,
			state: signupState
		}
		res.status(401).render('login', {
			title: 'Login',
			signupError: err.message,
			layout: 'navnolinks',
			signupAttempt: signupInfo
		});
		return;
	}

	//Successful signup, start a new session with the newly created user account
	const user = await users.getUserByEmail(signupEmail);

	let userInfo = {
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		city: user.city,
		state: user.state,
		gamesPlayedIDs: user.gamesPlayedIDs,
		gamesWonIDs: user.gamesWonIDs,
		gamesLostIDs: user.gamesLostIDs
	}

	req.session.user = userInfo;
	res.redirect('/dashboard');

});

router.get('/logout', async (req, res) => {
	req.session.destroy();
	res.render('logout', {
		title: 'Logged Out',
		layout: 'navnolinks'
	});
});

module.exports = router;
